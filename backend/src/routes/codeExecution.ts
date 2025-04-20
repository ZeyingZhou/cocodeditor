import express from 'express';
import { executeCode } from '../utils/judge0Client';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Execute code route
 * POST /api/execute
 * Body: { code: string, language: string, stdin?: string, compilerOptions?: string }
 */
router.post('/execute', authenticate, async (req, res) => {
  try {
    const { code, language, stdin, compilerOptions } = req.body;

    // Validate required fields
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // Execute the code
    const result = await executeCode(
      code,
      language,
      stdin || '',
      compilerOptions || ''
    );

    return res.json(result);
  } catch (error) {
    console.error('Error in code execution route:', error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
});

export default router; 