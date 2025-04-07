import express from 'express';
import { projectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Project routes
router.post('/', authenticate, projectController.createProject);
router.get('/:projectId', authenticate, projectController.getProjectById);

// Team projects route
router.get('/team/:teamId', authenticate, projectController.getProjectsByTeamId);
router.delete('/:projectId', authenticate, projectController.deleteProject);

// Ensure projectId is defined
router.param('projectId', (req, res, next, projectId) => {
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  next();
});

// Ensure teamId is defined
router.param('teamId', (req, res, next, teamId) => {
  if (!teamId) {
    return res.status(400).json({ error: 'Team ID is required' });
  }
  next();
});

export default router;
