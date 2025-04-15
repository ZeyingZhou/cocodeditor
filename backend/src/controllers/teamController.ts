import { Request, Response, NextFunction } from 'express';
import { teamService } from '../services/teamService';
import { Role } from '@prisma/client';
import { prisma } from '../database/prismaClient';



export const teamController = {
  // Create a new team
  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const createdById = req.user.id;
      
      const team = await teamService.createTeam({
        name,
        description,
        createdById,
      });
      
      res.status(201).json(team);
    } catch (error) {
      next(error);
    }
  },

  // Get all teams for the current user
  async getTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const teams = await teamService.getTeamsForUser(userId);
      res.json(teams);
    } catch (error) {
      next(error);
    }
  },

  // Get team by ID
  async getTeamById(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const userId = req.user.id;
      
      // Check if user is a member of the team
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        return res.status(403).json({ message: 'Not a member of this team' });
      }
      
      const team = await teamService.getTeamWithMembers(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      res.status(200).json(team);
    } catch (error) {
      next(error);
    }
  },

  // Add member to team using join code
  async joinTeamByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, joinCode } = req.body;
      const userId = req.user.id;
      
      // Find team by ID
      const team = await prisma.team.findUnique({
        where: { id: teamId }
      });
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      // Verify the join code
      if (team.joinCode !== joinCode.toLowerCase()) {
        return res.status(400).json({ message: 'Invalid join code' });
      }

      // Check if user is already a member
      const existingMembership = await prisma.teamMember.findUnique({
        where: {
          teamId_profileId: {
            teamId: team.id,
            profileId: userId,
          },
        },
      });
      
      if (existingMembership) {
        return res.status(400).json({ message: 'You are already a member of this team' });
      }
      
      // Add user as a member
      const member = await teamService.addMember(team.id, userId, Role.MEMBER);
      
      res.status(201).json({
        team: {
          id: team.id,
          name: team.name,
          description: team.description,
        },
        role: member.role
      });
    } catch (error) {
      next(error);
    }
  }
};
