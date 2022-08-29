const express = require('express');
const app = express();
const http = require('http');
const axios = require("axios");
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
  console.log("I received post message");
});

//authenrication
io.use((socket, next)=>{
  const userId = socket.handshake.auth.userId;
  const teamCode = socket.handshake.auth.teamCode;
  const tableName = socket.handshake.auth.tableName;
 // const tableName = socket.handshake.auth.tableName;
  console.log(userId +" tried to logged in "+tableName+" with teamcode :"+teamCode);
  if(userId != null && teamCode != null&&tableName != null){
//a room for this user only
    socket.join(userId);
    next();

  }else{
    console.log(userId +" is rejected");
  }
  
  
});

io.on('connection', (socket) => {
  
  const userid = socket.handshake.auth.userId;
  const teamcode = socket.handshake.auth.teamCode;
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
    try{
      axios.post(
        "https://qa6db4g5vjik7wbdrxuhmpcoci0vjoks.lambda-url.ap-northeast-2.on.aws",
        {
          body:{
            TeamCode:teamcode,
            UserId :userid,
            TableName: tablename,
            UserStatus: 0
          }
        }
      ).then((res)=>{
        console.log(res);
      }).catch((err)=>{
        console.log(err);
      });
    }catch(error){

    }
    console.log(socket.id+" is disconnected");
  });
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});