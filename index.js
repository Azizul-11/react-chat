const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT || 4500;

const users = {}; // Use an object instead of an array

app.use(cors());
app.get("/", (req, res) => {
  res.send("is working");
});

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("new connection");

  socket.on("joined", ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);
    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${user} has joined`,
    });
    socket.emit("Welcome", {
      user: "Admin",
      message: `Welcome to the chat, ${user}`,
    });
  });

  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", { user: users[id], message, id });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("leave", {
      user: "Admin",
      message: `${users[socket.id]} has left`,
    });
    console.log("User left");
  });
});

server.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
