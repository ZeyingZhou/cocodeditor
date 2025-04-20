import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';

// RapidAPI headers for Judge0
const headers = {
  'X-RapidAPI-Key': JUDGE0_API_KEY,
  'X-RapidAPI-Host': JUDGE0_API_HOST,
  'Content-Type': 'application/json'
};

// Map of language names to Judge0 language IDs
// Reference: https://api.judge0.com/languages/
export const LANGUAGE_ID_MAP: Record<string, number> = {
  'c': 50,        // C (GCC 9.2.0)
  'cpp': 54,      // C++ (GCC 9.2.0)
  'java': 62,     // Java (OpenJDK 13.0.1)
  'python': 71,   // Python (3.8.1)
  'javascript': 63, // JavaScript (Node.js 12.14.0)
  'typescript': 74, // TypeScript (3.7.4)
  'go': 60,       // Go (1.13.5)
  'rust': 73,     // Rust (1.40.0)
  'ruby': 72,     // Ruby (2.7.0)
  'php': 68,      // PHP (7.4.1)
  'csharp': 51,   // C# (Mono 6.6.0.161)
  'kotlin': 78,   // Kotlin (1.3.70)
  'swift': 83,    // Swift (5.2.3)
};

/**
 * Get Judge0 language ID from language name
 */
export function getLanguageId(language: string): number {
  const languageId = LANGUAGE_ID_MAP[language.toLowerCase()];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return languageId;
}

/**
 * Submit code to Judge0 API
 */
export async function submitCode(
  sourceCode: string,
  languageName: string,
  stdin: string = '',
  compilerOptions: string = '',
  timeLimit: number = 5,  // in seconds
  memoryLimit: number = 512000  // in kilobytes
) {
  try {
    const languageId = getLanguageId(languageName);
    
    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions`,
      {
        source_code: sourceCode,
        language_id: languageId,
        stdin,
        compiler_options: compilerOptions,
        time_limit: timeLimit,
        memory_limit: memoryLimit,
      },
      { 
        headers,
        params: {
          base64_encoded: 'false',
          fields: '*'
        }
      }
    );

    return response.data.token;
  } catch (error) {
    console.error('Error submitting code:', error);
    if (axios.isAxiosError(error) && error.response) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Unknown error';
      throw new Error(`Submission failed: ${errorMessage}`);
    } else {
      throw new Error('Failed to submit code to Judge0 API');
    }
  }
}

/**
 * Get status of a submission
 */
export async function getSubmissionStatus(token: string) {
  try {
    const response = await axios.get(
      `${JUDGE0_API_URL}/submissions/${token}`,
      { 
        headers,
        params: {
          base64_encoded: 'false',
          fields: '*'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error getting submission status:', error);
    if (axios.isAxiosError(error) && error.response) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Unknown error';
      throw new Error(`Getting status failed: ${errorMessage}`);
    } else {
      throw new Error('Failed to get submission status from Judge0 API');
    }
  }
}

/**
 * Wait for submission to complete (polling)
 */
export async function waitForSubmission(token: string, maxAttempts: number = 10, delay: number = 1000) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const submission = await getSubmissionStatus(token);
    
    // If status is not 'In Queue' or 'Processing', return result
    if (submission.status.id !== 1 && submission.status.id !== 2) {
      return submission;
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, delay));
    attempts++;
  }
  
  throw new Error('Submission processing timeout');
}

/**
 * Format Judge0 result into a more user-friendly format
 */
export function formatJudge0Result(result: any) {
  // Status codes: https://ce.judge0.com/#statuses-and-specifications
  const statusMap: Record<number, string> = {
    1: 'In Queue',
    2: 'Processing',
    3: 'Accepted',
    4: 'Wrong Answer',
    5: 'Time Limit Exceeded',
    6: 'Compilation Error',
    7: 'Runtime Error (SIGSEGV)',
    8: 'Runtime Error (SIGXFSZ)',
    9: 'Runtime Error (SIGFPE)',
    10: 'Runtime Error (SIGABRT)',
    11: 'Runtime Error (NZEC)',
    12: 'Runtime Error (Other)',
    13: 'Internal Error',
    14: 'Exec Format Error'
  };

  const formattedResult = {
    status: {
      id: result.status.id,
      description: statusMap[result.status.id] || result.status.description
    },
    compile_output: result.compile_output || null,
    stdout: result.stdout || null,
    stderr: result.stderr || null,
    execution_time: result.time,
    memory: result.memory,
    language: {
      id: result.language.id,
      name: result.language.name
    },
    error: null as string | null
  };

  // Add a more user-friendly error message
  if (result.status.id === 6) { // Compilation Error
    formattedResult.error = 'Compilation Error: ' + (result.compile_output || 'Unknown compilation error');
  } else if (result.status.id >= 7 && result.status.id <= 12) { // Runtime Errors
    formattedResult.error = `Runtime Error: ${statusMap[result.status.id]}${result.stderr ? '\n' + result.stderr : ''}`;
  } else if (result.status.id === 5) { // Time Limit Exceeded
    formattedResult.error = 'Time Limit Exceeded: Your code took too long to execute';
  } else if (result.status.id === 13) { // Internal Error
    formattedResult.error = 'Internal Server Error: Please try again later';
  }

  return formattedResult;
}

/**
 * Execute code and return results
 */
export async function executeCode(
  sourceCode: string,
  languageName: string,
  stdin: string = '',
  compilerOptions: string = ''
) {
  try {
    // Submit code
    const token = await submitCode(sourceCode, languageName, stdin, compilerOptions);
    
    // Wait for completion
    const result = await waitForSubmission(token);
    
    // Format and return results
    return formatJudge0Result(result);
  } catch (error) {
    console.error('Error executing code:', error);
    if (error instanceof Error) {
      return {
        status: { id: -1, description: 'Execution Failed' },
        compile_output: null,
        stdout: null,
        stderr: null,
        execution_time: null,
        memory: null,
        language: { id: -1, name: languageName },
        error: error.message
      };
    } else {
      return {
        status: { id: -1, description: 'Execution Failed' },
        compile_output: null,
        stdout: null,
        stderr: null,
        execution_time: null,
        memory: null,
        language: { id: -1, name: languageName },
        error: 'Unknown error occurred during execution'
      };
    }
  }
} 