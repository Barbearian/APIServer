const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const { type } = require('os');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//app.get('/', (req, res) => {});

//http request
app.get("/hi",(req,res)=>{
  console.log("Someone said hello");
  res.send("Hello this is an hello message from http request");
});

app.post("/postTest",(req,res)=>{
  console.log("Server Received"+req.body.message);
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
  io.emit("message","login",{id:userid, message:"has join the room"});

  socket.on("message",(type,message)=>{
    io.emit("message",type,message);
    console.log(userid+": "+ message);
  })

  socket.on("privateMessage",(key,type,message)=>{
    io.to(key).emit("message",type,message);
    console.log(userid+"->"+key+": "+ message);
  });

  socket.on("RegisterHttp",(message)=>{
    var option = message;
    http.request(option);
    //console.log(message);
  });

  socket.on("disconnect",()=>{
    io.emit("message","disconnect",userid);
    console.log(socket.id+" is disconnected");
  });
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});