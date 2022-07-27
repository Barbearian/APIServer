const io = require("socket.io");
var lio = new io.Server(3000);
lio.on("connection",(socket)=>{
    console.log("Hello Bear");
});