import { Server, Socket } from "socket.io";

// Global list of online users (persists across all connections)
const onlineUsers = new Set<string>();

// Track socket ID to user ID mapping
const socketToUserMap = new Map<string, string>();

// Track project rooms: project ID -> array of user IDs who are members
const projectMembers = new Map<string, Set<string>>();

// NEW: Track direct message history: hash of user IDs -> array of messages
const directMessageHistory = new Map<string, Array<{
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  type: "text" | "file";
  fileName?: string;
  fileUrl?: string;
}>>();

// NEW: Helper function to generate a unique chat room ID for two users
const getChatRoomId = (user1: string, user2: string): string => {
  // Sort IDs to ensure consistency regardless of who initiates the chat
  return [user1, user2].sort().join('_');
};

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

    // === NEW CHAT HANDLERS ===

    // Join a direct message chat room
    socket.on("joinChat", ({ recipientId }: { recipientId: string }) => {
      const senderId = socketToUserMap.get(socket.id);
      if (!senderId) return;

      const chatRoomId = getChatRoomId(senderId, recipientId);
      console.log(`[SocketCtrl] Socket ID ${socket.id} (User ${senderId}) joining room: chat:${chatRoomId}`);
      socket.join(`chat:${chatRoomId}`);

      // Send chat history if it exists
      if (directMessageHistory.has(chatRoomId)) {
        socket.emit("chatHistory", directMessageHistory.get(chatRoomId));
      } else {
        socket.emit("chatHistory", []);
      }
      console.log(`[SocketCtrl] POST-JOIN: Socket ID ${socket.id} (User ${senderId}) successfully joined room 'chat:${chatRoomId}'. Current rooms for this socket:`, socket.rooms);
    });

    // Leave a direct message chat room
    socket.on("leaveChat", ({ recipientId }: { recipientId: string }) => {
      const senderId = socketToUserMap.get(socket.id);
      if (!senderId) return;

      const chatRoomId = getChatRoomId(senderId, recipientId);
      console.log(`User ${senderId} leaving chat room: ${chatRoomId}`);
      socket.leave(`chat:${chatRoomId}`);
    });

    // Handle sending a new message
    socket.on("sendMessage", (message: {
      senderId: string;
      recipientId: string;
      content: string;
      type: "text" | "file";
      fileName?: string;
      fileUrl?: string;
    }) => {
      console.log(`[SocketCtrl] Received sendMessage event:`, message);

      // Use the senderId FROM THE MESSAGE DATA
      const { senderId, recipientId, content, type, fileName, fileUrl } = message;
      
      // Add a basic check to ensure senderId exists in the payload
      if (!senderId) {
        console.error(`[SocketCtrl] Error: sendMessage received without senderId.`);
        return;
      }

      // Proceed with the rest of the logic using the senderId from the message
      const chatRoomId = getChatRoomId(senderId, recipientId);
      
      const newMessage = {
        id: Date.now().toString(),
        senderId, // Use senderId from message
        recipientId,
        content,
        timestamp: new Date(),
        type,
        fileName,
        fileUrl
      };
      
      // Store in history
      if (!directMessageHistory.has(chatRoomId)) {
        directMessageHistory.set(chatRoomId, []);
      }
      const history = directMessageHistory.get(chatRoomId)!;
      history.push(newMessage);
      // Optional: Limit history size
      if (history.length > 100) {
        directMessageHistory.set(chatRoomId, history.slice(-100));
      }
      
      // Broadcast to the chat room
      console.log(`[SocketCtrl] PRE-BROADCAST: Emitting 'newMessage' to room 'chat:${chatRoomId}'. Sender Socket: ${socket.id}. User ID: ${senderId}. Recipient ID: ${recipientId}`);
      io.to(`chat:${chatRoomId}`).emit("newMessage", newMessage);
      console.log(`[SocketCtrl] POST-BROADCAST: Finished emitting 'newMessage' to room 'chat:${chatRoomId}'.`);
      /*
      console.log(`[SocketCtrl] Broadcasting 'newMessage' to room: chat:${chatRoomId}`);
      io.to(`chat:${chatRoomId}`).emit("newMessage", newMessage);
      console.log(`Message from ${senderId} to ${recipientId} processed.`);
      */
    });

    // Handle typing indicator
    socket.on("typing", ({ recipientId, isTyping }: { recipientId: string, isTyping: boolean }) => {
        const senderId = socketToUserMap.get(socket.id);
        if (!senderId) return;

        const chatRoomId = getChatRoomId(senderId, recipientId);
        // Broadcast typing status only to the other user in the room
        socket.to(`chat:${chatRoomId}`).emit("userTyping", { userId: senderId, isTyping });
    });

    // === END OF NEW CHAT HANDLERS ===

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