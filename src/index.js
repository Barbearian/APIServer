const express = require('express');
require("dotenv").config();

const app = express();
const http = require('http');
const axios = require("axios");
const https = require('https');
const { type } = require('os');
const server = http.createServer(app);
const { Server } = require("socket.io");
const e = require('express');
var cors = require('cors');
const io = new Server(server);

const url = process.env.SERVER_URL||"";
const port = process.env.SOCKET_PORT||3001;

app.use(cors());
app.use(express.json());
//http request
app.get("/hi",(req,res)=>{
  console.log("Someone said hello");
  res.send("Hello this is an hello message from http request");
});

app.post("/postTest",(req,res)=>{
  console.log("I received post message");
  res.sendStatus(200);
});

app.post("/message",(req,res)=>{
  //io.emit("message",req.body);
  console.log("I received message "+ JSON.stringify(req.body));
  //console.log("I received message "+ req.body);
  if(req.body.type != null && req.body.message != null){
    io.emit("message",req.body.type,req.body.message);
    res.sendStatus(200);
  }else{
    res.status(400);
    res.send("You need have type and message in body");
  }
});

app.post("/nodemessage/messageID/:messageID/messageType/:messageType", (req, res) => {
    console.log("I received message " + JSON.stringify(req.body));
    io.to(req.params.messageID).emit("message", req.params.messageType, JSON.stringify(req.body.message));
    res.header("Access-Control-Allow-Origin","*");
    res.sendStatus(200);
});

app.post("/jsonMessage", (req, res) => {
    //io.emit("message",req.body);
    console.log("I received message " + JSON.stringify(req.body));
    //console.log("I received message "+ req.body);
    if (req.body.type != null && req.body.message != null) {
        io.emit("message", req.body.type, JSON.stringify(req.body.message));
        res.sendStatus(200);
    } else {
        res.status(400);
        res.send("You need have type and message in body");
    }
});

app.post("/privateMessage",(req,res)=>{
  //io.emit("message",req.body);
  console.log("I received message "+ JSON.stringify(req.body));
  //console.log("I received message "+ req.body);
  if(req.body.type != null && req.body.message != null && req.body.key != null){
    io.to(req.body.key).emit("message",req.body.type,req.body.message);
    res.sendStatus(200);
  }else{
    res.status(400);
    res.send("You need have key (what group you want to send message to),type and message in body");
  }
});

app.post("/jsonPrivateMessage", (req, res) => {
    //io.emit("message",req.body);
    console.log("I received message " + JSON.stringify(req.body));
    //console.log("I received message "+ req.body);
    if (req.body.type != null && req.body.message != null && req.body.key != null) {
        io.to(req.body.key).emit("message", req.body.type, JSON.stringify(req.body.message));
        res.sendStatus(200);
    } else {
        res.status(400);
        res.send("You need have key (what group you want to send message to),type and message in body");
    }
});

//authenrication
//http://localhost:3001 local host
io.use((socket, next)=>{
  const userId = socket.handshake.auth.userId;
 // const tableName = socket.handshake.auth.tableName;
  if(userId != null){
//a room for this user only
    socket.join(userId);
    next();

  }else{
    console.log(userId +" is rejected");
  }
  
  
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

  socket.on("disconnect",()=>{
    io.emit("message","disconnect",userid);
    console.log(socket.id+" is disconnected");
  });
});

server.listen(port, () => {
  console.log('listening on *:'+port);
});