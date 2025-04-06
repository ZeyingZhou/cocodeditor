import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { supabaseClient } from '../database/supabaseClient';

// Extend Request type to include the user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

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
      return
    }
    const decoded = jwt.decode(token) as any;

    if (!decoded || !decoded.sub) {
      res.status(401).json({ message: 'Invalid token format' });
      return
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };
    // Add user to request object
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: 'Authentication failed' });
    return
  }
};