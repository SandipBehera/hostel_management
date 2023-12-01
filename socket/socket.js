const socketIO = require("socket.io");

let io; // Declare a variable to store the io instance

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Add any other socket-related logic here

    // Example: Listen for a disconnect event
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initializeSocket, getIO };
