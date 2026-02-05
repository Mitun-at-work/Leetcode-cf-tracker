import { useState, useCallback, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { CheckCircle, XCircle, Pen, Eraser, RotateCcw, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import ApiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const DrawingBoard = ({ onDrawingChange }: { onDrawingChange?: (dataUrl: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [isDrawing, tool, color, lineWidth]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && onDrawingChange) {
      onDrawingChange(canvas.toDataURL());
    }
  }, [onDrawingChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (onDrawingChange) {
      onDrawingChange('');
    }
  }, [onDrawingChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={tool === 'pen' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('pen')}
        >
          <Pen className="w-4 h-4 mr-1" />
          Pen
        </Button>
        <Button
          variant={tool === 'eraser' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('eraser')}
        >
          <Eraser className="w-4 h-4 mr-1" />
          Eraser
        </Button>
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear
        </Button>
        {tool === 'pen' && (
          <>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer"
            />
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={1}>Thin</option>
              <option value={2}>Medium</option>
              <option value={4}>Thick</option>
              <option value={6}>Extra Thick</option>
            </select>
          </>
        )}
      </div>
      <div className="border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
};

const PracticeSession = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [input, setInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [actualOutput, setActualOutput] = useState('');
  const [testResult, setTestResult] = useState<'pending' | 'pass' | 'fail' | null>(null);
  const [isApproachDialogOpen, setIsApproachDialogOpen] = useState(false);

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCode(value || '');
  }, []);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
  }, []);

  const handleRunCode = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to run');
      return;
    }

    setTestResult('pending');

    try {
      const result = await ApiService.executeCppCode(code, input);
      setActualOutput(result.output);

      if (result.success) {
        // Compare outputs if expected output is provided
        if (expectedOutput.trim()) {
          const normalizedActual = result.output.trim();
          const normalizedExpected = expectedOutput.trim();

          if (normalizedActual === normalizedExpected) {
            setTestResult('pass');
            toast.success('Test passed! ✅');
          } else {
            setTestResult('fail');
            toast.error('Test failed! ❌');
          }
        } else {
          setTestResult(null);
          toast.success('Code executed successfully!');
        }
      } else {
        setTestResult('fail');
        toast.error('Code execution failed');
        console.error('Execution error:', result.output);
      }
    } catch (error) {
      setTestResult('fail');
      toast.error('Failed to execute code');
      console.error('API error:', error);
    }
  }, [code, input, expectedOutput]);

  const handleResetCode = useCallback(() => {
    setCode('');
  }, []);

  const handleCopyCode = useCallback(async () => {
    if (!code.trim()) {
      toast.error('No code to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard! 📋');
    } catch (error) {
      toast.error('Failed to copy code to clipboard');
      console.error('Clipboard error:', error);
    }
  }, [code]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Practice Session</h1>
          <p className="text-muted-foreground">Write your approach and code solutions</p>
        </div>
        <Dialog open={isApproachDialogOpen} onOpenChange={setIsApproachDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Approach & Planning
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visual Planning Board</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <DrawingBoard />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Test Panel and Code Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Test Cases */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test Case</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Input */}
              <div>
                <Label htmlFor="test-input" className="text-xs font-medium text-muted-foreground mb-2 block">
                  Input
                </Label>
                <Textarea
                  id="test-input"
                  placeholder="Enter test input here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>

              {/* Expected Output */}
              <div>
                <Label htmlFor="expected-output" className="text-xs font-medium text-muted-foreground mb-2 block">
                  Expected Output
                </Label>
                <Textarea
                  id="expected-output"
                  placeholder="Enter expected output here..."
                  value={expectedOutput}
                  onChange={(e) => setExpectedOutput(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>

              {/* Test Results */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Test Results
                  </Label>
                  {testResult && (
                    <div className="flex items-center gap-2">
                      {testResult === 'pass' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {testResult === 'fail' && <XCircle className="h-4 w-4 text-red-500" />}
                      {testResult === 'pending' && <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                      <span className={`text-xs font-medium ${
                        testResult === 'pass' ? 'text-green-600' :
                        testResult === 'fail' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {testResult === 'pass' ? 'PASSED' :
                         testResult === 'fail' ? 'FAILED' :
                         'RUNNING...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Output Comparison */}
                {expectedOutput.trim() && actualOutput && (
                  <div className="space-y-2 mb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Expected Output
                        </Label>
                        <div className="p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-xs font-mono whitespace-pre-wrap min-h-[60px] max-h-[100px] overflow-y-auto">
                          {expectedOutput.trim()}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Your Output
                        </Label>
                        <div className={`p-2 border rounded text-xs font-mono whitespace-pre-wrap min-h-[60px] max-h-[100px] overflow-y-auto ${
                          testResult === 'pass'
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        }`}>
                          {actualOutput.trim() || 'No output'}
                        </div>
                      </div>
                    </div>

                    {testResult === 'fail' && (
                      <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                        <strong>Difference:</strong>
                        <div className="mt-1 font-mono whitespace-pre-wrap">
                          {(() => {
                            const expected = expectedOutput.trim();
                            const actual = actualOutput.trim();

                            if (expected === actual) {
                              return "Outputs match exactly";
                            }

                            // Simple diff: show line by line differences
                            const expectedLines = expected.split('\n');
                            const actualLines = actual.split('\n');
                            const maxLines = Math.max(expectedLines.length, actualLines.length);
                            const differences: string[] = [];

                            for (let i = 0; i < maxLines; i++) {
                              const expLine = expectedLines[i] || '';
                              const actLine = actualLines[i] || '';

                              if (expLine !== actLine) {
                                if (expLine && !actLine) {
                                  differences.push(`Line ${i + 1}: Missing output (expected: "${expLine}")`);
                                } else if (!expLine && actLine) {
                                  differences.push(`Line ${i + 1}: Extra output (got: "${actLine}")`);
                                } else {
                                  differences.push(`Line ${i + 1}: Expected "${expLine}", got "${actLine}"`);
                                }
                              }
                            }

                            return differences.length > 0 ? differences.join('\n') : 'Outputs differ but no specific differences found';
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Textarea
                  value={actualOutput}
                  readOnly
                  className="min-h-[100px] font-mono text-sm bg-muted"
                  placeholder="Output will appear here after running..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="lg:col-span-3">
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language={language}
            onLanguageChange={handleLanguageChange}
            onRun={handleRunCode}
            onReset={handleResetCode}
            onCopy={handleCopyCode}
            height="600px"
          />
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;