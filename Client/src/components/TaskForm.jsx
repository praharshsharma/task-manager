import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
const base_url = "https://tasks-backend-host.onrender.com";

const TaskForm = ({ onSave, onClose }) => {
    const { user } = useUser();
    const createdBy = user.id;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Low');
    const [status, setStatus] = useState('To Do');
    const [assignedTo, setAssignedTo] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState('creator');
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(base_url+'/api/auth/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const assignedUsers = assignedTo.length === 0 ? [createdBy] : assignedTo;
            const response = await axios.post(base_url+'/api/tasks/saveTask', {
                name,
                description,
                dueDate,
                priority,
                status,
                assignedTo: assignedUsers,
                createdBy,
                roles
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            onSave(response.data);
            onClose(); // Close the form after saving
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const handleRoleChange = (userId, newRole) => {
        setRoles(newRole);
    };
    

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gray-800 w-full p-8 rounded-lg shadow-md relative z-10 max-w-md mx-auto"
        >
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-white mb-6">Add New Task</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300" htmlFor="name">Task Name</label>
                    <input
                        className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Task Name"
                        type="text"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300" htmlFor="description">Description</label>
                    <textarea
                        className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        rows="3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300" htmlFor="dueDate">Due Date</label>
                    <input
                        className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300" htmlFor="priority">Priority</label>
                    <select
                        className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>                        
                        <option value="High">High</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300" htmlFor="status">Status</label>
                    <select
                        className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300" htmlFor="assignedTo">Assign To</label>
                    <select
                        multiple
                        className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo([...e.target.selectedOptions].map(option => option.value))}
                    >
                        {users.map(user => (
                            <option key={user.userId} value={user.userId}>{user.username}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300" htmlFor="roles">Role</label>
                    {assignedTo.map(userId => (
                        <div key={userId} className="flex items-center space-x-4 mb-2">
                            <span className="text-white">{users.find(user => user.userId === userId)?.username}</span>
                            <select
                            className="mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            value={roles.role}
                            onChange={(e) => handleRoleChange(userId, e.target.value)}
                            disabled={userId === createdBy}
                        >
                            <option value="creator">Creator</option>
                            <option value="collaborator">Collaborator</option>
                            <option value="viewer">Viewer</option>
                        </select>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 via-purple-400 to-blue-500 text-white px-4 py-2 font-bold rounded-md hover:opacity-80"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-2 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-500 text-white px-4 py-2 font-bold rounded-md hover:opacity-80"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default TaskForm;
