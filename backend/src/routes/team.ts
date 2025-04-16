import express from 'express';
import { teamController } from '../controllers/teamController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware
router.use(authenticate);

// Team routes
router.post('/', teamController.createTeam);
router.get('/', teamController.getTeams);
router.get('/:teamId', teamController.getTeamById);

// Join team by code
router.post('/join', teamController.joinTeamByCode);

// Join team using only the join code
router.post('/join-by-code', teamController.joinTeamByCodeOnly);

// Ensure teamId is defined
router.param('teamId', (req, res, next, teamId) => {
  if (!teamId) {
    return res.status(400).json({ error: 'Team ID is required' });
  }
  next();
});

// Team member routes
// router.post('/:teamId/members', teamController.addMember);
// router.patch('/:teamId/members/:profileId', teamController.updateMemberRole);
// router.delete('/:teamId/members/:profileId', teamController.removeMember);

export default router;
