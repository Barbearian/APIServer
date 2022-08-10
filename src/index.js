const express = require('express');
const app = express();
const https = require('https');
const server = https.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//app.get('/', (req, res) => {});

//http request
app.get("/hi",(req,res)=>{
  console.log("Someone said hello");
  res.send("Hello this is an hello message from http request");
});

//authenrication
io.use((socket, next)=>{
  const userId = socket.handshake.auth.userId;
  const password = socket.handshake.auth.password;
  
  //a room for this user only
  socket.join(userId);
  console.log(userId +" tried to logged in with password :"+password);
  next();
});

io.on('connection', (socket) => {
  
  const userid = socket.handshake.auth.userId;
  console.log(userid+' is authorized');
  io.emit("message",{id:userid, message:"has join the room"});

  socket.on("message",(msg)=>{
    io.emit("message",msg);
    console.log(userid+": "+ msg);
  })

  socket.on("privateMessage",(key,message)=>{
    io.to(key).emit("message",message);
    console.log(userid+"->"+key+": "+ message);
  });

  socket.on("disconnect",()=>{
    io.emit("message",{id:userid, message:"is disconnected"});
    console.log(socket.id+" is disconnected");
  });
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});