import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Contest } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddContest: (contest: Omit<Contest, 'id'>) => void;
  onUpdateContest: (id: string, updates: Partial<Contest>) => void;
  contestToEdit: Contest | null;
}

type FormData = Omit<Contest, 'id'>;

export default function ContestForm({ open, onOpenChange, onAddContest, onUpdateContest, contestToEdit }: ContestFormProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();
  const platform = watch('platform');

  useEffect(() => {
    if (contestToEdit) {
      reset({
        ...contestToEdit,
        startTime: contestToEdit.startTime ? new Date(contestToEdit.startTime).toISOString().substring(0, 16) : ''
      });
    } else {
      reset({
        name: '',
        platform: 'other',
        startTime: '',
        duration: 120,
        url: '',
        rank: 0,
        problemsSolved: 0,
        totalProblems: 0,
        status: 'scheduled',
      });
    }
  }, [contestToEdit, reset]);

  const onSubmit = (data: FormData) => {
    if (contestToEdit) {
      onUpdateContest(contestToEdit.id, data);
    } else {
      onAddContest(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contestToEdit ? 'Edit Contest' : 'Add Contest'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Contest Name</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select onValueChange={(value) => setValue('platform', value as Contest['platform'])} value={platform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leetcode">LeetCode</SelectItem>
                  <SelectItem value="codeforces">Codeforces</SelectItem>
                  <SelectItem value="atcoder">AtCoder</SelectItem>
                  <SelectItem value="hackerrank">HackerRank</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" {...register('url')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="datetime-local" {...register('startTime')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" {...register('duration', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
                <Label htmlFor="rank">Rank</Label>
                <Input id="rank" type="number" {...register('rank', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="problemsSolved">Problems Solved</Label>
                <Input id="problemsSolved" type="number" {...register('problemsSolved', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalProblems">Total Problems</Label>
                <Input id="totalProblems" type="number" {...register('totalProblems', { valueAsNumber: true })} />
              </div>
          </div>
          <DialogFooter>
            <Button type="submit">{contestToEdit ? 'Save Changes' : 'Add Contest'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 