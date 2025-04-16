import express from "express";
import projectRoutes from "./project";
import teamRoutes from "./team";
import { authenticate } from '../middleware/auth';
import { teamController } from '../controllers/teamController';

const router = express.Router();

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Public routes
router.get("/", (req, res) => {
  res.send("Hello World!");
});

// Direct route for joining team by code
router.post("/teams/join-by-code-direct", authenticate, teamController.joinTeamByCodeOnly);

// Team routes
router.use("/teams", teamRoutes);

// Project routes
router.use("/projects", projectRoutes);

export default router;