import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Collaborator {
  id: string
  name: string
  avatar?: string
  status: "online" | "idle" | "offline"
}

interface CollaboratorsListProps {
  collaborators: Collaborator[]
}

export function CollaboratorsList({ collaborators }: CollaboratorsListProps) {
  const getStatusColor = (status: Collaborator["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "idle":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
    }
  }

  return (
    <div className="py-1">
      {collaborators.map((collaborator) => (
        <div
          key={collaborator.id}
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
            "hover:bg-accent hover:text-accent-foreground",
            "transition-colors"
          )}
        >
          <div className="relative">
            <Avatar className="h-6 w-6">
              <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
              <AvatarFallback>
                {collaborator.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-background",
                getStatusColor(collaborator.status)
              )}
            />
          </div>
          <span className="truncate">{collaborator.name}</span>
        </div>
      ))}
    </div>
  )
} 