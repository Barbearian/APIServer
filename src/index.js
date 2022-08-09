const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.broadcast.emit("message",socket.id+"is connected");

  socket.on("message",({msg})=>{
    socket.broadcast.emit("message",msg);
    console.log(msg);
  })

  socket.on("disconnect",()=>{
    io.emit("message",socket.id+"is disconnected");
  });
});




server.listen(3000, () => {
  console.log('listening on *:3000');
});