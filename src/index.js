const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
 // res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  io.emit("message",{id:socket.id, message:"I am connected"});

  socket.on("login",(userid,password)=>{
    console.log(userid +"logged in with password :"+password);
  })

  socket.on("message",(msg)=>{
    io.emit("message",{id:socket.id, message:msg});
    console.log(msg);
  })

  socket.on("disconnect",()=>{
    io.emit("message",{id:socket.id, message:"I am connected"});
    console.log(socket.id+" is disconnected");
  });
});




server.listen(3000, () => {
  console.log('listening on *:3000');
});