require("dotenv").config();
// console.log(process.env.HARPERDB_URL);

const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const harperSaveMessage = require("./services/harper-save-message");
const harperGetMessages = require("./services/harper-get-messages");
const leaveRoom = require("./utils/leave-room");

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

    //get messages
    harperGetMessages(room)
      .then((last100Messages) => {
        // console.log('latest messages', last100Messages);
        socket.emit("last_100_messages", last100Messages);
      })
      .catch((err) => console.log(err));
  });

  socket.on("send_message", (data) => {
    const { message, username, room, __createdtime__ } = data;
    io.in(room).emit("receive_message", data); // Send to all users in room, including sender
    harperSaveMessage(message, username, room, __createdtime__) // Save message in db
      .then((response) => console.log(response))
      .catch((err) => console.log(err));
  });

  socket.on("leave_room", (data) => {
    const { username, room } = data;
    socket.leave(room);
    const __createdtime__ = Date.now();
    // Remove user from memory
    allUsers = leaveRoom(socket.id, allUsers);
    socket.to(room).emit("chatroom_users", allUsers);
    socket.to(room).emit("receive_message", {
      username: CHAT_BOT,
      message: `${username} has left the chat`,
      __createdtime__,
    });
    console.log(`${username} has left the chat`);
  });
});

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

server.listen(4000, () => "Server is running on port 4000");
