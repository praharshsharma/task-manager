const express = require('express');
const router = express.Router();
const {Task} = require("../batabase/db");

//Create Task
router.post('/saveTask', async (req, res) => {

    const{status,priority,dueDate,createdBy,assignedTo,description,name,roles } = req.body;
    try
    {
        const task = await Task.create({
        createdBy,
        assignedTo,
        status,
        priority,
        dueDate,
        description,
        name,
        roles
        });
        
        res.status(201).json(task);
    }
    catch{
        res.status(400).send("Invalid Task data");
    }
});
  
// Get tasks
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        const tasks = await Task.find({
            $or: [
                { createdBy: userId },
                { assignedTo: userId }
            ]
        }).populate('assignedTo', 'username');

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});
  
// Update task
router.put('/:id', async (req, res) => {
    try
    {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(task);
    }
    catch
    {
        res.status(500).json({ msg: "Server error" });
    }
});
  
router.delete('/:id', async (req, res) => {
    try
    {
        await Task.findByIdAndDelete(req.params.id);
        res.status(204).send();
    }
    catch
    {
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;