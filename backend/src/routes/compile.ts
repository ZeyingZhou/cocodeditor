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

const compileHandler: CompileHandler = async (req, res) => {
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
  try {
    switch (fileType) {
      case 'js':
        command = `node ${tempFile}`;
        break;
      case 'py':
        command = `python ${tempFile}`;
        break;
      case 'cpp':
        if (os.platform() === 'darwin') {
          // Check if Xcode Command Line Tools are installed on macOS
          try {
            await execAsync('xcode-select -p');
          } catch (error) {
            // If the command fails, the tools are not installed
            res.status(500).json({ 
              error: 'C++ compilation requires Xcode Command Line Tools. Please install them by running "xcode-select --install" in your terminal.' 
            });
            return;
          }
        }
        
        // Create output file path
        const outputFile = `${tempFile}.out`;
        // Use proper path and add "./" for executing the compiled program
        command = `g++ ${tempFile} -o ${outputFile} && cd "${path.dirname(outputFile)}" && ./temp.${fileType}.out`;
        break;
      case 'java':
        // For Java, we need to extract the public class name and use it for execution
        // or use the directory for compilation if no public class is found
        const javaContent = fs.readFileSync(tempFile, 'utf-8');
        
        // Use a regex to find public class name if exists
        const publicClassMatch = javaContent.match(/public\s+class\s+(\w+)/);
        const tempDir = path.dirname(tempFile);
        
        if (publicClassMatch) {
          const className = publicClassMatch[1];
          // If a public class is found, rename file to match class name
          const classFile = path.join(tempDir, `${className}.java`);
          fs.writeFileSync(classFile, javaContent);
          
          command = `cd ${tempDir} && javac ${className}.java && java ${className}`;
          
          // Clean up will need to include this file too
          setTimeout(() => {
            if (fs.existsSync(classFile)) {
              fs.unlinkSync(classFile);
            }
            // Also clean up .class files
            const classOutput = path.join(tempDir, `${className}.class`);
            if (fs.existsSync(classOutput)) {
              fs.unlinkSync(classOutput);
            }
          }, 1000);
        } else {
          // If no public class, compile and run from directory
          command = `cd ${tempDir} && javac temp.java && java -cp ${tempDir} temp`;
        }
        break;
      default:
        res.status(400).json({ error: `Unsupported file type: ${fileType}` });
        return;
    }

    // Execute the command
    const { stdout, stderr } = await execAsync(command);
    output = stdout || stderr;

    // Clean up
    try {
      fs.unlinkSync(tempFile);
      if (fs.existsSync(`${tempFile}.out`)) {
        fs.unlinkSync(`${tempFile}.out`);
      }
      
      // Clean up any other class files 
      fs.readdirSync(tempDir).forEach(file => {
        if (file.endsWith('.class')) {
          fs.unlinkSync(path.join(tempDir, file));
        }
      });
    } catch (err) {
      console.error('Error during cleanup:', err);
    }

    res.json({ output });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error('Compilation error:', errorMessage);
    
    // Check for specific error messages and provide more helpful responses
    if (errorMessage.includes('xcrun: error: invalid active developer path') || 
        errorMessage.includes('missing xcrun')) {
      res.status(500).json({ 
        error: 'C++ compilation requires Xcode Command Line Tools. Please install them by running "xcode-select --install" in your terminal.' 
      });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};

router.post('/', compileHandler);

export default router; 