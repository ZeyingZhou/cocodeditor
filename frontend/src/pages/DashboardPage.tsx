import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { supabaseClient } from "@/config/supabase-client";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/providers/auth-context-provider";
const sampleProjects = [
  {
    id: "1",
    name: "React Todo App",
    description: "A simple todo application built with React",
    lastEdited: "2 hours ago",
    language: "TypeScript",
  },
]

const DashboardPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState(sampleProjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)


  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateProject = async (newProject: any) => {
    try {
      // Show loading state if needed
      setIsLoading(true);
      
      // Call your Express API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication token if needed
          // 'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...newProject,
          userId: user?.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      // Get the newly created project with its ID from the server
      const createdProject = await response.json();
      
      // Update the local state with the project from the server
      setProjects([createdProject, ...projects]);
      
      // Close the dialog
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      // Handle error (show toast notification, etc.)
    } finally {
      setIsLoading(false);
    }
  }

    return (
        <>
        <SidebarProvider>
            <DashboardSidebar/>
            <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger className="h-8 w-8" />
              <div className="flex flex-1 items-center gap-4">
                <h1 className="text-xl font-semibold">Code Editor Dashboard</h1>
                <div className="ml-auto flex items-center gap-4">
                  <div className="relative w-full md:w-64 lg:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search projects..."
                      className="w-full pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </div>
              </div>
            </header>
            <main className="flex-1 p-6">
              <ProjectGrid projects={filteredProjects} />
            </main>
          </div>
        </SidebarInset>
        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateProject={handleCreateProject}
        />
        </SidebarProvider>
        </>
    )
}
export default DashboardPage;