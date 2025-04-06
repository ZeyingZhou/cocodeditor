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
import { useParams } from "react-router-dom";



const DashboardPage = () => {
  const { user, session } = useAuth();
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { teamId } = useParams();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!teamId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects/team/${teamId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch projects');
        
        const data = await response.json();
        console.log(data);
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [teamId]);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateProject = async (newProject: any) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          teamId: teamId,
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const createdProject = await response.json();
      setProjects([createdProject, ...projects]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      setProjects(projects.filter(project => project.id !== projectId));
      
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              <ProjectGrid 
                projects={filteredProjects} 
                onDeleteProject={handleDeleteProject}
              />
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