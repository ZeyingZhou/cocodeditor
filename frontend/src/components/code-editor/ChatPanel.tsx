import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Paperclip } from "lucide-react";
import { Collaborator } from "./CollaboratorsSidebar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: "text" | "file";
  fileName?: string;
  fileUrl?: string;
}

interface ChatPanelProps {
  collaborator: Collaborator;
  onClose: () => void;
  currentUserId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  collaborator,
  onClose,
  currentUserId,
}) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock real-time updates (replace with actual WebSocket/real-time implementation)
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: "1",
        senderId: currentUserId,
        content: "Hey, how's it going?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: "text",
      },
      {
        id: "2",
        senderId: collaborator.id,
        content: "Working on the new feature. How about you?",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        type: "text",
      },
    ];
    setMessages(mockMessages);
  }, [collaborator.id, currentUserId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      content: newMessage,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    // Here you would typically send the message to your real-time backend
  };

  const handleFileUpload = () => {
    // Implement file upload functionality
    console.log("File upload clicked");
  };

  return (
    <div className={`flex flex-col h-full ${
      theme === 'dark' ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white border-gray-200'
    } border-l`}>
      {/* Chat Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="relative">
            {collaborator.avatar ? (
              <img
                src={collaborator.avatar}
                alt={collaborator.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className={`w-8 h-8 rounded-full ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              } flex items-center justify-center`}>
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {collaborator.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
              theme === 'dark' ? 'border-gray-800' : 'border-white'
            } ${
              collaborator.status === "online"
                ? "bg-green-500"
                : collaborator.status === "busy"
                ? "bg-yellow-500"
                : "bg-gray-400"
            }`} />
          </div>
          <div>
            <h3 className={`font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              {collaborator.name}
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {collaborator.status === "online" ? "Online" : collaborator.status === "busy" ? "Busy" : "Offline"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={cn(
            "h-8 w-8",
            theme === 'dark' 
              ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
          )}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === currentUserId
                    ? theme === 'dark'
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : theme === 'dark'
                    ? "bg-gray-700/50 text-gray-200"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.type === "text" ? (
                  <p>{message.content}</p>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4" />
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {message.fileName}
                    </a>
                  </div>
                )}
                <span className={`text-xs mt-1 block ${
                  message.senderId === currentUserId
                    ? "text-blue-100"
                    : theme === 'dark'
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200'
      }`}>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFileUpload}
            className={cn(
              "h-8 w-8",
              theme === 'dark' 
                ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            )}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className={cn(
              "flex-1",
              theme === 'dark' 
                ? 'bg-gray-800/50 border-gray-700/30 text-gray-200 placeholder:text-gray-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500'
            )}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSendMessage}
            className={cn(
              "h-8 w-8",
              theme === 'dark' 
                ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 