import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import TaskForm from "./TaskForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Meteors } from "./ui/meteors";
import { AnimatePresence, motion } from "framer-motion";
import io from 'socket.io-client';

const base_url = "https://tasks-backend-host.onrender.com";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [dueDateFilter, setDueDateFilter] = useState("");
    const [collaboratorFilter, setCollaboratorFilter] = useState("");
    const socket = io(base_url, {transports: ['websocket', 'polling', 'flashsocket']});
    const { user } = useUser();

  useEffect(() => {

  if(socket)
  {
        let userId = localStorage.getItem("userId");
        if(!userId)
        {
            localStorage.setItem("userId",user.id);
            userId = localStorage.getItem("userId"); 
        }
    
        socket.on('connect', () => {
            socket.emit('join_room',userId)
        });

        socket.on('assignTask', (task) => {
            console.log(task);
            fetchTasks();
            toast.success("New Task asigned to you");
        });
        socket.on('deleteTask', (task) => {
            console.log(task);
            fetchTasks();
            toast.success("your task is deleted successfully!");
        });

        socket.on('periorityChange', (task) => {
            console.log(task);
            fetchTasks();
            toast.success("your task status changed successfully!");
        });

        socket.on('statusChange', (task) => {
            console.log(task);
            fetchTasks();
            toast.success("your task status changed successfully!");
        });
    
    }
    // fetchTasks(); 
    }, []);

    useEffect(() => {
        fetchTasks();        
    }, []);

    useEffect(() => {
        applyFilters();
    }, [tasks, statusFilter, priorityFilter, dueDateFilter, collaboratorFilter]);


    const canEditTask = (task) => 
    {
        return task.createdBy === user.id || task.createdBy === task.assignedTo[0] || task.roles !== 'viewer';
    };
   

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            const response = await axios.get(
                base_url+"/api/tasks",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        userId: userId,
                    },
                }
            );

            const sortedTasks = sortTasksByPriority(response.data);
            setTasks(sortedTasks);;
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setLoading(false);
        }
    };

    const handleSaveTask = (savedTask) => {

        if(savedTask.createdBy != savedTask.assignedTo[0])
        {
            socket.emit('join_room',savedTask.assignedTo[0]);
            socket.emit('assignTask',{task:savedTask,toUserId:savedTask.createdBy,fromUserId:savedTask.assignedTo[0]})
        }
        fetchTasks();
        setShowForm(false);
        toast.success("Task added successfully!");

        socket.emit('join_room',savedTask.createdBy);
    };

    const handleDeleteTask = async (task) => {
        if (!canEditTask(task)) {
            toast.error("You do not have permission to delete this task.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                base_url+`/api/tasks/${task._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if(task.createdBy != task.assignedTo[0])
            {
                socket.emit('join_room',task.assignedTo[0]);
                socket.emit('deleteTask',{toUserId:task.createdBy,fromUserId:task.assignedTo[0]})
            }
            fetchTasks();
            setShowForm(false);       
            socket.emit('join_room',task.createdBy);
            toast.success("Task deleted successfully!");
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task.");
        }
    };

    const handleChangePriority = async (task,taskId, newPriority) => {
        if (!canEditTask(task)) {
            toast.error("You do not have permission to change the priority of this task.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                base_url+`/api/tasks/${taskId}`,
                { priority: newPriority },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
           
            if(task.createdBy != task.assignedTo[0])
            {
                socket.emit('join_room',task.assignedTo[0]);
                socket.emit('periorityChange',{toUserId:task.createdBy,fromUserId:task.assignedTo[0]})
            }

            fetchTasks();
            setShowForm(false);       
            socket.emit('join_room',task.createdBy);
            toast.success("Priority changed successfully!");
        } catch (error) {
            console.error("Error changing priority:", error);
            toast.error("Failed to change priority.");
        }
    };

    const handleChangeStatus = async (task,taskId, newStatus) => {
        if (!canEditTask(task)) {
            toast.error("You do not have permission to change the status of this task.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                base_url+`/api/tasks/${taskId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            if(task.createdBy != task.assignedTo[0])
            {
                socket.emit('join_room',task.assignedTo[0]);
                socket.emit('statusChange',{toUserId:task.createdBy,fromUserId:task.assignedTo[0]})
            }
    
            fetchTasks();
            setShowForm(false);       
            socket.emit('join_room',task.createdBy);
            toast.success("Status changed successfully!");
        } catch (error) {
            console.error("Error changing status:", error);
            toast.error("Failed to change status.");
        }
    };
    

    const sortTasksByPriority = (tasks) => {
        const priorityOrder = {
            High: 1,
            Medium: 2,
            Low: 3,
        };
        return tasks.slice().sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    };

    const isToday = (someDate) => {
        const today = new Date();
        const dateToCheck = new Date(someDate); // Ensure someDate is converted to Date object
    
        return (
            dateToCheck.getDate() === today.getDate() &&
            dateToCheck.getMonth() === today.getMonth() &&
            dateToCheck.getFullYear() === today.getFullYear()
        );
    };
    
    // Utility function to check if a date is within the current week
    const isThisWeek = (someDate) => {
        const today = new Date();
        const dateToCheck = new Date(someDate); // Ensure someDate is converted to Date object
    
        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
    
        return dateToCheck >= weekStart && dateToCheck <= weekEnd;
    };
    
    // Utility function to check if a date is within the next week
    const isNextWeek = (someDate) => {
        const today = new Date();
        const dateToCheck = new Date(someDate); // Ensure someDate is converted to Date object
    
        const nextWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
        const nextWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 13);
    
        return dateToCheck >= nextWeekStart && dateToCheck <= nextWeekEnd;
    };

    const applyFilters = () => {
        let filtered = [...tasks];

        if (statusFilter) {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        if (priorityFilter) {
            filtered = filtered.filter(task => task.priority === priorityFilter);
        }

        if (dueDateFilter === "today") {
            filtered = filtered.filter(task => isToday(task.dueDate)); // Implement isToday function
        } else if (dueDateFilter === "thisWeek") {
            filtered = filtered.filter(task => isThisWeek(task.dueDate)); // Implement isThisWeek function
        } else if (dueDateFilter === "nextWeek") {
            filtered = filtered.filter(task => isNextWeek(task.dueDate)); // Implement isNextWeek function
        }
console.log(collaboratorFilter)
        if (collaboratorFilter === "creator") {
            filtered = filtered.filter(task => task.roles == 'creator');
        } else if (collaboratorFilter === "collaborator") {
            filtered = filtered.filter(task => task.roles == 'collaborator');
        } else if (collaboratorFilter === "viewer") {
            filtered = filtered.filter(task => task.roles == 'viewer');
        }

        setFilteredTasks(filtered);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredTasks(tasks); // Reset filtered tasks to all tasks when search query is empty
            return;
        }

        const filtered = tasks.filter(task =>
            task.name.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredTasks(filtered);
    };

    

    return (
        <div className="flex flex-col justify-center">
            <h1 className="text-white flex font-semibold text-5xl justify-center">
                Task Dashboard
            </h1>
            <div className="flex my-10 h-12 animate-shimmer items-center justify-center">
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                >
                    Add Task
                </button>
            </div>
            <div className="flex justify-center">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="px-4 py-2 mb-4 rounded-lg border bg-transparent text-white border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
            </div>
            <div className="flex justify-center space-x-4 mb-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 text-white bg-transparent rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    <option className="bg-black" value="">All Statuses</option>
                    <option className="bg-black" value="To Do">To Do</option>
                    <option className="bg-black" value="In Progress">In Progress</option>
                    <option className="bg-black" value="Done">Done</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border text-white bg-transparent border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    <option className="bg-black" value="">All Priorities</option>
                    <option className="bg-black" value="Low">Low</option>
                    <option className="bg-black" value="Medium">Medium</option>
                    <option className="bg-black" value="High">High</option>
                </select>
                <select
                    value={dueDateFilter}
                    onChange={(e) => setDueDateFilter(e.target.value)}
                    className="px-4 py-2 text-white bg-transparent rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    <option className="bg-black" value="">All Due Dates</option>
                    <option className="bg-black" value="today">Today</option>
                    <option className="bg-black" value="thisWeek">This Week</option>
                    <option className="bg-black" value="nextWeek">Next Week</option>
                    {/* Add more options as per your need */}
                </select>
                <select
                    value={collaboratorFilter}
                    onChange={(e) => setCollaboratorFilter(e.target.value)}
                    className="px-4 py-2 text-white bg-transparent rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                   <option className="bg-black" value="">All collaboration</option>
                    <option className="bg-black" value="creator">Creator</option>
                    <option className="bg-black" value="collaborator">Collaborator</option>
                    <option className="bg-black" value="viewer">Viewer</option>
                </select>
            </div>
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    >
                        <TaskForm onSave={handleSaveTask} onClose={() => setShowForm(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
            {loading ? (
                <p className="text-white text-2xl">Loading...</p>
            ) : (
                
                    <div className="grid p-4 grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-5 lg:gap-6">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task, index) =>
                                task ? (
                                    <div
                                        key={task._id || index}
                                        className="relative mb-4"
                                    >
                                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl" />
                                        <div className="relative shadow-xl bg-gray-900 border border-gray-800 px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start">
                                            <div className="h-5 w-5 rounded-full border flex items-center justify-center mb-4 border-gray-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="h-2 w-2 text-gray-300"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"
                                                    />
                                                </svg>
                                            </div>

                                            <h3 className="text-white text-center capitalize pb-2 font-bold text-xl mt-4">
                                                {task.name}
                                            </h3>
                                            <p className="text-white text-justify font-bold text-xl mt-4">
                                                {task.description}
                                            </p>
                                            <div>
                                                <p className="text-white font-bold text-xl mt-4">
                                                    Priority:
                                                    <select className="bg-gray-900 border ml-6 border-slate-700"
                                                        value={task.priority}
                                                        onChange={(e) =>
                                                            handleChangePriority(task,task._id, e.target.value)
                                                        }
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                    </select>
                                                </p>
                                                <p className="text-white font-bold text-xl mt-4">
                                                    Status:
                                                    <select className="bg-gray-900 border ml-6 border-slate-700 "
                                                        value={task.status}
                                                        onChange={(e) =>
                                                            handleChangeStatus(task,task._id, e.target.value)
                                                        }
                                                    >
                                                        <option value="To Do">To Do</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Done">Done</option>
                                                    </select>
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center pt-4">
                                                <button
                                                    onClick={() => handleDeleteTask(task)}
                                                    className="inline-flex cursor-pointer h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <Meteors number={20} />
                                        </div>
                                    </div>
                                ) : (
                                    <p key={index}>Task is undefined</p>
                                )
                            )
                        ) : (
                            <p className="text-white text-2xl">No tasks added yet!!.</p>
                        )}
                    </div>
                
            )}
            <ToastContainer />
        </div>
    );
}

export default Dashboard;
