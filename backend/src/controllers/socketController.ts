import { Server, Socket } from "socket.io";
import { fileService } from '../services/fileService';
import { projectService } from '../services/projectService';

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

    // Authentication handler
    socket.on("userAuthenticated", ({ userId }: { userId: string }) => {
      console.log(`User ${userId} authenticated on socket ${socket.id}`);
      
      // Store the user as online
      onlineUsers.add(userId);
      socketToUserMap.set(socket.id, userId);
      
      // Broadcast to all clients the list of online users
      broadcastUserStatus(io, userId, "online");
    });
    
    // Join a project room
    socket.on("joinProject", async ({ projectId, userId }: { projectId: string, userId: string }) => {
      if (!projectId || !userId) {
        console.error("[ERROR] joinProject called without projectId or userId");
        return;
      }
      
      console.log(`[DEBUG] User ${userId} joining project ${projectId}, socket ID: ${socket.id}`);
      
      // Add to project room
      const roomName = `project:${projectId}`;
      socket.join(roomName);
      console.log(`[DEBUG] Socket ${socket.id} joined room ${roomName}`);
      console.log(`[DEBUG] Socket ${socket.id} rooms:`, Array.from(socket.rooms));
      
      // Track project membership
      if (!projectMembers.has(projectId)) {
        projectMembers.set(projectId, new Set());
      }
      projectMembers.get(projectId)!.add(userId);
      
      // Broadcast updated user list to project room
      broadcastProjectUsers(io, projectId);
      
      // Load project files from database and send to user
      try {
        console.log(`[DEBUG] Loading files for project ${projectId} from database...`);
        const files = await fileService.getProjectFiles(projectId);
        
        console.log(`[DEBUG] Loaded ${files.length} files for project ${projectId}`);
        
        // Convert DB files to format expected by frontend
        const fileData = files.map(file => ({
          path: file.name,
          content: file.content || ''
        }));
        
        if (files.length === 0) {
          console.log(`[DEBUG] No files found for project ${projectId}. This might be a new project.`);
        } else {
          // Log some file details for debugging
          files.slice(0, 5).forEach(file => {
            console.log(`[DEBUG] - File: ${file.name}, id: ${file.id}, content length: ${file.content?.length || 0}`);
          });
        }
        
        // Send files to the user who just joined
        console.log(`[DEBUG] Sending filesUpdate to socket ${socket.id} with ${fileData.length} files`);
        socket.emit("filesUpdate", { files: fileData });
      } catch (error) {
        console.error(`[ERROR] Failed to load project files for ${projectId}:`, error);
        // Send an error message to the client
        socket.emit("error", { message: "Failed to load project files" });
      }
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
    socket.on("codeChange", (data: { file: string, content: string, projectId: string }) => {
      // Validate the data structure
      if (!data || !data.file || !data.content || !data.projectId) {
        console.error("[DEBUG] Invalid codeChange data:", data);
        return;
      }
      
      console.log(`[DEBUG] Code change in ${data.file} for project ${data.projectId} from socket ${socket.id}`);
      
      // Get all sockets in the project room
      const roomName = `project:${data.projectId}`;
      const sockets = io.sockets.adapter.rooms.get(roomName);
      console.log(`[DEBUG] Room ${roomName} has ${sockets ? sockets.size : 0} connected sockets`);
      
      // Broadcast code changes to all sockets in the same project room
      console.log(`[DEBUG] Broadcasting codeUpdate to room ${roomName} from socket ${socket.id}`);
      socket.to(roomName).emit("codeUpdate", {
        file: data.file,
        content: data.content
      });
      
      // Persist changes to database
      try {
        persistFileChanges(data.projectId, data.file, data.content);
      } catch (error) {
        console.error(`Error saving file changes for ${data.file}:`, error);
      }
    });
    
    // NEW: Handle file creation
    socket.on("createFile", async (data: { projectId: string, filename: string, content: string }) => {
      // Validate the data structure
      if (!data || !data.projectId || !data.filename) {
        console.error("[DEBUG] Invalid createFile data:", data);
        return;
      }
      
      console.log(`[DEBUG] Creating file ${data.filename} in project ${data.projectId} from socket ${socket.id}`);
      
      // Determine file language based on file extension
      const fileExtension = data.filename.split('.').pop() || '';
      const language = getLanguageFromExtension(fileExtension);
      
      try {
        // Create file in database
        const file = await fileService.upsertFile(
          data.projectId,
          data.filename,
          data.content || '',
          language
        );
        
        console.log(`[DEBUG] File created in database: ${file.id}, name: ${file.name}`);
        
        // Get all sockets in the project room
        const roomName = `project:${data.projectId}`;
        const sockets = io.sockets.adapter.rooms.get(roomName);
        console.log(`[DEBUG] Room ${roomName} has ${sockets ? sockets.size : 0} connected sockets`);
        
        // Broadcast to all users in the project room
        console.log(`[DEBUG] Broadcasting fileCreated to room ${roomName}`);
        io.to(roomName).emit("fileCreated", {
          path: data.filename,
          content: data.content || ''
        });
        
        // Also broadcast updated file list with a slight delay to ensure sequential processing
        setTimeout(async () => {
          const files = await fileService.getProjectFiles(data.projectId);
          console.log(`[DEBUG] Retrieved ${files.length} files for broadcasting filesUpdate`);
          
          const fileData = files.map(file => ({
            path: file.name,
            content: file.content || ''
          }));
          
          console.log(`[DEBUG] Broadcasting filesUpdate to room ${roomName} with ${fileData.length} files`);
          io.to(roomName).emit("filesUpdate", { files: fileData });
        }, 100);
      } catch (error) {
        console.error(`Error creating file ${data.filename}:`, error);
      }
    });
    
    // NEW: Handle folder creation
    socket.on("createFolder", async (data: { projectId: string, folderName: string }) => {
      // Validate
      if (!data || !data.projectId || !data.folderName) {
        console.error("Invalid createFolder data:", data);
        return;
      }
      
      console.log(`Creating folder ${data.folderName} in project ${data.projectId}`);
      
      try {
        // For folders, we'll create a placeholder file to represent the folder
        const placeholderPath = `${data.folderName}/.gitkeep`;
        await fileService.upsertFile(
          data.projectId,
          placeholderPath,
          '',
          'text'
        );
        
        // Broadcast to all users in the project room
        const roomName = `project:${data.projectId}`;
        io.to(roomName).emit("folderCreated", {
          path: data.folderName
        });
        
        // Also broadcast updated file list
        const files = await fileService.getProjectFiles(data.projectId);
        const fileData = files.map(file => ({
          path: file.name,
          content: file.content || ''
        }));
        
        io.to(roomName).emit("filesUpdate", { files: fileData });
      } catch (error) {
        console.error(`Error creating folder ${data.folderName}:`, error);
      }
    });

    // === CHAT HANDLERS ===

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
    });

    // Handle typing indicator
    socket.on("typing", ({ recipientId, isTyping }: { recipientId: string, isTyping: boolean }) => {
        const senderId = socketToUserMap.get(socket.id);
        if (!senderId) return;

        const chatRoomId = getChatRoomId(senderId, recipientId);
        // Broadcast typing status only to the other user in the room
        socket.to(`chat:${chatRoomId}`).emit("userTyping", { userId: senderId, isTyping });
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
  
  // Helper: Broadcast user status to all connected clients
  function broadcastUserStatus(io: Server, userId: string, status: "online" | "offline" | "idle") {
    // Prepare user status update
    const userStatus = {
      id: userId,
      status
    };
    
    // Broadcast to all connected clients
    io.emit("usersUpdate", [userStatus]);
  }
  
  // Helper: Broadcast project users to all members of a project
  function broadcastProjectUsers(io: Server, projectId: string) {
    const roomName = `project:${projectId}`;
    const members = projectMembers.get(projectId) || new Set();
    
    // Prepare array of user statuses
    const userStatuses = Array.from(members).map(userId => ({
      id: userId,
      status: onlineUsers.has(userId) ? "online" : "offline"
    }));
    
    // Broadcast to the project room
    io.to(roomName).emit("projectUsers", userStatuses);
  }
  
  // Helper: Persist file changes to database
  async function persistFileChanges(projectId: string, filePath: string, content: string) {
    try {
      console.log(`[DEBUG] Persisting changes for file ${filePath} in project ${projectId}`);
      
      // Check if file exists
      const existingFile = await fileService.getFileByNameAndProject(filePath, projectId);
      
      if (existingFile) {
        console.log(`[DEBUG] File exists, updating: ${existingFile.id}`);
        // Update existing file
        const updatedFile = await fileService.updateFile({
          id: existingFile.id,
          content
        });
        console.log(`[DEBUG] File updated successfully: ${updatedFile.id}`);
      } else {
        console.log(`[DEBUG] File doesn't exist, creating: ${filePath}`);
        // Determine language from file extension
        const fileExtension = filePath.split('.').pop() || '';
        const language = getLanguageFromExtension(fileExtension);
        
        // Create new file
        const newFile = await fileService.createFile({
          name: filePath,
          content,
          language,
          projectId
        });
        console.log(`[DEBUG] New file created: ${newFile.id}`);
      }
      
      // Verify the file was saved correctly by loading it again
      const verifyFile = await fileService.getFileByNameAndProject(filePath, projectId);
      if (verifyFile) {
        console.log(`[DEBUG] File verified in database: ${verifyFile.id}, content length: ${verifyFile.content.length}`);
      } else {
        console.error(`[ERROR] File verification failed! File not found after save: ${filePath}`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to persist file changes for ${filePath}:`, error);
    }
  }
  
  // Helper: Get language from file extension
  function getLanguageFromExtension(extension: string): string {
    const extensionMap: {[key: string]: string} = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'c',
      'hpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'md': 'markdown',
      'json': 'json',
      'sql': 'sql',
      'txt': 'text'
    };
    
    return extensionMap[extension.toLowerCase()] || 'text';
  }
};