const path = require('path');
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const formatMessage = require('./util/messages')
const { userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./util/users')

const app = express();
const server = http.createServer(app);
const io = socket(server, {
    cors: {
      origin: "http://localhost:5173"
    }
  }); 

const botName = 'chatcord bot'

const PORT = 3000 || process.env.PORT;

io.on('connection', socket => {
    
    socket.on('joinroom', ({name,room}) => {
        console.log("new connection ...")
          const user = userJoin(socket.id, name,room);
          socket.join(user.room);
          socket.emit('message', formatMessage(botName,"Welcome to chatcord !"));
    socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.name} has joined`));
    console.log(getRoomUsers(user.room))
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    })
    })

    socket.on('chatMessage',(msg,callback)=>{
        const user = getCurrentUser(socket.id);
         io.to(user.room).emit('message', formatMessage(user.name,msg));

         callback()
    });

    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.name} has left the chat`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
});

server.listen(PORT, () => console.log(`server running at port ${PORT}`));