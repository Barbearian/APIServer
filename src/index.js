const express = require('express');
require("dotenv").config();

const app = express();
const http = require('http');
const axios = require("axios");
const https = require('https');
const { type } = require('os');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const url = process.env.SERVER_URL||"";
const port = process.env.SOCKET_PORT||3001;

//app.get('/', (req, res) => {});

//http request
app.get("/hi",(req,res)=>{
  console.log("Someone said hello");
  res.send("Hello this is an hello message from http request");
});

app.post("/postTest",(req,res)=>{
  console.log("I received post message");
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
    // try{
    //   axios({
    //     data:{
    //       UserId :userid,
    //       UserStatus: 0
    //     },
    //     url: "https://qa6db4g5vjik7wbdrxuhmpcoci0vjoks.lambda-url.ap-northeast-2.on.aws/",
    //   }).then((res)=>{
    //     console.log(res);
    //   }).catch((err)=>{
    //     console.log(err);
    //   });
    // }catch(error){

    // }
    console.log(socket.id+" is disconnected");
  });
});



server.listen(port, () => {
  console.log('listening on *:'+port);
});