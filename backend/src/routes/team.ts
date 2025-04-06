import express from 'express';
import { teamController } from '../controllers/teamController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware correctly
// router.use(authenticate);

// Team routes
router.post('/', authenticate,teamController.createTeam);
router.get('/', authenticate,teamController.getTeams);
router.get('/:teamId', authenticate,teamController.getTeamById);

// Join team by code
router.post('/join', authenticate,teamController.joinTeamByCode);

// // Team member routes
// router.post('/:teamId/members', teamController.addMember);
// router.patch('/:teamId/members/:profileId', teamController.updateMemberRole);
// router.delete('/:teamId/members/:profileId', teamController.removeMember);

export default router;
