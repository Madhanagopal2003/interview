const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const users = {}; // socket.id -> userId
const sockets = {}; // userId -> socket.id

app.use(express.static(__dirname + "/public")); // serve your HTML file from /public

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Register user ID when client connects
  users[socket.id] = socket.id;
  sockets[socket.id] = socket;

  // Send updated user list
  io.emit("update-user-list", Object.keys(sockets));

  socket.on("call-user", ({ offer, to }) => {
    const targetSocket = sockets[to];
    if (targetSocket) {
      targetSocket.emit("incoming-call", { offer, from: socket.id });
    }
  });

  socket.on("answer-call", ({ answer, to }) => {
    const targetSocket = sockets[to];
    if (targetSocket) {
      targetSocket.emit("call-answered", { answer });
    }
  });

  socket.on("candidate", ({ candidate, to }) => {
    const targetSocket = sockets[to];
    if (targetSocket) {
      targetSocket.emit("candidate", { candidate });
    }
  });

  socket.on("chat-message", ({ message, to }) => {
    const targetSocket = sockets[to];
    if (targetSocket) {
      targetSocket.emit("chat-message", { message, from: socket.id });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete sockets[socket.id];
    delete users[socket.id];
    io.emit("update-user-list", Object.keys(sockets));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
