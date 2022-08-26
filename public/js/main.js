const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector(".chat-messages");
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');

//get username and room from the url
const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});
//console.log(username,room);

const socket=io();

//join chatroom
socket.emit('joinRoom',{username,room});

//get room ans users

socket.on('roomUsers',({room, users}) => {
    outputRoomName(room);
    outputUsers(users);

})

//Message from server
socket.on('message',(message)=>{
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop=chatMessages.scrollHeight;
})

//Messege submit
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    //Get message text
    const msg=e.target.elements.msg.value;
    
    //Emit message to server
    //socket.emit('chatMessage',msg);
    socket.emit("chatMessage",msg);

    //clear out inputs
    e.target.elements.msg.value=" ";
    e.target.elements.msg.focus();
})


//Output massege to DOM
function outputMessage(message){
    const div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML= `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div);
}


//Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}
// Add users to DOM
function outputUsers(users){
    // userList.innerHTML= `
    //     ${users.map(user => `<li>${users.username}</li>`).join('')}
    // `;

    userList.innerHTML=`
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}