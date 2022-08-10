const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
 // res.sendFile(__dirname + '/index.html');
});

//authenrication
io.use((socket, next)=>{
  const userId = socket.handshake.auth.userId;
  const password = socket.handshake.auth.password;
  
  console.log(userId +"logged in with password :"+password);
  next();
});

io.on('connection', (socket) => {


  console.log('a user connected');
  io.emit("message",{id:socket.id, message:"I am connected"});

  socket.on("message",(msg)=>{
    io.emit("message",{id:socket.id, message:msg});
    console.log(msg);
  })

  socket.on("privateMessage",(key,message)=>{
    socket.to(key).emit("message",message);
  });

  socket.on("disconnect",()=>{
    io.emit("message",{id:socket.id, message:"I am connected"});
    console.log(socket.id+" is disconnected");
  });
});




server.listen(3000, () => {
  console.log('listening on *:3000');
});