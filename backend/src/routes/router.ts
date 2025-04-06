import express from "express";
import { createClient } from "@supabase/supabase-js";
// import profileRoutes from "./profile";
import projectRoutes from "./project";
import teamRoutes from "./team";
// import fileRoutes from "./file";
import { authenticate } from '../middleware/auth';
// import { supabaseClient } from "../database/supabaseClient";

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "https://your-supabase-url.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "your-supabase-service-role-key";
// const supabase = createClient(supabaseUrl, supabaseKey);


// Public routes
router.get("/", (req, res) => {
  res.send("Hello World!");
});

// router.use("/profile", profileRoutes);
// router.use("/projects", projectRoutes);
router.use("/teams", teamRoutes);
router.use("/projects", projectRoutes);
// router.use("/files", fileRoutes);

// Protected routes - apply authentication




export default router;