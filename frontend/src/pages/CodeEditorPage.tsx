import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sidebar } from "@/components/code-editor/Sidebar";
import { FileTabs } from "@/components/code-editor/FileTabs";
import { EditorPanel } from "@/components/code-editor/EditorPanel";
import { OutputPanel } from "@/components/code-editor/OutputPanel";
import { Header } from "@/components/code-editor/Header";
import { ProblemsPanel } from "@/components/code-editor/ProblemsPanel";
import { ExplorerPanel } from "@/components/code-editor/ExplorerPanel";
import { StatusBar } from "@/components/code-editor/StatusBar";
import { CommandPalette } from "@/components/code-editor/CommandPalette";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Code2, Bug, GitBranch, Search, Settings, Bell, Share2, Command, Sun, Moon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-context-provider";

const socket = io("http://localhost:3000");

const CodeEditorPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [code, setCode] = useState("// Start coding...");
  const [collaborators, setCollaborators] = useState([]);
  const [activeFile, setActiveFile] = useState("file1.js");
  const [activeOutputTab, setActiveOutputTab] = useState("output");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isProblemsOpen, setIsProblemsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Pull Request",
      message: "New PR #123 has been opened",
      time: "2m ago",
    },
    {
      id: 2,
      title: "Build Failed",
      message: "Build failed in main branch",
      time: "5m ago",
    },
  ]);
  const [problems, setProblems] = useState([
    {
      type: "error" as const,
      message: "Variable 'x' is not defined",
      file: "file1.js",
      line: 5,
      column: 10,
    },
    {
      type: "warning" as const,
      message: "Unused variable 'y'",
      file: "file2.js",
      line: 3,
      column: 15,
    },
  ]);

  const files = ["file1.js", "file2.js"];
  const fileTree: { type: "folder" | "file"; name: string; children?: { type: "folder" | "file"; name: string }[] }[] = [
    {
      type: "folder",
      name: "src",
      children: [
        { type: "file", name: "file1.js" },
        { type: "file", name: "file2.js" },
      ],
    },
    {
      type: "folder",
      name: "public",
      children: [
        { type: "file", name: "index.html" },
        { type: "file", name: "styles.css" },
      ],
    },
  ];

  useEffect(() => {
    socket.on("codeUpdate", (newCode) => setCode(newCode));
    socket.on("updateUsers", (users) => setCollaborators(users));
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    return () => {
      socket.disconnect();
    };
  }, []);

  useHotkeys("cmd+k,ctrl+k", (e: KeyboardEvent) => {
    e.preventDefault();
    setIsCommandPaletteOpen(true);
  });

  const handleCodeChange = (value: string | undefined) => {
    const updatedCode = value || "";
    setCode(updatedCode);
    socket.emit("codeChange", updatedCode);
  };

  const handleFileSelect = (file: string) => {
    setActiveFile(file);
  };

  const handleCommand = (command: string) => {
    switch (command) {
      case "newFile":
        // Handle new file creation
        break;
      case "newFolder":
        // Handle new folder creation
        break;
      case "save":
        // Handle save
        break;
      case "gitBranch":
        // Handle git branch checkout
        break;
      case "share":
        // Handle sharing
        break;
      case "settings":
        // Handle settings
        break;
    }
    setIsCommandPaletteOpen(false);
  };

  const handleNotificationClick = () => {
    // Toggle notifications panel
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleShareClick = () => {
    setIsShareOpen(true);
  };

  const handleTerminalClick = () => {
    setIsTerminalOpen(!isTerminalOpen);
  };

  const handleProblemsClick = () => {
    setIsProblemsOpen(!isProblemsOpen);
    setActiveOutputTab("problems");
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onCommand={handleCommand}
      />

      {/* Sidebar */}
      <div className={`w-64 ${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/80'} backdrop-blur-sm border-r ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
        <Sidebar 
          fileTree={fileTree} 
          collaborators={collaborators} 
          currentUserId={user?.id || ''} 
        />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/80'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
          <div className="flex items-center justify-between px-4">
            <Header projectName="Project: Collaborative Editor" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`${theme === 'dark' ? 'hover:bg-gray-700/50 hover:text-yellow-400' : 'hover:bg-gray-100/80 hover:text-gray-700'}`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`${theme === 'dark' ? 'bg-gray-800/30' : 'bg-white/60'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
            <FileTabs
              files={files}
              activeFile={activeFile}
              onFileChange={setActiveFile}
            />
          </div>
          <ResizablePanelGroup direction="horizontal" className="flex-1 p-2">
            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={70}>
              <div className={`h-full ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-white/90'} backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
                <EditorPanel code={code} onCodeChange={handleCodeChange} />
              </div>
            </ResizablePanel>
            <ResizableHandle className={`${theme === 'dark' ? 'bg-gray-700/30 hover:bg-blue-500/30' : 'bg-gray-200/50 hover:bg-blue-200/50'} transition-colors`} />
            {/* Output/Preview Panel */}
            <ResizablePanel defaultSize={30}>
              <div className={`h-full ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-white/90'} backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
                <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab} className="h-full">
                  <div className={`border-b ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'} px-4`}>
                    <TabsList className="w-full justify-start bg-transparent">
                      <TabsTrigger 
                        value="output" 
                        className={`flex items-center space-x-2 ${theme === 'dark' ? 'data-[state=active]:bg-gray-800/50 data-[state=active]:text-blue-400' : 'data-[state=active]:bg-gray-100/80 data-[state=active]:text-blue-600'}`}
                      >
                        <Terminal className="h-4 w-4" />
                        <span>Output</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="problems" 
                        className={`flex items-center space-x-2 ${theme === 'dark' ? 'data-[state=active]:bg-gray-800/50 data-[state=active]:text-red-400' : 'data-[state=active]:bg-gray-100/80 data-[state=active]:text-red-600'}`}
                      >
                        <Bug className="h-4 w-4" />
                        <span>Problems</span>
                        {problems.length > 0 && (
                          <span className={`ml-2 px-1.5 py-0.5 text-xs ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'} rounded-full`}>
                            {problems.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="explorer" 
                        className={`flex items-center space-x-2 ${theme === 'dark' ? 'data-[state=active]:bg-gray-800/50 data-[state=active]:text-green-400' : 'data-[state=active]:bg-gray-100/80 data-[state=active]:text-green-600'}`}
                      >
                        <Code2 className="h-4 w-4" />
                        <span>Explorer</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <ScrollArea className="h-[calc(100%-3rem)]">
                    <TabsContent value="output" className="h-full p-4">
                      <OutputPanel />
                    </TabsContent>
                    <TabsContent value="problems" className="h-full p-4">
                      <ProblemsPanel problems={problems} />
                    </TabsContent>
                    <TabsContent value="explorer" className="h-full p-4">
                      <ExplorerPanel fileTree={fileTree} onFileSelect={handleFileSelect} />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/80'} backdrop-blur-sm border-t ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
          <StatusBar
            isConnected={isConnected}
            branch="main"
            commit="abc1234"
            pullRequests={2}
            onNotificationClick={handleNotificationClick}
            onSettingsClick={handleSettingsClick}
            onShareClick={handleShareClick}
            onTerminalClick={handleTerminalClick}
            onProblemsClick={handleProblemsClick}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;