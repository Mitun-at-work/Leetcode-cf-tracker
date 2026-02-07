import { useState, useCallback, useEffect, useRef } from 'react';
import CodeEditor from './CodeEditor';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import ApiService from '../services/api';
import { Button } from '@/components/ui/button';

const PracticeSession = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isExecuting, setIsExecuting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isUserAborted, setIsUserAborted] = useState(false);

  // CodeEditor state
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [memoryUsage, setMemoryUsage] = useState<number | undefined>();
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; input: string; expected: string; actual: string }>>([]);

  // Load saved state on component mount
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem('practice-session-code');
      const savedLanguage = localStorage.getItem('practice-session-language');

      if (savedCode) {
        setCode(savedCode);
      }
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.warn('Failed to load practice session state:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('practice-session-code', code);
    } catch (error) {
      console.warn('Failed to save code to localStorage:', error);
    }
  }, [code]);

  useEffect(() => {
    try {
      localStorage.setItem('practice-session-language', language);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  }, [language]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCode(value || '');
  }, []);

  const handleRunCode = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to run');
      return;
    }

    if (!testInput.trim()) {
      toast.error('Please enter test input');
      return;
    }

    if (!testOutput.trim()) {
      toast.error('Please enter expected output');
      return;
    }

    setIsExecuting(true);
    setIsUserAborted(false);
    abortControllerRef.current = new AbortController();

    try {
      const startTime = Date.now();
      const result = await ApiService.executeCppCode(code, testInput, abortControllerRef.current.signal);
      const endTime = Date.now();
      const execTime = endTime - startTime;

      const normalizedActual = result.output.trim();
      const normalizedExpected = testOutput.trim();
      const passed = normalizedActual === normalizedExpected;

      // Update CodeEditor state
      setConsoleOutput(result.output || 'No output');
      setExecutionTime(execTime);
      setMemoryUsage(Math.random() * 50 + 10); // Mock memory usage for now
      setTestResults([{
        passed,
        input: testInput,
        expected: testOutput,
        actual: result.output
      }]);

      if (passed) {
        toast.success('Test passed! ✅');
      } else {
        toast.error('Test failed! ❌');
      }
    } catch (error) {
      setConsoleOutput('Execution failed');
      setExecutionTime(undefined);
      setMemoryUsage(undefined);
      setTestResults([{
        passed: false,
        input: testInput,
        expected: testOutput,
        actual: error instanceof Error && error.name === 'AbortError' && !isUserAborted 
          ? 'Code out of bounds - execution timed out' 
          : 'Execution failed'
      }]);

      if (error instanceof Error && error.name === 'AbortError') {
        if (isUserAborted) {
          toast.info('Execution stopped');
        } else {
          toast.error('Code out of bounds - execution timed out');
          setConsoleOutput('Code out of bounds - execution timed out');
        }
      } else {
        toast.error('Execution failed');
      }
    } finally {
      setIsExecuting(false);
      abortControllerRef.current = null;
    }
  }, [code, testInput, testOutput]);

  const handleResetCode = useCallback(() => {
    setCode('');
    setTestInput('');
    setTestOutput('');
    setConsoleOutput('');
    setExecutionTime(undefined);
    setMemoryUsage(undefined);
    setTestResults([]);
  }, []);

  const handleResetSession = useCallback(() => {
    setCode('');
    setLanguage('cpp');
    setTestInput('');
    setTestOutput('');
    setConsoleOutput('');
    setExecutionTime(undefined);
    setMemoryUsage(undefined);
    setTestResults([]);

    // Clear localStorage
    try {
      localStorage.removeItem('practice-session-code');
      localStorage.removeItem('practice-session-language');
      toast.success('Practice session reset!');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
      toast.success('Session reset (localStorage clear failed)');
    }
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

  const handleStopExecution = useCallback(() => {
    if (abortControllerRef.current) {
      setIsUserAborted(true);
      abortControllerRef.current.abort();
      setIsExecuting(false);
      toast.info('Execution stopped');
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold pb-2">Practice Session</h1>
          <p className="text-muted-foreground">
            Write and test your code with the integrated editor
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetSession} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset Session
        </Button>
      </div>

      {/* Code Editor */}
      <div className="w-full">
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language={language}
          onLanguageChange={setLanguage}
          onRun={handleRunCode}
          onStop={handleStopExecution}
          onReset={handleResetCode}
          onCopy={handleCopyCode}
          height="600px"
          isExecuting={isExecuting}
          testInput={testInput}
          onTestInputChange={setTestInput}
          testOutput={testOutput}
          onTestOutputChange={setTestOutput}
          consoleOutput={consoleOutput}
          executionTime={executionTime}
          memoryUsage={memoryUsage}
          testResults={testResults}
        />
      </div>
    </div>
  );
};

export default PracticeSession;
