import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sidebar } from "@/components/code-editor/Sidebar";
import { FileTabs } from "@/components/code-editor/FileTabs";
import EditorPanel from "@/components/code-editor/EditorPanel";
import OutputPanel from "@/components/code-editor/OutputPanel";
import { Header } from "@/components/code-editor/Header";
import { ProblemsPanel } from "@/components/code-editor/ProblemsPanel";
import ExplorerPanel from "@/components/code-editor/ExplorerPanel";
import { StatusBar } from "@/components/code-editor/StatusBar";
import { CommandPalette } from "@/components/code-editor/CommandPalette";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Code2, Bug, GitBranch, Search, Settings, Bell, Share2, Command, Sun, Moon, Play, Maximize2, Minimize2 } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-context-provider";
import TerminalPanel from "@/components/code-editor/TerminalPanel";
import { EditorSidebar } from "@/components/code-editor/EditorSidebar";
import { useParams, useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

interface Project {
  id: string;
  name: string;
  description?: string;
  path?: string;
  teamId?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  status: "online" | "offline" | "idle";
}

const CodeEditorPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, session } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("// Start coding...");
  const [collaborators, setCollaborators] = useState<TeamMember[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
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
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationOutput, setCompilationOutput] = useState<string>("");
  const [compilationError, setCompilationError] = useState<string>("");
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isDebugging, setIsDebugging] = useState(false);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [terminalSessionId] = useState(() => Math.random().toString(36).substring(7));
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentDirectory, setCurrentDirectory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load project data when projectId changes
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId || !session) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to load project');
        }
        
        const project = await response.json();
        setCurrentProject(project);
        
        // Load team members if project has a teamId
        if (project.teamId) {
          loadTeamMembers(project.teamId);
        }
        
      } catch (error) {
        console.error('Error loading project:', error);
        // Optionally navigate back to dashboard on error
        // navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    const loadTeamMembers = async (teamId: string) => {
      try {
        const response = await fetch(`/api/teams/${teamId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to load team members');
        }
        
        const team = await response.json();
        
        // Map team members to collaborator format
        const teamMembers = team.members.map((member: any) => ({
          id: member.profile.id,
          name: member.profile.username || member.profile.email?.split('@')[0] || 'User',
          email: member.profile.email,
          avatar: member.profile.avatar_url,
          // Default to offline, will be updated by socket
          status: "offline" as const
        }));
        
        setCollaborators(teamMembers);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    };

    loadProject();
  }, [projectId, session, navigate]);
  
  // Socket.io setup for code editor and online status
  useEffect(() => {
    // Connection events
    const handleConnect = () => {
      console.log("Connected to socket server");
      setIsConnected(true);
      
      // Authenticate and join project when connected
      if (user) {
        // Authenticate first (marks user as online)
        socket.emit("userAuthenticated", { userId: user.id });
        
        // Then join the specific project if we have one
        if (projectId) {
          socket.emit("joinProject", { projectId, userId: user.id });
        }
      }
    };
    
    // Handle disconnection
    const handleDisconnect = () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    };
    
    // Handle user status updates
    const handleUserUpdates = (users: { id: string; status: string }[]) => {
      console.log("Received users update:", users);
      
      // Track online users
      const onlineUserIds = users.filter(u => u.status === "online").map(u => u.id);
      setOnlineUsers(onlineUserIds);
      
      // Update collaborators status
      setCollaborators(prev => {
        // Create a status map from the server update
        const statusMap = new Map(users.map(user => [user.id, user.status]));
        
        // Update each collaborator's status
        return prev.map(collab => ({
          ...collab,
          status: statusMap.has(collab.id) 
            ? statusMap.get(collab.id) as "online" | "offline" | "idle"
            : "offline"
        }));
      });
    };
    
    // Handle code updates
    const handleCodeUpdate = (newCode: string) => {
      setCode(newCode);
    };
    
    // Connect and set up event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("updateUsers", handleUserUpdates);
    socket.on("codeUpdate", handleCodeUpdate);
    
    // If already connected, authenticate and join project
    if (socket.connected && user) {
      socket.emit("userAuthenticated", { userId: user.id });
      
      if (projectId) {
        socket.emit("joinProject", { projectId, userId: user.id });
      }
    }
    
    // Clean up event listeners when component unmounts
    return () => {
      // Leave the project room if we're in one
      if (projectId) {
        socket.emit("leaveProject", { projectId });
      }
      
      // Remove event listeners
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updateUsers", handleUserUpdates);
      socket.off("codeUpdate", handleCodeUpdate);
    };
  }, [projectId, user, socket]);
  
  useHotkeys("cmd+k,ctrl+k", (e: KeyboardEvent) => {
    e.preventDefault();
    setIsCommandPaletteOpen(true);
  });

  const handleCodeChange = (value: string | undefined) => {
    const updatedCode = value || "";
    setCode(updatedCode);
    if (projectId) {
      socket.emit("codeChange", updatedCode);
    }
  };

  const handleFileSelect = (file: string) => {
    setActiveFile(file);
  };

  const handleDirectorySelect = (path: string) => {
    setCurrentDirectory(path);
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

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompilationError("");
    setCompilationOutput("");
    
    try {
      const response = await fetch('http://localhost:3000/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          fileType: activeFile.split('.').pop(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCompilationOutput(data.output);
        setActiveOutputTab("output");
      } else {
        setCompilationError(data.error);
        setActiveOutputTab("problems");
      }
    } catch (error) {
      setCompilationError("Failed to compile: " + (error as Error).message);
      setActiveOutputTab("problems");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleTerminalCommand = async (command: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();
      setTerminalOutput(prev => prev + `\n$ ${command}\n${data.output}`);
    } catch (error) {
      setTerminalOutput(prev => prev + `\n$ ${command}\nError: ${(error as Error).message}`);
    }
  };

  const handleDebug = () => {
    setIsDebugging(!isDebugging);
    if (!isDebugging) {
      // Start debugging session
      socket.emit('startDebug', { file: activeFile, breakpoints });
    } else {
      // Stop debugging session
      socket.emit('stopDebug');
    }
  };

  const handleStepOver = () => {
    socket.emit('stepOver');
  };

  const handleStepInto = () => {
    socket.emit('stepInto');
  };

  const handleStepOut = () => {
    socket.emit('stepOut');
  };

  const handleContinue = () => {
    socket.emit('continue');
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
      <EditorSidebar 
        collaborators={collaborators}
        currentUserId={user?.id}
        projectName={currentProject?.name}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/80'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
          <div className="flex items-center justify-between px-4">
            <Header projectName={currentProject?.name || "Loading Project..."} />
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCompile}
                disabled={isCompiling}
                className={`${theme === 'dark' ? 'hover:bg-gray-700/50 hover:text-green-400' : 'hover:bg-gray-100/80 hover:text-green-600'}`}
              >
                <Play className="h-5 w-5" />
              </Button>
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
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`${theme === 'dark' ? 'bg-gray-800/30' : 'bg-white/60'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
            <FileTabs
              files={["file1.js", "file2.js"]}
              activeFile={activeFile}
              onFileChange={setActiveFile}
            />
          </div>
          <ResizablePanelGroup direction="vertical" className="flex-1">
            <ResizablePanel defaultSize={isTerminalMaximized ? 0 : 70}>
              <ResizablePanelGroup direction="horizontal" className="flex-1 p-2">
                {/* Code Editor Panel */}
                <ResizablePanel defaultSize={70}>
                  <div className={`h-full ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-white/90'} backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
                    <EditorPanel 
                      code={code} 
                      onCodeChange={handleCodeChange}
                      isDebugging={isDebugging}
                      breakpoints={breakpoints}
                      currentLine={currentLine}
                      onBreakpointToggle={(line) => {
                        setBreakpoints(prev => 
                          prev.includes(line) 
                            ? prev.filter(l => l !== line)
                            : [...prev, line]
                        );
                      }}
                    />
                  </div>
                </ResizablePanel>

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
                          <OutputPanel 
                            output={compilationOutput} 
                            isCompiling={isCompiling} 
                          />
                        </TabsContent>
                        <TabsContent value="problems" className="h-full p-4">
                          <ProblemsPanel 
                            problems={[
                              ...problems,
                              ...(compilationError ? [{
                                type: "error" as const,
                                message: compilationError,
                                file: activeFile,
                                line: 0,
                                column: 0,
                              }] : [])
                            ]} 
                          />
                        </TabsContent>
                        <TabsContent value="explorer" className="h-full p-4">
                          <ExplorerPanel 
                            onFileSelect={handleFileSelect} 
                            onDirectorySelect={handleDirectorySelect}
                          />
                        </TabsContent>
                      </ScrollArea>
                    </Tabs>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            {/* Terminal Panel */}
            <ResizableHandle className={`${theme === 'dark' ? 'bg-gray-700/30 hover:bg-blue-500/30' : 'bg-gray-200/50 hover:bg-blue-200/50'} transition-colors`} />
            <ResizablePanel defaultSize={isTerminalMaximized ? 100 : 30}>
              <div className={`h-full ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-white/90'} backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
                <div className="flex items-center justify-between p-2 border-b border-gray-700/30">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4" />
                    <span>Terminal</span>
                  </div>
                  {isTerminalMaximized ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsTerminalMaximized(false)}
                      className="h-6 w-6"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsTerminalMaximized(true)}
                      className="h-6 w-6"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {isTerminalMaximized ? (
                  <div className="fixed inset-0 z-50 bg-background">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between p-2 border-b">
                        <span className="text-sm font-medium">Terminal</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsTerminalMaximized(false)}
                        >
                          <Minimize2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <TerminalPanel
                        theme={theme}
                        sessionId={terminalSessionId}
                        projectPath={currentDirectory || currentProject?.path}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-48 border-t">
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="text-sm font-medium">Terminal</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsTerminalMaximized(true)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <TerminalPanel
                      theme={theme}
                      sessionId={terminalSessionId}
                      projectPath={currentDirectory || currentProject?.path}
                    />
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Debug Controls */}
        {isDebugging && (
          <div className={`flex items-center space-x-2 p-2 border-t ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/50'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStepOver}
              className="h-8"
            >
              Step Over
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStepInto}
              className="h-8"
            >
              Step Into
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStepOut}
              className="h-8"
            >
              Step Out
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContinue}
              className="h-8"
            >
              Continue
            </Button>
          </div>
        )}

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