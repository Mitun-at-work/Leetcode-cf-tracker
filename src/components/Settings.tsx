import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDailyGoal, getReviewIntervals, saveDailyGoal, saveReviewIntervals } from '@/utils/settingsStorage';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';
import StorageService from '@/utils/storage';
import { Switch } from '@/components/ui/switch';

interface SettingsProps {
  children: React.ReactNode;
  onSettingsSave: (intervals: number[]) => void;
}

export function Settings({ children, onSettingsSave }: SettingsProps) {
  const [open, setOpen] = useState(false);
  const [intervals, setIntervals] = useState<number[]>([]);
  // Add state for notifications toggle
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(1);

  useEffect(() => {
    if (open) {
      setIntervals(getReviewIntervals());
      setEnableNotifications(localStorage.getItem('enableNotifications') === 'true');
      setDailyGoal(getDailyGoal());
    }
  }, [open]);

  const handleIntervalChange = (index: number, value: string) => {
    const newIntervals = [...intervals];
    newIntervals[index] = Number(value);
    setIntervals(newIntervals);
  };

  const handleAddInterval = () => {
    setIntervals([...intervals, 0]);
  };

  const handleRemoveInterval = (index: number) => {
    const newIntervals = intervals.filter((_, i) => i !== index);
    setIntervals(newIntervals);
  };

  const handleSave = () => {
    if (intervals.some(i => i <= 0)) {
      toast.error('Intervals must be positive numbers.');
      return;
    }
    if (dailyGoal <= 0) {
      toast.error('Daily goal must be a positive number.');
      return;
    }
    saveReviewIntervals(intervals);
    saveDailyGoal(dailyGoal);
    onSettingsSave(intervals);
    toast.success('Settings saved!');
    setOpen(false);
    localStorage.setItem('enableNotifications', enableNotifications.toString());
  };

  // Function to export data
  const handleExport = async () => {
    try {
      const data = {
        problems: await StorageService.getProblems(),
        potdProblems: await StorageService.getPotdProblems(),
        contests: await StorageService.getContests(),
        reviewIntervals: getReviewIntervals(),
        dailyGoal: getDailyGoal(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tracker-data.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // Function to import data
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const problems = Array.isArray(data.problems) ? data.problems : [];
          const potdProblems = Array.isArray(data.potdProblems) ? data.potdProblems : [];
          const contests = Array.isArray(data.contests) ? data.contests : [];
          const reviewIntervals = Array.isArray(data.reviewIntervals) ? data.reviewIntervals : getReviewIntervals();
          const dailyGoal = typeof data.dailyGoal === 'number' && data.dailyGoal > 0 ? data.dailyGoal : getDailyGoal();

          const normalizeProblem = (p: any) => ({
            ...p,
            id: p?.id || crypto.randomUUID(),
            createdAt: p?.createdAt || new Date().toISOString(),
            dateSolved: p?.dateSolved || new Date().toISOString(),
            notes: p?.notes || '',
            isReview: typeof p?.isReview === 'boolean' ? p.isReview : false,
            repetition: typeof p?.repetition === 'number' ? p.repetition : 0,
            interval: typeof p?.interval === 'number' ? p.interval : 0,
            nextReviewDate: p?.nextReviewDate ?? null,
            status: p?.status || 'active',
            companies: Array.isArray(p?.companies) ? p.companies : [],
            topics: Array.isArray(p?.topics) ? p.topics : [],
          });

          StorageService.saveProblems(problems.map(normalizeProblem));
          StorageService.savePotdProblems(potdProblems.map(normalizeProblem));
          StorageService.saveContests(contests);
          saveReviewIntervals(reviewIntervals);
          saveDailyGoal(dailyGoal);
          onSettingsSave(reviewIntervals);
          toast.success('Data imported successfully! Please refresh the page.');
        } catch (error) {
          toast.error('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = async () => {
    const confirmed = window.confirm(
      'This will clear all problems, contests, and settings data. This action cannot be undone. Continue?'
    );
    if (!confirmed) return;

    try {
      await StorageService.saveProblems([]);
      await StorageService.savePotdProblems([]);
      await StorageService.saveContests([]);
      localStorage.removeItem('company-problems');
      localStorage.removeItem('offline-mode');
      localStorage.removeItem('leetcode-cf-tracker-review-intervals');
      localStorage.removeItem('leetcode-cf-tracker-daily-goal');
      localStorage.removeItem('enableNotifications');
      setIntervals(getReviewIntervals());
      setDailyGoal(getDailyGoal());
      setEnableNotifications(false);
      toast.success('All local data reset. Please refresh the page.');
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Failed to reset data');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your spaced repetition intervals.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Review Intervals (in days)</Label>
            {intervals.map((interval, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="number"
                  value={interval}
                  onChange={(e) => handleIntervalChange(index, e.target.value)}
                  min={1}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveInterval(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddInterval}>
              <Plus className="mr-2 h-4 w-4" />
              Add Interval
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Enable Browser Notifications</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={enableNotifications}
                onCheckedChange={setEnableNotifications}
              />
              <span className="text-sm text-muted-foreground">Get reminders for reviews and contests</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="daily-goal">Daily Goal (problems)</Label>
            <Input
              id="daily-goal"
              type="number"
              min={1}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Data Management</Label>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExport}>Export Data</Button>
              <Input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
              <Button asChild>
                <label htmlFor="import-file" className="cursor-pointer">
                  Import Data
                </label>
              </Button>
              <Button variant="destructive" onClick={handleResetData}>
                Reset Data
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 