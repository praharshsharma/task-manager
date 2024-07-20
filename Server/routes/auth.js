const express = require('express');
const router = express.Router();
const {User} = require("../batabase/db");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET
const jwt = require('jsonwebtoken');
require('dotenv').config();

//register
router.post("/register",async(req,res) =>{
    const { userId, username, email } = req.body;
    
    try
    {
        let exituser = await User.findOne({
            email:email
        }); // checking if user email exits


        if(!exituser)
        {
            exituser = await User.create({
                userId:userId,
                email:email,
                username:username
            });
        }

        const token = jwt.sign({ userId: userId, username: username, email: email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
        return;
    }
    catch
    {
        res.status(500).send("Something went wrong");
    }
});

router.get('/users',async(req,res)=>{

    try{
        const users = await User.find();
        res.json(users);
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
})

module.exports = router;