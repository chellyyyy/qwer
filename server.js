const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

let messages = [];

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.emit("previousMessages", messages);

    socket.on("sendMessage", (message) => {
        messages.push(message);
        io.emit("newMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
