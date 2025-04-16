"use client"

import * as React from "react"
import { FileCode, FolderTree, History, Plus, Settings, Share2, Users } from "lucide-react"

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

// Sample data for demonstration
const sampleFiles = [
  { id: "1", name: "index.js", type: "file" as const, icon: FileCode },
  {
    id: "2",
    name: "components",
    type: "folder" as const,
    children: [
      { id: "3", name: "Button.jsx", type: "file" as const, icon: FileCode },
      { id: "4", name: "Card.jsx", type: "file" as const, icon: FileCode },
    ],
  },
  {
    id: "5",
    name: "styles",
    type: "folder" as const,
    children: [{ id: "6", name: "global.css", type: "file" as const, icon: FileCode }],
  },
  { id: "7", name: "package.json", type: "file" as const, icon: FileCode },
]

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

interface EditorSidebarProps extends React.ComponentProps<typeof Sidebar> {
  collaborators?: Collaborator[];
  currentUserId?: string;
  projectName?: string;
}

export function EditorSidebar({ 
  collaborators = [], 
  currentUserId, 
  projectName, 
  ...props 
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<"files" | "collaborators" | "history">("files")
  const [currentProject, setCurrentProject] = React.useState(
    projectName 
      ? { id: "current", name: projectName, path: "" } 
      : sampleProjects[0]
  )

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
                <button className="p-1 rounded-md hover:bg-accent">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add file</span>
                </button>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <FileExplorer files={sampleFiles} />
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