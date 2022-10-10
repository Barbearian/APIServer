const express = require('express');
const app = express();
const http = require('http');
const axios = require("axios");
const https = require('https');
const { type } = require('os');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


//authenrication
io.use((socket, next)=>{
  const userId = socket.handshake.auth.userId;
  const tableName = socket.handshake.auth.tableName;
 // const tableName = socket.handshake.auth.tableName;
  console.log(userId +" tried to logged in "+tableName+" with teamcode :"+teamCode);
  if(userId != null && tableName != null){
//a room for this user only
    socket.join(userId);
    next();

  }else{
    console.log(userId +" is rejected");
  }
  
  
});

io.on('connection', (socket) => {
  
  const userid = socket.handshake.auth.userId;
  const tablename = socket.handshake.auth.tableName;

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

  //socket.on("RegisterHttp",(uri,body)=>{
   // axios.post(uri,body);
    //console.log(message);
 // });

  socket.on("disconnect",()=>{
    io.emit("message","disconnect",userid);
    // try{
    //   axios({
    //     data:{
    //       TeamCode:teamcode,
    //       UserId :userid,
    //       TableName: tablename,
    //       UserStatus: 0
    //     },
    //     url: "",
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



server.listen(443, () => {
  console.log('listening on *:443');
});