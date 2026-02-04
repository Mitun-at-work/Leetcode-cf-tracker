import { useState, memo, useCallback } from 'react';
import type { Problem, Section } from '../types';
import ProblemList from './ProblemList';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface ProblemTabsProps {
  problems: Problem[];
  isReviewList?: boolean;
  isMasterSheet?: boolean;
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onProblemReviewed: (id: string, currentInterval: number) => void;
  onEditProblem: (problem: Problem) => void;
  sections?: Section[];
  onAddProblemToSection?: (sectionId: string, problemId: string) => void;
}

const ProblemTabs = memo(({
  problems,
  isReviewList = false,
  isMasterSheet = false,
  onUpdateProblem,
  onDeleteProblem,
  onProblemReviewed,
  onEditProblem,
  sections = [],
  onAddProblemToSection
}: ProblemTabsProps) => {
  const [pickCount, setPickCount] = useState<number>(5);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);

  const handlePickRandom = useCallback(() => {
    if (pickCount <= 0) {
      toast.error('Please enter a valid number');
      return;
    }

    if (pickCount > problems.length) {
      toast.error(`Only ${problems.length} problems available in master sheet`);
      return;
    }

    // Shuffle and pick random problems
    const shuffled = [...problems].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, pickCount);
    setSelectedProblems(picked);
    toast.success(`Picked ${picked.length} random problems from master sheet`);
  }, [pickCount, problems]);

  const handleClearSelection = useCallback(() => {
    setSelectedProblems([]);
    toast.info('Cleared selection');
  }, []);

  const displayProblems = selectedProblems.length > 0 ? selectedProblems : problems;

  return (
    <div className="w-full mt-4">
      {isMasterSheet && problems.length > 0 && (
        <div className="mb-4 p-4 bg-card border rounded-lg">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Pick Random:</label>
              <Input
                type="number"
                min="1"
                max={problems.length}
                value={pickCount}
                onChange={(e) => setPickCount(parseInt(e.target.value) || 0)}
                className="w-20"
              />
            </div>
            <Button onClick={handlePickRandom} size="sm" className="gap-2">
              <Shuffle className="h-4 w-4" />
              Pick Problems
            </Button>
            {selectedProblems.length > 0 && (
              <>
                <Button onClick={handleClearSelection} size="sm" variant="outline">
                  Show All ({problems.length})
                </Button>
                <span className="text-sm text-muted-foreground">
                  Showing {selectedProblems.length} random problems
                </span>
              </>
            )}
          </div>
        </div>
      )}
      
      <ProblemList
        problems={displayProblems}
        onUpdateProblem={onUpdateProblem}
        onDeleteProblem={onDeleteProblem}
        onProblemReviewed={onProblemReviewed}
        onEditProblem={onEditProblem}
        isReviewList={isReviewList}
        sections={sections}
        onAddProblemToSection={onAddProblemToSection}
      />
    </div>
  );
});

ProblemTabs.displayName = 'ProblemTabs';

export default ProblemTabs;
