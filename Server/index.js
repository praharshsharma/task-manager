const express = require("express");
const cors = require("cors");
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
});


app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

io.on("connection", (socket) => {
    
    socket.on("join_room", (data) => {
      socket.join(data);
      console.log(`User with id ${socket.id} joined room : ${data}`);
    });

    socket.on('assignTask', ({ task, toUserId, fromUserId }) => {
      socket.to(fromUserId).emit('assignTask', task);
    });

    socket.on('deleteTask', ({ toUserId, fromUserId }) => {
      socket.to(toUserId).emit('deleteTask', fromUserId);
      socket.to(fromUserId).emit('deleteTask', toUserId);
    });

    socket.on('periorityChange', ({ toUserId, fromUserId }) => {
      socket.to(toUserId).emit('periorityChange', fromUserId);
      socket.to(fromUserId).emit('periorityChange', toUserId);
    });

    socket.on('statusChange', ({ toUserId, fromUserId }) => {
      socket.to(toUserId).emit('statusChange', fromUserId);
      socket.to(fromUserId).emit('statusChange', toUserId);
    });

});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});