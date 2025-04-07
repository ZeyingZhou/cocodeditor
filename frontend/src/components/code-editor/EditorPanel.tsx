import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import { editor } from "monaco-editor";

declare global {
  interface Window {
    editor: editor.IStandaloneCodeEditor;
  }
}

export interface EditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  isDebugging?: boolean;
  breakpoints?: number[];
  currentLine?: number | null;
  onBreakpointToggle?: (line: number) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  code,
  onCodeChange,
  isDebugging = false,
  breakpoints = [],
  currentLine = null,
  onBreakpointToggle,
}) => {
  const { theme } = useTheme();
  const [isMinimapVisible, setIsMinimapVisible] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    // Store editor instance for future use
    window.editor = editor;

    // Add breakpoint decoration
    editor.onMouseDown((e: any) => {
      const target = e.target;
      if (target.type === 6) { // GUTTER_GLYPH_MARGIN
        const lineNumber = target.position.lineNumber;
        if (onBreakpointToggle) {
          onBreakpointToggle(lineNumber);
        }
      }
    });
  };

  return (
    <div className="relative h-full flex">
      <div className="flex-1 h-full">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={onCodeChange}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: isMinimapVisible },
            fontSize: 14,
            lineNumbers: "on",
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 20,
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            renderLineHighlight: isDebugging ? 'all' : 'none',
          }}
          onMount={handleEditorDidMount}
          decorations={
            isDebugging
              ? [
                  ...breakpoints.map(line => ({
                    range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
                    options: {
                      isWholeLine: true,
                      glyphMarginClassName: 'breakpoint',
                      glyphMarginHoverMessage: { value: 'Breakpoint' },
                    },
                  })),
                  ...(currentLine
                    ? [
                        {
                          range: {
                            startLineNumber: currentLine,
                            startColumn: 1,
                            endLineNumber: currentLine,
                            endColumn: 1,
                          },
                          options: {
                            isWholeLine: true,
                            className: 'current-line',
                            glyphMarginClassName: 'current-line-marker',
                          },
                        },
                      ]
                    : []),
                ]
              : undefined
          }
        />
      </div>
      <div className="absolute right-4 top-4 flex flex-col space-y-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimapVisible(!isMinimapVisible)}
          className="bg-white/10 hover:bg-white/20"
        >
          {isMinimapVisible ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/10 hover:bg-white/20"
        >
          {isFullscreen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      <style jsx global>{`
        .breakpoint {
          background-color: ${theme === 'dark' ? '#ff4444' : '#ff0000'};
          border-radius: 50%;
          width: 8px;
          height: 8px;
          margin-top: 6px;
          margin-left: 4px;
        }
        .current-line {
          background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        }
        .current-line-marker {
          background-color: ${theme === 'dark' ? '#007acc' : '#007acc'};
          width: 2px;
          height: 100%;
          margin-left: 0;
        }
      `}</style>
    </div>
  );
};

export default EditorPanel;