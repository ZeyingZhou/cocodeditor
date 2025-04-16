"use client"

import * as React from "react"
import { FileCode, FolderTree, History, Plus, Settings, Share2, Users, FolderPlus } from "lucide-react"

import { CollaboratorsList } from "./collaborators-list"
import { FileExplorer } from "./file-explorer"
import { ProjectSelector } from "./project-selector"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Sample data for demonstration
const sampleProjects = [
  { id: "1", name: "My Project", path: "/projects/my-project" },
  { id: "2", name: "Another Project", path: "/projects/another-project" },
]

interface Collaborator {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  status: "online" | "offline" | "idle";
}

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  icon?: React.ComponentType<{ className?: string }>;
  children?: FileItem[];
  path?: string;
}

interface EditorSidebarProps extends React.ComponentProps<typeof Sidebar> {
  collaborators?: Collaborator[];
  currentUserId?: string;
  projectName?: string;
  onCreateFile?: (filename: string) => void;
  onCreateFolder?: (folderName: string) => void;
  onFileSelect?: (fileId: string) => void;
  onFolderSelect?: (folderId: string) => void;
  projectFiles?: FileItem[];
  currentDirectory?: string;
}

export function EditorSidebar({ 
  collaborators = [], 
  currentUserId, 
  projectName,
  onCreateFile,
  onCreateFolder,
  onFileSelect,
  onFolderSelect,
  projectFiles = [],
  currentDirectory = '',
  ...props 
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<"files" | "collaborators" | "history">("files")
  const [currentProject, setCurrentProject] = React.useState(
    projectName 
      ? { id: "current", name: projectName, path: "" } 
      : sampleProjects[0]
  )
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = React.useState(false)
  const [newFileName, setNewFileName] = React.useState("")
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = React.useState(false)
  const [newFolderName, setNewFolderName] = React.useState("")

  // Ensure current user is marked as online in the collaborators list
  const collaboratorsWithCurrentUser = React.useMemo(() => {
    if (!collaborators.length) return [];
    
    // Check if current user is in the list
    const currentUserExists = collaborators.some(c => c.id === currentUserId);
    
    if (currentUserExists) {
      // Update current user status to online
      return collaborators.map(c => 
        c.id === currentUserId 
          ? { ...c, status: "online" as const } 
          : c
      );
    }
    
    return collaborators;
  }, [collaborators, currentUserId]);

  const handleFileSelect = (file: any) => {
    if (onFileSelect && file.id) {
      onFileSelect(file.id);
    }
  };

  const handleFolderSelect = (folder: any) => {
    if (onFolderSelect && folder.id) {
      onFolderSelect(folder.id);
    }
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      // If onCreateFile prop is provided, call it with the new file name
      if (onCreateFile) {
        onCreateFile(newFileName);
      } else {
        // Otherwise, just log for now (this would be removed in production)
        console.log("Creating new file:", newFileName);
      }
      
      // Reset the form and close the dialog
      setNewFileName("");
      setIsNewFileDialogOpen(false);
    }
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // If onCreateFolder prop is provided, call it with the new folder name
      if (onCreateFolder) {
        onCreateFolder(newFolderName);
      } else {
        // Otherwise, just log for now (this would be removed in production)
        console.log("Creating new folder:", newFolderName);
      }
      
      // Reset the form and close the dialog
      setNewFolderName("");
      setIsNewFolderDialogOpen(false);
    }
  }

  // Helper function to find a folder in the tree by its path
  const findFolderByPath = (items: FileItem[], path: string): string | undefined => {
    for (const item of items) {
      if (item.type === "folder" && item.path === path) {
        return item.id;
      }
      if (item.children?.length) {
        const found = findFolderByPath(item.children, path);
        if (found) return found;
      }
    }
    return undefined;
  };

  return (
    <TooltipProvider>
      <Sidebar {...props}>
        <SidebarHeader className="h-16 border-b border-border">
          <ProjectSelector 
            projects={sampleProjects}
            currentProject={currentProject}
            onProjectSelect={setCurrentProject}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        onClick={() => setActiveTab("files")}
                        isActive={activeTab === "files"}
                      >
                        <FolderTree className="h-4 w-4" />
                        <span>Files</span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">Files</TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        onClick={() => setActiveTab("collaborators")}
                        isActive={activeTab === "collaborators"}
                      >
                        <Users className="h-4 w-4" />
                        <span>Collaborators</span>
                        {collaboratorsWithCurrentUser.filter(c => c.status === "online").length > 0 && (
                          <span className="ml-1 text-xs rounded-full bg-green-500 text-white px-1.5 py-0.5">
                            {collaboratorsWithCurrentUser.filter(c => c.status === "online").length}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">Collaborators</TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        onClick={() => setActiveTab("history")}
                        isActive={activeTab === "history"}
                      >
                        <History className="h-4 w-4" />
                        <span>History</span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">History</TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {activeTab === "files" && (
            <SidebarGroup>
              <SidebarGroupLabel className="flex justify-between items-center">
                Files
                <div className="flex space-x-1">
                  <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="p-1 rounded-md hover:bg-accent" title="New Folder">
                        <FolderPlus className="h-4 w-4" />
                        <span className="sr-only">Add folder</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="foldername" className="text-right">
                            Folder name
                          </Label>
                          <Input
                            id="foldername"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="e.g. components"
                            className="col-span-3"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleCreateFolder();
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                          Create
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="p-1 rounded-md hover:bg-accent" title="New File">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add file</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New File</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="filename" className="text-right">
                            File name
                          </Label>
                          <Input
                            id="filename"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="e.g. main.js"
                            className="col-span-3"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleCreateFile();
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleCreateFile} disabled={!newFileName.trim()}>
                          Create
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <FileExplorer 
                  files={projectFiles.length > 0 ? projectFiles : [
                    { id: "empty", name: "No files yet", type: "file", icon: FileCode }
                  ]}
                  onFileSelect={handleFileSelect}
                  onFolderSelect={handleFolderSelect}
                  selectedFolderId={
                    currentDirectory && projectFiles.length > 0 
                      ? findFolderByPath(projectFiles, currentDirectory)
                      : undefined
                  }
                />
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {activeTab === "collaborators" && (
            <SidebarGroup>
              <SidebarGroupLabel className="flex justify-between items-center">
                Collaborators
                <button className="p-1 rounded-md hover:bg-accent">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Invite collaborator</span>
                </button>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <CollaboratorsList collaborators={collaboratorsWithCurrentUser} />
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {activeTab === "history" && (
            <SidebarGroup>
              <SidebarGroupLabel>Version History</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="text-sm text-muted-foreground p-2">
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium">Updated index.js</div>
                      <div className="text-xs opacity-70">5 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium">Added Button component</div>
                      <div className="text-xs opacity-70">Yesterday at 2:45 PM</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium">Initial commit</div>
                      <div className="text-xs opacity-70">2 days ago</div>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
} 