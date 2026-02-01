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
import { getReviewIntervals, saveReviewIntervals } from '@/utils/settingsStorage';
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

  useEffect(() => {
    if (open) {
      setIntervals(getReviewIntervals());
      setEnableNotifications(localStorage.getItem('enableNotifications') === 'true');
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
    saveReviewIntervals(intervals);
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
          StorageService.saveProblems(data.problems || []);
          StorageService.savePotdProblems(data.potdProblems || []);
          StorageService.saveContests(data.contests || []);
          saveReviewIntervals(data.reviewIntervals || []);
          onSettingsSave(data.reviewIntervals || []);
          toast.success('Data imported successfully! Please refresh the page.');
        } catch (error) {
          toast.error('Invalid file format');
        }
      };
      reader.readAsText(file);
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
            <Label>Data Management</Label>
            <div className="flex space-x-2">
              <Button onClick={handleExport}>Export Data</Button>
              <Input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
              <Button asChild>
                <label htmlFor="import-file" className="cursor-pointer">
                  Import Data
                </label>
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