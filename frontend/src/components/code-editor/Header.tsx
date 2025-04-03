import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Save, Share2, Settings, Bell, GitBranch, CheckCircle2, User, Sun, Moon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/auth-context-provider";

interface HeaderProps {
  projectName: string;
}

export const Header: React.FC<HeaderProps> = ({ projectName }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className={`flex items-center justify-between p-2 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white/80 border-gray-200/50'} border-b`}>
      <div className="flex items-center space-x-2">
        <h1 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
          {projectName}
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <Link to="/profile">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${theme === 'dark' ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
            title="Profile"
          >
            <User className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={`h-8 w-8 ${theme === 'dark' ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};