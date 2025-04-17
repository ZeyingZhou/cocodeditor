import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import { FileCode, Braces } from "lucide-react";

interface OutputPanelProps {
  output: string;
  isCompiling: boolean;
  language?: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output, isCompiling, language = "javascript" }) => {
  const { theme } = useTheme();

  const getLanguageIcon = () => {
    switch (language) {
      case 'python':
        return <Braces className="h-4 w-4" />;
      case 'javascript':
      case 'typescript':
        return <FileCode className="h-4 w-4" />;
      case 'c':
      case 'cpp':
        return <Braces className="h-4 w-4" />;
      case 'java':
        return <FileCode className="h-4 w-4" />;
      default:
        return <FileCode className="h-4 w-4" />;
    }
  };

  return (
    <div className={`h-full ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-white/90'} rounded-lg`}>
      <ScrollArea className="h-full">
        <div className="p-4">
          {isCompiling ? (
            <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Running {language}...</span>
            </div>
          ) : output ? (
            <>
              <div className={`flex items-center mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                {getLanguageIcon()}
                <span className="ml-1 capitalize">{language} output:</span>
              </div>
              <pre className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'} p-2 rounded-md ${theme === 'dark' ? 'bg-black/30' : 'bg-gray-100/80'}`}>
                {output}
              </pre>
            </>
          ) : (
            <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="flex flex-col items-center gap-2">
                {getLanguageIcon()}
                <p>No output yet. Click the play button to run your code.</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OutputPanel;