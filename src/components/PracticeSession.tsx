import { useState, useCallback } from 'react';
import Timer from './Timer';
import CodeEditor from './CodeEditor';
import { Clock, Code, Play, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import ApiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const PracticeSession = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [input, setInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [actualOutput, setActualOutput] = useState('');
  const [testResult, setTestResult] = useState<'pending' | 'pass' | 'fail' | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleTimerTimeChange = useCallback((time: number) => {
    setTimeRemaining(time);
  }, []);

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

    setIsRunning(true);
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
    } finally {
      setIsRunning(false);
    }
  }, [code, input, expectedOutput]);

  const handleResetCode = useCallback(() => {
    setCode('');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice</h1>
          <p className="text-muted-foreground">
            Practice coding with input/output testing like Codeforces
          </p>
        </div>
      </div>

      {/* Timer and Test Panel Layout */}
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

        {/* Right Panel: Code Editor and Timer */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Code Editor */}
            <div className="xl:col-span-2">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                language={language}
                onLanguageChange={handleLanguageChange}
                onRun={handleRunCode}
                onReset={handleResetCode}
                height="600px"
              />
            </div>

            {/* Timer and Run Button */}
            <div className="xl:col-span-1 space-y-4">
              {/* Run Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleRunCode}
                  disabled={isRunning || !code.trim()}
                  size="lg"
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run & Test'}
                </Button>
              </div>

              {/* Timer */}
              <Timer
                onTimeChange={handleTimerTimeChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;