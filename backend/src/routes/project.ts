import express from 'express';
import { projectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware correctly
// router.use(authenticate);

// Project routes
router.post('/', authenticate, projectController.createProject);
router.get('/:projectId', authenticate, projectController.getProjectById);

// Team projects route
router.get('/team/:teamId', authenticate, projectController.getProjectsByTeamId);
router.delete('/:projectId', authenticate, projectController.deleteProject);
// // Team member routes
// router.post('/:teamId/members', teamController.addMember);
// router.patch('/:teamId/members/:profileId', teamController.updateMemberRole);
// router.delete('/:teamId/members/:profileId', teamController.removeMember);

export default router;
