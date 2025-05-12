// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.use(express.static(__dirname + "/public")); // HTML in /public folder

let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  users[socket.id] = socket.id;
  io.emit("update-user-list", Object.keys(users));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
    io.emit("update-user-list", Object.keys(users));
  });

  socket.on("call-user", (data) => {
    io.to(data.to).emit("incoming-call", {
      offer: data.offer,
      from: socket.id,
    });
  });

  socket.on("answer-call", (data) => {
    io.to(data.to).emit("call-answered", {
      answer: data.answer,
    });
  });

  socket.on("candidate", (data) => {
    io.to(data.to).emit("candidate", {
      candidate: data.candidate,
    });
  });

  socket.on("chat-message", (data) => {
    io.to(data.to).emit("chat-message", {
      message: data.message,
      from: socket.id,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
