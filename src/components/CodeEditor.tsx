import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Code, Play, RotateCcw, Copy, Square, Maximize2, Minimize2, Sun, Moon, Settings, CheckCircle, XCircle, Clock, MemoryStick } from 'lucide-react';

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  onLanguageChange?: (language: string) => void;
  onRun?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  onCopy?: () => void;
  height?: string;
  isExecuting?: boolean;
  testInput?: string;
  onTestInputChange?: (value: string) => void;
  testOutput?: string;
  onTestOutputChange?: (value: string) => void;
  consoleOutput?: string;
  executionTime?: number;
  memoryUsage?: number;
  testResults?: Array<{ passed: boolean; input: string; expected: string; actual: string }>;
}

const SUPPORTED_LANGUAGES = [
  { value: 'cpp', label: 'C++' },
];

const DEFAULT_CODE = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    void solve() {
        // Write your solution here
        cout << "Hello, World!" << endl;
    }
};

int main() {
    Solution solution;
    solution.solve();
    return 0;
}`,
  java: `public class Solution {
    public void solve() {
        // Write your solution here
        System.out.println("Hello, World!");
    }

    public static void main(String[] args) {
        Solution solution = new Solution();
        solution.solve();
    }
}`,
  python: `class Solution:
    def solve(self):
        # Write your solution here
        print("Hello, World!")

if __name__ == "__main__":
    solution = Solution()
    solution.solve()`,
  javascript: `class Solution {
    solve() {
        // Write your solution here
        console.log("Hello, World!");
    }
}

// Test the solution
const solution = new Solution();
solution.solve();`,
  csharp: `public class Solution {
    public void Solve() {
        // Write your solution here
        Console.WriteLine("Hello, World!");
    }
}

class Program {
    static void Main(string[] args) {
        Solution solution = new Solution();
        solution.Solve();
    }
}`,
  typescript: `class Solution {
    solve(): void {
        // Write your solution here
        console.log("Hello, World!");
    }
}

// Test the solution
const solution = new Solution();
solution.solve();`,
  go: `package main

type Solution struct{}

func (s *Solution) Solve() {
    // Write your solution here
    fmt.Println("Hello, World!")
}

func main() {
    solution := &Solution{}
    solution.Solve()
}`,
  rust: `struct Solution;

impl Solution {
    pub fn solve() {
        // Write your solution here
        println!("Hello, World!");
    }
}

fn main() {
    Solution::solve();
}`,
  php: `<?php

class Solution {
    public function solve() {
        // Write your solution here
        echo "Hello, World!";
    }
}

// Test the solution
$solution = new Solution();
$solution->solve();

?>`,
  ruby: `class Solution
    def solve
        # Write your solution here
        puts "Hello, World!"
    end
end

# Test the solution
solution = Solution.new
solution.solve`,
  swift: `class Solution {
    func solve() {
        // Write your solution here
        print("Hello, World!")
    }
}

let solution = Solution()
solution.solve()`,
  kotlin: `class Solution {
    fun solve() {
        // Write your solution here
        println("Hello, World!")
    }
}

fun main() {
    val solution = Solution()
    solution.solve()
}`,
};

const CodeEditor = ({
  value,
  onChange,
  language = 'cpp',
  onLanguageChange,
  onRun,
  onStop,
  onReset,
  onCopy,
  height = '400px',
  isExecuting = false,
  testInput = '',
  onTestInputChange,
  testOutput = '',
  onTestOutputChange,
  consoleOutput = '',
  executionTime,
  memoryUsage,
  testResults = []
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState('code');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState(16);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (newLanguage: string) => {
    onLanguageChange?.(newLanguage);
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 10));
  };

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4">
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
            </div>
            <Button onClick={decreaseFontSize} variant="outline" size="sm">
              A-
            </Button>
            <Button onClick={increaseFontSize} variant="outline" size="sm">
              A+
            </Button>
            <Button onClick={toggleTheme} variant="outline" size="sm">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button onClick={toggleFullscreen} variant="outline" size="sm">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button onClick={onCopy} variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
            {isExecuting ? (
              <Button onClick={onStop} variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button onClick={onRun} variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="testcase" className="flex items-center gap-2">
              Testcase
            </TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="m-0">
            <div style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
              <Editor
                height="100%"
                language={language}
                value={value}
                onChange={onChange}
                onMount={handleEditorDidMount}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                  minimap: { enabled: false },
                  fontSize,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                  wordWrap: 'on',
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  matchBrackets: 'always',
                  autoClosingBrackets: 'always',
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  quickSuggestions: true,
                  hover: { enabled: true },
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value="testcase" className="m-0">
            <div className="grid grid-cols-2 gap-4 p-4" style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Input</h3>
                  <Badge variant="outline">stdin</Badge>
                </div>
                <Textarea
                  value={testInput}
                  onChange={(e) => onTestInputChange?.(e.target.value)}
                  placeholder="Enter test input..."
                  className="h-full resize-none font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Expected Output</h3>
                  <Badge variant="outline">stdout</Badge>
                </div>
                <Textarea
                  value={testOutput}
                  onChange={(e) => onTestOutputChange?.(e.target.value)}
                  placeholder="Enter expected output..."
                  className="h-full resize-none font-mono text-sm"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Test Results and Console */}
        <div className="border-t p-4 space-y-4">
          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Test Results</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded border">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Test Case {index + 1}</span>
                    {executionTime && (
                      <Badge variant="outline" className="ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {executionTime}ms
                      </Badge>
                    )}
                    {memoryUsage && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MemoryStick className="h-3 w-3" />
                        {memoryUsage}MB
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Console Output */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Console</h3>
            <div className="bg-muted p-3 rounded font-mono text-sm max-h-32 overflow-y-auto border">
              {consoleOutput || 'No output yet. Click "Run" to execute your code.'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
