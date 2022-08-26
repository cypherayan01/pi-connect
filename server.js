
const path=require("path");
const http=require("http");
const express =require("express");
const socketio=require("socket.io");
const formatMessage=require("./utils/messages.js");
const {userJoin,getCurrentUser,userLeave,
    getRoomUsers} =require("./utils/users.js");

const app=express();
const server=http.createServer(app);
const io=socketio(server);


// set static folder 
app.use(express.static(path.join(__dirname,'public')));
botName="chatcord Bot";

//Run when client connects
io.on('connection',socket=>{
    //console.log("New web socket connection...");

    socket.on("joinRoom",({username,room})=>{
        const user=userJoin(socket.id,username,room);
        socket.join(user.room);
        //welcome current user
        socket.emit('message',formatMessage(botName,'Welcome to chatcord')); // to the single client

        //broadcast when a user connect
        socket.broadcast
        .to(user.room)
        .emit(
            'message',
            formatMessage(botName,`${user.username} has joined the chat`));// to all client except the main client

        //Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    

    

    //Listen chat message
    socket.on('chatMessage',(msg)=>{

        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
        //console.log(msg);
    });
    //broadcast when a user disconnect
    socket.on('disconnect',() =>{

        const user=userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
           //Send users and room info
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

        
    });

    //io.emit(); // to everyone
});

const PORT =process.env.PORT || 3000;

server.listen(3000,function(req,res){
    console.log(`server running at port ${PORT}...`);
})