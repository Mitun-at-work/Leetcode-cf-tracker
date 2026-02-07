import { useState, useEffect, useMemo, memo } from 'react';
import type { Problem } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MultiSelect, type Option } from '@/components/ui/multi-select';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import { topics } from '@/lib/topics';
import { toast } from 'sonner';

interface ProblemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProblem: (problem: Omit<Problem, 'id' | 'createdAt'>) => void;
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onAddToSolveProblem?: (problem: Omit<Problem, 'id' | 'createdAt'>) => void;
  onUpdateToSolveProblem?: (id: string, updates: Partial<Problem>) => void;
  onAddToMasterSheet?: (problem: Omit<Problem, 'id' | 'createdAt'>) => void;
  problemToEdit: Problem | null;
  formContext?: 'regular' | 'tosolve' | 'mastersheet';
}

type FormData = Omit<Problem, 'id' | 'createdAt' | 'problemId'>;

const INITIAL_FORM_STATE: FormData = {
  platform: 'leetcode',
  title: '',
  difficulty: '',
  url: '',
  submissionLink: '',
  dateSolved: new Date().toISOString().split('T')[0],
  notes: '',
  isReview: false,
  topics: [],
  status: 'active',
  repetition: 0,
  interval: 0,
  nextReviewDate: null,
  companies: [],
};


const ProblemForm = ({ open, onOpenChange, onAddProblem, onUpdateProblem, onAddToSolveProblem, onUpdateToSolveProblem, onAddToMasterSheet, problemToEdit, formContext = 'regular' }: ProblemFormProps) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);

  useEffect(() => {
    if (problemToEdit) {
      setFormData({
        ...problemToEdit,
        dateSolved: problemToEdit.dateSolved.split('T')[0],
      });
    } else {
      // If it's a to-solve form, clear the dateSolved field
      if (formContext === 'tosolve') {
        setFormData({ ...INITIAL_FORM_STATE, dateSolved: '' });
      } else {
        setFormData(INITIAL_FORM_STATE);
      }
    }
  }, [problemToEdit, open, formContext]);

  const topicOptions = useMemo<Option[]>(() => {
    return topics.map(topic => ({ label: topic, value: topic }));
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    if (name === 'platform') {
      setFormData(prev => ({ ...prev, platform: value as 'leetcode' | 'codeforces' | 'atcoder' | 'algozenith' | 'cses' | 'hackerrank' }));
    } else if (name === 'topics') {
        setFormData(prev => ({ ...prev, topics: value as string[] }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value as string }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.difficulty.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    const problemData = {
      ...formData,
      problemId: formData.title.trim().toLowerCase().replace(/\s+/g, '-'),
    };

    if (problemToEdit) {
      if (formContext === 'tosolve' && onUpdateToSolveProblem) {
        onUpdateToSolveProblem(problemToEdit.id, problemData);
        toast.success('To-Solve problem updated successfully!');
      } else {
        onUpdateProblem(problemToEdit.id, problemData);
        toast.success('Problem updated successfully!');
      }
    } else {
      if (formContext === 'tosolve' && onAddToSolveProblem) {
        onAddToSolveProblem(problemData);
      } else if (formContext === 'mastersheet' && onAddToMasterSheet) {
        onAddToMasterSheet(problemData);
      } else {
        onAddProblem(problemData);
      }
    }
    onOpenChange(false);
  };

  const isEditing = !!problemToEdit && !!problemToEdit.id;
  const isToSolveForm = formContext === 'tosolve' && !isEditing;
  const isMasterSheetForm = formContext === 'mastersheet' && !isEditing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Problem' : isToSolveForm ? 'Add Problem to Solve' : isMasterSheetForm ? 'Add Problem to Master Sheet' : 'Add New Problem'}
          </DialogTitle>
          {/* DialogDescription removed as per new_code */}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Form fields remain the same */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select name="platform" onValueChange={(value: string) => handleSelectChange('platform', value)} value={formData.platform}>
              <SelectTrigger id="platform" data-testid="platform-select">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leetcode">LeetCode</SelectItem>
                <SelectItem value="codeforces">CodeForces</SelectItem>
                <SelectItem value="atcoder">AtCoder</SelectItem>
                <SelectItem value="algozenith">AlgoZenith</SelectItem>
                <SelectItem value="cses">CSES</SelectItem>
                <SelectItem value="hackerrank">HackerRank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Problem Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Two Sum"
              data-testid="title-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty *</Label>
            <Select name="difficulty" onValueChange={(value: string) => handleSelectChange('difficulty', value)} value={formData.difficulty}>
              <SelectTrigger id="difficulty" data-testid="difficulty-select">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://leetcode.com/problems/two-sum/"
              data-testid="url-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submissionLink">Submission Link (optional)</Label>
            <Input
              id="submissionLink"
              name="submissionLink"
              value={formData.submissionLink || ''}
              onChange={handleInputChange}
              placeholder="https://leetcode.com/submissions/detail/..."
              data-testid="submission-link-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateSolved">Date Solved {!isToSolveForm && '*'}</Label>
            <Input
                type="date"
                id="dateSolved"
                name="dateSolved"
                value={formData.dateSolved}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                disabled={isToSolveForm}
                data-testid="date-input"
            />
            {isToSolveForm && (
              <p className="text-xs text-muted-foreground">
                Date will be set when you move this to your solved list
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <MarkdownEditor
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              data-testid="notes-editor"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topics">Topics</Label>
            <MultiSelect
                options={topicOptions}
                onValueChange={(value) => handleSelectChange('topics', value)}
                value={formData.topics}
                placeholder="Select topics"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
                id="isReview"
                name="isReview"
                checked={formData.isReview}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({...prev, isReview: checked}))}
            />
            <Label htmlFor="isReview" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Mark for review later
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Problem' : isToSolveForm ? 'Add to Solve List' : isMasterSheetForm ? 'Add to Master Sheet' : 'Add Problem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ProblemForm);
