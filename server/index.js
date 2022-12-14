const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const CHAT_BOT = "ChatBot";

let chatRoom = "";
let allUsers = [];

io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);

  //we can write socket events listeners in here
  socket.on("join_room", (data) => {
    const { username, room } = data; //data sent from client when join_room event emitted
    console.log(username, room); //COMMENT
    socket.join(room); //join the user to a socket room

    let __createdtime__ = Date.now();
    //send message to all the users currently in the room, apt from the user that just joined
    socket.to(room).emit("recieve_message", {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      __createdtime__,
    });

    // Send welcome msg to user that just joined chat only
    socket.emit(
      "recieve_message",
      {
        message: `Welcome ${username}`,
        username: CHAT_BOT,
        __createdtime__,
      },
      console.log("okay")
    );

    //save the new user to the room
    chatRoom = room;
    allUsers.push({ id: socket.id, username, room });
    charRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit("chatroom_users", charRoomUsers);
    socket.emit("chatroom_users", charRoomUsers); //doubt why repeating line above??? DOUBT
  });
});

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

server.listen(4000, () => "Server is running on port 4000");
