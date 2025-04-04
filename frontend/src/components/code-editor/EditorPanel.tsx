import React from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import { editor } from "monaco-editor";

declare global {
  interface Window {
    editor: editor.IStandaloneCodeEditor;
  }
}

interface EditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ code, onCodeChange }) => {
  const [isMinimapVisible, setIsMinimapVisible] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    // Store editor instance for future use
    window.editor = editor;
  };

  return (
    <div className="relative h-full flex">
      <div className="flex-1 h-full">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue={code}
          onChange={onCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: {
              enabled: isMinimapVisible,
              maxColumn: 80,
              renderCharacters: false,
            },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            cursorStyle: "line",
            automaticLayout: true,
            wordWrap: "on",
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
              arrowSize: 30,
            },
          }}
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
    </div>
  );
};