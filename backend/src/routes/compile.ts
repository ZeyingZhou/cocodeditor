import express, { Request, Response, Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const router: Router = express.Router();
const execAsync = promisify(exec);

// Create a temporary directory for compilation
const tempDir = path.join(os.tmpdir(), 'code-compiler');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

interface CompileRequest {
  code: string;
  fileType: string;
}

type CompileHandler = (req: Request<{}, {}, CompileRequest>, res: Response) => void;

const compileHandler: CompileHandler = (req, res) => {
  const { code, fileType } = req.body;

  if (!code || !fileType) {
    res.status(400).json({ error: 'Code and file type are required' });
    return;
  }

  // Create a temporary file
  const tempFile = path.join(tempDir, `temp.${fileType}`);
  fs.writeFileSync(tempFile, code);

  let command = '';
  let output = '';

  // Handle different file types
  switch (fileType) {
    case 'js':
      command = `node ${tempFile}`;
      break;
    case 'py':
      command = `python ${tempFile}`;
      break;
    case 'cpp':
      command = `g++ ${tempFile} -o ${tempFile}.out && ./${tempFile}.out`;
      break;
    case 'java':
      command = `javac ${tempFile} && java ${tempFile.replace('.java', '')}`;
      break;
    default:
      res.status(400).json({ error: `Unsupported file type: ${fileType}` });
      return;
  }

  // Execute the command
  execAsync(command)
    .then(({ stdout, stderr }) => {
      output = stdout || stderr;

      // Clean up
      fs.unlinkSync(tempFile);
      if (fs.existsSync(`${tempFile}.out`)) {
        fs.unlinkSync(`${tempFile}.out`);
      }

      res.json({ output });
    })
    .catch((error) => {
      console.error('Compilation error:', error);
      res.status(500).json({ error: (error as Error).message });
    });
};

router.post('/', compileHandler);

export default router; 