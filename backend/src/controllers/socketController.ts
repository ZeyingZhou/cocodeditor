import { Server, Socket } from "socket.io";

// Global list of online users (persists across all connections)
const onlineUsers = new Set<string>();

// Track socket ID to user ID mapping
const socketToUserMap = new Map<string, string>();

// Track project rooms: project ID -> array of user IDs who are members
const projectMembers = new Map<string, Set<string>>();

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    // User authentication - called when a user logs in
    socket.on("userAuthenticated", ({ userId }: { userId: string }) => {
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
      
      // Store the mapping from socket to user
      socketToUserMap.set(socket.id, userId);
      
      // Mark the user as online
      onlineUsers.add(userId);
      
      // Broadcast to all projects this user is a member of
      broadcastUserStatus(io, userId, "online");
    });

    // Join a project room
    socket.on("joinProject", ({ projectId, userId }: { projectId: string; userId: string }) => {
      console.log(`User ${userId} (socket ${socket.id}) joined project ${projectId}`);
      
      // Map this socket to the user
      socketToUserMap.set(socket.id, userId);
      
      // Add the user to the online users list if not already there
      onlineUsers.add(userId);
      
      // Join the socket to the project room
      socket.join(`project:${projectId}`);
      
      // Add the user as a member of this project (for tracking)
      if (!projectMembers.has(projectId)) {
        projectMembers.set(projectId, new Set());
      }
      projectMembers.get(projectId)?.add(userId);
      
      console.log(`Project ${projectId} members:`, Array.from(projectMembers.get(projectId) || []));
      
      // Broadcast updated user statuses to all clients in this project
      broadcastProjectMembersStatus(io, projectId);
    });
    
    // Leave a project room - only happens when explicitly navigating away
    socket.on("leaveProject", ({ projectId }: { projectId: string }) => {
      const userId = socketToUserMap.get(socket.id);
      if (userId) {
        console.log(`User ${userId} leaving project ${projectId}, but will remain online`);
        socket.leave(`project:${projectId}`);
        
        // Note: We do NOT remove the user from onlineUsers here
        // as they are still logged in, just not viewing this project
      }
    });

    // Listen for code changes
    socket.on("codeChange", (data: string) => {
      // Find which project rooms this socket is in
      const rooms = Array.from(socket.rooms).filter(room => room.startsWith('project:'));
      
      // Broadcast code changes to all sockets in the same project rooms
      rooms.forEach(room => {
        socket.to(room).emit("codeUpdate", data);
      });
    });

    // Explicit user logout - if implemented in your app
    socket.on("userLogout", () => {
      const userId = socketToUserMap.get(socket.id);
      if (userId) {
        handleUserOffline(io, socket.id, userId);
      }
    });

    // Handle disconnection (browser close, etc.)
    socket.on("disconnect", () => {
      const userId = socketToUserMap.get(socket.id);
      console.log(`Socket ${socket.id} disconnected, user: ${userId}`);
      
      if (userId) {
        // Check if this user has other active connections
        const otherSocketsForUser = hasOtherActiveSockets(userId, socket.id);
        
        if (!otherSocketsForUser) {
          // If no other connections, mark the user as offline
          handleUserOffline(io, socket.id, userId);
        } else {
          console.log(`User ${userId} has other active connections, staying online`);
        }
      }
      
      // Clean up socket mapping
      socketToUserMap.delete(socket.id);
    });
  });
  
  // Helper function to check if a user has other active sockets
  function hasOtherActiveSockets(userId: string, currentSocketId: string): boolean {
    for (const [socketId, mappedUserId] of socketToUserMap.entries()) {
      if (mappedUserId === userId && socketId !== currentSocketId) {
        return true;
      }
    }
    return false;
  }
  
  // Helper function to handle a user going offline
  function handleUserOffline(io: Server, socketId: string, userId: string) {
    console.log(`User ${userId} is now offline`);
    onlineUsers.delete(userId);
    
    // Broadcast offline status to all projects the user is a member of
    broadcastUserStatus(io, userId, "offline");
  }
};

// Helper function to broadcast a specific user's status to all projects they're a member of
function broadcastUserStatus(io: Server, userId: string, status: "online" | "offline") {
  // Find all projects this user is a member of
  projectMembers.forEach((members, projectId) => {
    if (members.has(userId)) {
      broadcastProjectMembersStatus(io, projectId);
    }
  });
}

// Helper function to broadcast all members' status for a specific project
function broadcastProjectMembersStatus(io: Server, projectId: string) {
  const members = projectMembers.get(projectId);
  if (!members) return;
  
  // Create status update for all members of this project
  const usersStatus = Array.from(members).map(userId => ({
    id: userId,
    status: onlineUsers.has(userId) ? "online" : "offline"
  }));
  
  console.log(`Broadcasting members status for project ${projectId}:`, usersStatus);
  
  // Send to all sockets in this project room
  io.to(`project:${projectId}`).emit("updateUsers", usersStatus);
}