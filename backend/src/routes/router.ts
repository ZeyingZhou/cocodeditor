import express from "express";
import projectRoutes from "./project";
import teamRoutes from "./team";
import { authenticate } from '../middleware/auth';
import { teamController } from '../controllers/teamController';
import { fileController } from '../controllers/fileController';

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

// File routes
router.post("/files", authenticate, fileController.createFile);
router.get("/files/project/:projectId", authenticate, fileController.getProjectFiles);
router.get("/files/:fileId", authenticate, fileController.getFileById);
router.put("/files/:fileId", authenticate, fileController.updateFile);
router.delete("/files/:fileId", authenticate, fileController.deleteFile);

// Team routes
router.use("/teams", teamRoutes);

// Project routes
router.use("/projects", projectRoutes);

export default router;