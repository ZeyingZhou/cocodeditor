import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ProjectGrid } from "@/components/dashboard/project-grid";

const sampleProjects = [
  {
    id: "1",
    name: "React Todo App",
    description: "A simple todo application built with React",
    lastEdited: "2 hours ago",
    language: "TypeScript",
  },
  {
    id: "2",
    name: "Portfolio Website",
    description: "Personal portfolio showcasing my work",
    lastEdited: "Yesterday",
    language: "JavaScript",
  },
  {
    id: "3",
    name: "E-commerce API",
    description: "Backend API for an e-commerce platform",
    lastEdited: "3 days ago",
    language: "Node.js",
  },
  {
    id: "4",
    name: "Weather App",
    description: "App that displays weather information",
    lastEdited: "1 week ago",
    language: "React",
  },
  {
    id: "5",
    name: "Blog Platform",
    description: "Full-stack blog platform with authentication",
    lastEdited: "2 weeks ago",
    language: "Next.js",
  },
  {
    id: "6",
    name: "Chat Application",
    description: "Real-time chat application with WebSockets",
    lastEdited: "1 month ago",
    language: "JavaScript",
  },
]


const DashboardPage = () => {
  const [projects, setProjects] = useState(sampleProjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateProject = (newProject: any) => {
    setProjects([
      {
        id: (projects.length + 1).toString(),
        lastEdited: "Just now",
        ...newProject,
      },
      ...projects,
    ])
    setIsCreateDialogOpen(false)
  }

    return (
        <>
        <SidebarProvider>
            <DashboardSidebar />
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