import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TimerProps {
  onTimeChange?: (time: number) => void;
}

const Timer = ({ onTimeChange }: TimerProps) => {
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
    onTimeChange?.(minutes * 60 + seconds);
  }, [minutes, seconds, onTimeChange]);

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
          onTimeChange?.(newTime);

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
  }, [isRunning, totalSeconds, onTimeChange, checkTenMinuteInterval, playBeep]);

  const timeUp = totalSeconds === 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Practice Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Display */}
        <div className="text-center">
          <div
            className={`text-4xl font-mono font-bold ${
              timeUp ? 'text-red-500' : totalSeconds <= 300 ? 'text-orange-500' : 'text-green-500'
            }`}
          >
            {formatTime(totalSeconds)}
          </div>
          {timeUp && (
            <p className="text-red-500 text-sm mt-2">Time's up!</p>
          )}
        </div>

        {/* Time Input */}
        {!isRunning && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="99"
                value={minutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                className="text-center"
              />
            </div>
            <div>
              <Label htmlFor="seconds">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => handleSecondsChange(e.target.value)}
                className="text-center"
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={startTimer}
              disabled={totalSeconds === 0}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="outline" className="flex-1">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          <Button onClick={resetTimer} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(Timer);