const app = require("express");
const http = require("http").createServer(app);
var io = require("socket.io")(http);

io.on("connection", (socket) => {
  console.log("new client connected", socket.id);

  socket.on("user_join", ({ name, chatroom }) => {
    socket.join(chatroom);
    io.to(chatroom).emit("user_join", { name, chatroom });
    console.log(
      "A user joined their name is " + name + ",chatroom is " + chatroom
    );
    //socket.broadcast.emit("user_join", { name, chatroom });
  });

  socket.on("message", ({ name, message, chatroom }) => {
    console.log(name, message, socket.id, chatroom);
    io.to(chatroom).emit("message", { name, message, chatroom });
  });

  socket.on("remove", (room) => {
    socket.leave(room);
  });

  socket.on("disconnect", () => {
    console.log("Disconnect Fired");
  });
});

http.listen(4000, () => {
  console.log(`listening on *:${4000}`);
});
