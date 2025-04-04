import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "https://your-supabase-url.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "your-supabase-service-role-key";
const supabase = createClient(supabaseUrl, supabaseKey);

router.get("/", (req, res) => {
  res.send("Hello World!");
});

// API to fetch all users
router.get("/users", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { data: users, error } = await supabase.from("users").select("*");
    if (error) {
      res.status(500).json({ error: error.message });
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;