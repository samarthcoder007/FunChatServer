const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const formatMessage = require('./util/messages')
const { userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./util/users')

const app = express();
const server = http.createServer(app);
const io = socket(server); 

app.use(express.static(path.join(__dirname,'public')))

const botName = 'chatcord bot'

const PORT = 3000 || process.env.PORT;

io.on('connection', socket => {
    console.log("new ws connection...");
    
    socket.on('joinroom', ({username,room}) => {
          const user = userJoin(socket.id, username,room);
          socket.join(user.room);
          console.log(user.room);
          socket.emit('message', formatMessage(botName,"Welcome to chatcord !"));
    socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined`));
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    })
    })

    socket.on('chatMessage', msg=>{
        const user = getCurrentUser(socket.id);
        console.log(user)
         io.to(user.room).emit('message', formatMessage(user.username,msg));
    });

    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
});

server.listen(PORT, () => console.log(`server running at port ${PORT}`));