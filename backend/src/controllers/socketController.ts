import { Server, Socket } from "socket.io";

const users = new Map<string, { id: string; status: string }>();

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    // Add the user to the list
    users.set(socket.id, { id: socket.id, status: "online" });

    // Broadcast the updated user list to all clients
    io.emit("updateUsers", Array.from(users.values()));

    // Listen for code changes
    socket.on("codeChange", (data: string) => {
      console.log(`Code received from ${socket.id}:`, data);
      socket.broadcast.emit("codeUpdate", data);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      users.delete(socket.id);
      io.emit("updateUsers", Array.from(users.values()));
    });
  });
};