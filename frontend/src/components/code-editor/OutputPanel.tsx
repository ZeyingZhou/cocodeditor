import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";

interface OutputPanelProps {
  output: string;
  isCompiling: boolean;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output, isCompiling }) => {
  const { theme } = useTheme();

  return (
    <div className={`h-full ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-white/90'} rounded-lg`}>
      <ScrollArea className="h-full">
        <div className="p-4">
          {isCompiling ? (
            <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Compiling...</span>
            </div>
          ) : output ? (
            <pre className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              {output}
            </pre>
          ) : (
            <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No output yet. Click the play button to compile your code.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OutputPanel;