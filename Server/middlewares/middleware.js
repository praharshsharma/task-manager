require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET
const jwt = require("jsonwebtoken");

const authverification = (req,res,next) =>{
    const headertoken = req.headers.authorization;
    console.log(headertoken)

    if(!headertoken)
    {
        res.status(401).send("Unauthorized");
        return;
    }

    const token = headertoken.split(' ')[1];
    try
    { 
        const payload = jwt.verify(token,JWT_SECRET);
        req.userId = payload.userId;
        next();
    }
    catch (error)
    {
        return res.status(403).json({
            error:error
        });
    }
}

module.exports = {
    authverification
}