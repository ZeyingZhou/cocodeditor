import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Extend Request type to include the user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get authorization header
    let authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: 'Authorization header missing' });
      return;
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
   
    if (!token) {
      res.status(401).json({ message: 'Bearer token missing' });
      return;
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: 'Authentication failed' });
    return;
  }
};