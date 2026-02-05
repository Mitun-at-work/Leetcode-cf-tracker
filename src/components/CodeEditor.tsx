import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Play, RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  onLanguageChange?: (language: string) => void;
  onRun?: () => void;
  onReset?: () => void;
  height?: string;
}

const SUPPORTED_LANGUAGES = [
  { value: 'cpp', label: 'C++' },
];

const DEFAULT_CODE = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    cout << "Hello, World!" << endl;
    return 0;
}`,
};

const CodeEditor = ({
  value,
  onChange,
  language = 'javascript',
  onLanguageChange,
  onRun,
  onReset,
  height = '400px'
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (newLanguage: string) => {
    onLanguageChange?.(newLanguage);
    // Set default code for the new language if no value is provided
    if (!value && DEFAULT_CODE[newLanguage as keyof typeof DEFAULT_CODE]) {
      onChange?.(DEFAULT_CODE[newLanguage as keyof typeof DEFAULT_CODE]);
    }
  };

  const handleReset = () => {
    if (DEFAULT_CODE[language as keyof typeof DEFAULT_CODE]) {
      onChange?.(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE]);
    }
    onReset?.();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onRun} variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <Editor
            height="100%"
            language={language}
            value={value}
            onChange={onChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;