import { prisma } from '../database/prismaClient';
import { Team, Role } from '@prisma/client';

interface CreateTeamParams {
  name: string;
  description?: string;
  createdById: string;
}

const generateCode = () => {
    const code = Array.from(
        {length: 4},
        () => 
            "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
    ).join("");

    return code;
};

export const teamService = {
  // Create a new team and make creator an admin
  async createTeam({ name, description, createdById }: CreateTeamParams): Promise<Team> {
    // Generate a unique 4-digit join code
    let joinCode = generateCode();
    let isUnique = false;
    
    // Keep trying until we get a unique code
    while (!isUnique) {
      const existingTeam = await prisma.team.findUnique({
        where: { joinCode },
      });
      
      if (!existingTeam) {
        isUnique = true;
      } else {
        joinCode = generateCode();
      }
    }
    
    return prisma.$transaction(async (tx) => {
      // Create the team with the join code
      const team = await tx.team.create({
        data: {
          name,
          description,
          ownerId: createdById,
          joinCode,
        },
      });

      // Add the creator as a team admin
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          profileId: createdById,
          role: Role.ADMIN,
        },
      });

      return team;
    });
  },

  // Get team by ID
  async getTeamById(teamId: string): Promise<Team | null> {
    return prisma.team.findUnique({
      where: { id: teamId },
    });
  },

  // Get team with members
  async getTeamWithMembers(teamId: string) {
    return prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            profile: true,
          },
        },
      },
    });
  },



  // Add member to team
  async addMember(teamId: string, profileId: string, role: Role = Role.MEMBER) {
    return prisma.teamMember.create({
      data: {
        teamId,
        profileId,
        role,
      },
    });
  },

  // Update member role
  async updateMemberRole(teamId: string, profileId: string, role: Role) {
    return prisma.teamMember.update({
      where: {
        teamId_profileId: {
          teamId,
          profileId,
        },
      },
      data: { role },
    });
  },

  // Remove member from team
  async removeMember(teamId: string, profileId: string) {
    return prisma.teamMember.delete({
      where: {
        teamId_profileId: {
          teamId,
          profileId,
        },
      },
    });
  },

  // Check if user is a member of team
  async isTeamMember(teamId: string, profileId: string): Promise<boolean> {
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_profileId: {
          teamId,
          profileId,
        },
      },
    });
    return !!member;
  },
};

