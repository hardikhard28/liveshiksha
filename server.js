const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidV4 } = require("uuid");

app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/room", (req, res) => {
  console.log(req.query.roomId);
  if (!req.query.roomid) {
    console.log(true);
    let roomid = uuidV4();
    res.render("room", { roomId: roomid, name: req.query.name });
  } else {
    res.render("room", { roomId: req.query.roomid, name: req.query.name });
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    // messages
    socket.on("code", (message) => {
      socket.to(roomId).broadcast.emit("code", message);
    });

    socket.on("inpmsg", (message) => {
      socket.to(roomId).broadcast.emit("inpmsg", message);
    });
    socket.on("outmsg", (message) => {
      socket.to(roomId).broadcast.emit("outmsg", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 8000);
console.log("Connected!");