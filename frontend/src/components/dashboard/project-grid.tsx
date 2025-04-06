import { Code, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Project {
  id: string
  name: string
  description: string
  language: string
  lastEdited: string
}

interface ProjectGridProps {
  projects: Project[]
  onDeleteProject: (id: string) => void
}

export function ProjectGrid({ projects, onDeleteProject }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Code className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold">No projects found</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Get started by creating a new project or try a different search term.
        </p>
      </div>
    )
  }


  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2">{project.description}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Open Project</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDeleteProject(project.id)} className="text-destructive">Delete Project</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="h-32 rounded-md bg-muted flex items-center justify-center">
              <Code className="h-12 w-12 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Badge variant="outline">{project.language}</Badge>
            <span className="text-xs text-muted-foreground">Edited {project.lastEdited}</span>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

