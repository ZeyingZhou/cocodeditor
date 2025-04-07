import { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { teamService } from '../services/teamService';

export const projectController = {
  /**
   * Create a new project
   */
  async createProject(req: Request, res: Response) {
    try {
      const { name, description, teamId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!name || !teamId) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      // TODO: Verify user is a member of the team
      // const isMember = await teamService.isTeamMember(userId, teamId);
      // if (!isMember) {
      //   return res.status(403).json({ message: 'You are not a member of this team' });
      // }
      
      const project = await projectService.createProject({
        name,
        description,
        teamId
      });
      res.status(201).json(project);
    } catch (error: any) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: error.message || 'Failed to create project' });
    }
  },

  /**
   * Get projects by team ID
   */
  async getProjectsByTeamId(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!teamId) {
        res.status(400).json({ message: 'Team ID is required' });
        return;
      }

      // TODO: Verify user is a member of the team
      // const isMember = await teamService.isTeamMember(userId, teamId);
      // if (!isMember) {
      //   return res.status(403).json({ message: 'You are not a member of this team' });
      // }

      const projects = await projectService.getProjectsByTeamId(teamId);
      res.status(200).json(projects);
    } catch (error: any) {
      console.error('Error fetching team projects:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch team projects' });
    }
  },

  /**
   * Get project by ID
   */
  async getProjectById(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!projectId) {
        res.status(400).json({ message: 'Project ID is required' });
        return;
      }

      const project = await projectService.getProjectById(projectId);
      
      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      // TODO: Verify user is a member of the project's team
      // const isMember = await teamService.isTeamMember(userId, project.teamId);
      // if (!isMember) {
      //   return res.status(403).json({ message: 'You do not have access to this project' });
      // }

      res.status(200).json(project);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch project' });
    }
  },

  /**
   * Delete a project by ID
   */
  async deleteProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!projectId) {
        res.status(400).json({ message: 'Project ID is required' });
        return;
      }

      // First get the project to check team ownership
      const project = await projectService.getProjectById(projectId);
      
      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      // TODO: Verify user is a team admin or owner
      const hasPermission = await teamService.hasDeletePermission(userId, project.teamId);
      if (!hasPermission) {
        res.status(403).json({ message: 'You do not have permission to delete this project' });
      }

      const deletedProject = await projectService.deleteProject(projectId);
      res.status(200).json({ message: 'Project deleted successfully', project: deletedProject });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: error.message || 'Failed to delete project' });
    }
  }
};
