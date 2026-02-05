import { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Code, Play, RotateCcw, Clock, Pause, Copy } from 'lucide-react';

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  onLanguageChange?: (language: string) => void;
  onRun?: () => void;
  onReset?: () => void;
  onCopy?: () => void;
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
  onCopy,
  height = '400px'
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  // Timer state
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(30 * 60);
  const lastTenMinuteMark = useRef<number | null>(null);

  // Function to play a beep sound
  const playBeep = useCallback((frequency: number = 800, duration: number = 200) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
      // Fallback: try to play a system beep or notification sound
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Alert', { body: '10 minutes passed!' });
      }
    }
  }, []);

  // Function to check for 10-minute intervals
  const checkTenMinuteInterval = useCallback((currentSeconds: number) => {
    const currentMinutes = Math.floor(currentSeconds / 60);
    const lastMark = lastTenMinuteMark.current;

    // Check if we've crossed a 10-minute boundary
    if (lastMark === null || currentMinutes < lastMark) {
      // Reset when timer is reset or restarted
      lastTenMinuteMark.current = Math.floor(currentSeconds / 600) * 10;
    } else {
      const currentTenMinuteMark = Math.floor(currentMinutes / 10) * 10;
      if (currentTenMinuteMark !== lastMark && currentTenMinuteMark > 0) {
        // We've reached a new 10-minute mark
        playBeep(800, 300); // Longer beep for 10-minute intervals
        lastTenMinuteMark.current = currentTenMinuteMark;

        // Also show a notification if possible
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Timer Update', {
            body: `${currentTenMinuteMark} minutes remaining!`,
            icon: '/favicon.ico'
          });
        }
      }
    }
  }, [playBeep]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTotalSeconds(minutes * 60 + seconds);
    lastTenMinuteMark.current = null; // Reset the 10-minute mark tracking
  }, [minutes, seconds]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleMinutesChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    setMinutes(Math.max(0, Math.min(99, numValue)));
  }, []);

  const handleSecondsChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    setSeconds(Math.max(0, Math.min(59, numValue)));
  }, []);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(prev => {
          const newTime = prev - 1;

          // Check for 10-minute intervals
          checkTenMinuteInterval(newTime);

          if (newTime <= 0) {
            setIsRunning(false);
            // Play final alarm sound when timer reaches zero
            playBeep(1000, 1000); // Higher pitch, longer duration for final alarm
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Timer Finished!', {
                body: 'Time\'s up! Your practice session has ended.',
                icon: '/favicon.ico'
              });
            }
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, totalSeconds, checkTenMinuteInterval, playBeep]);

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
          <div className="flex items-center gap-4">
            {/* Timer Section */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div className="flex items-center gap-1">
                <div
                  className={`text-lg font-mono font-bold min-w-[60px] ${
                    totalSeconds === 0 ? 'text-red-500' : totalSeconds <= 300 ? 'text-orange-500' : 'text-green-500'
                  }`}
                >
                  {formatTime(totalSeconds)}
                </div>
                {!isRunning && totalSeconds > 0 && (
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="99"
                      value={minutes}
                      onChange={(e) => handleMinutesChange(e.target.value)}
                      className="w-12 h-6 text-xs text-center p-1"
                      placeholder="M"
                    />
                    <span className="text-xs">:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) => handleSecondsChange(e.target.value)}
                      className="w-12 h-6 text-xs text-center p-1"
                      placeholder="S"
                    />
                  </div>
                )}
                <div className="flex gap-1">
                  {!isRunning ? (
                    <Button
                      onClick={startTimer}
                      disabled={totalSeconds === 0}
                      size="sm"
                      variant="outline"
                      className="h-6 px-2"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseTimer}
                      size="sm"
                      variant="outline"
                      className="h-6 px-2"
                    >
                      <Pause className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    onClick={resetTimer}
                    size="sm"
                    variant="outline"
                    className="h-6 px-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Language and Action Buttons */}
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
              <Button onClick={onCopy} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={onRun} variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
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