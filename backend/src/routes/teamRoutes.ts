import { Router } from 'express';
import { teamController } from '../controllers/teamController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, teamController.createTeam);
router.get('/', authenticateToken, teamController.getTeamsForUser);
router.get('/:teamId', authenticateToken, teamController.getTeamById);
router.post('/join', authenticateToken, teamController.joinTeam);

export default router; 