import express from "express";
import projectRoutes from "./project";
import teamRoutes from "./team";
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Public routes
router.get("/", (req, res) => {
  res.send("Hello World!");
});

// Team routes
router.use("/teams", teamRoutes);

// Project routes
router.use("/projects", projectRoutes);

export default router;