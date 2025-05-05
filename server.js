const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

let users = {}; // Store connected users

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);
    users[socket.id] = socket.id;

    io.emit("update-user-list", Object.keys(users));

    socket.on("call-user", (data) => {
        console.log(`User ${socket.id} calling ${data.to}`);
        io.to(data.to).emit("incoming-call", { offer: data.offer, from: socket.id });
    });

    socket.on("answer-call", (data) => {
        console.log(`User ${socket.id} answered call from ${data.to}`);
        io.to(data.to).emit("call-answered", { answer: data.answer, from: socket.id });
    });

    socket.on("candidate", (data) => {
        console.log(`ICE Candidate sent from ${socket.id} to ${data.to}`);
        io.to(data.to).emit("candidate", { candidate: data.candidate });
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
        delete users[socket.id];
        io.emit("update-user-list", Object.keys(users));
    });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
