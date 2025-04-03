import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Collaborator {
  id: string;
  name: string;
  status: "online" | "offline" | "busy";
  email?: string;
  avatar?: string;
  lastSeen?: string;
}

interface CollaboratorsSidebarProps {
  collaborators: Collaborator[];
  onStartChat: (collaborator: Collaborator) => void;
}

export const CollaboratorsSidebar: React.FC<CollaboratorsSidebarProps> = ({ 
  collaborators,
  onStartChat 
}) => {
  const { theme } = useTheme();

  const getStatusColor = (status: Collaborator["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
    }
  };

  return (
    <Card className={`w-full ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
          Collaborators
        </h2>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {collaborators.map((user) => (
            <li
              key={user.id}
              className={`flex items-center justify-between p-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-800/30 hover:bg-gray-700/50' 
                  : 'bg-gray-50 hover:bg-gray-100'
              } transition-colors`}
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    } flex items-center justify-center`}>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2",
                    theme === 'dark' ? 'border-gray-800' : 'border-white',
                    getStatusColor(user.status)
                  )} />
                </div>
                <div className="flex flex-col">
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {user.name}
                  </span>
                  {user.email && (
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {user.email}
                    </span>
                  )}
                  {user.status === 'offline' && user.lastSeen && (
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Last seen: {user.lastSeen}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onStartChat(user)}
                className={cn(
                  "h-8 w-8",
                  theme === 'dark' 
                    ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                )}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};