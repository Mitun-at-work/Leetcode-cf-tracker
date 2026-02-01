import type { Problem } from '../types';
import ProblemList from './ProblemList';

interface ProblemTabsProps {
  problems: Problem[];
  isReviewList?: boolean;
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onProblemReviewed: (id: string, currentInterval: number) => void;
  onEditProblem: (problem: Problem) => void;
}

const ProblemTabs = ({
  problems,
  isReviewList = false,
  onUpdateProblem,
  onDeleteProblem,
  onProblemReviewed,
  onEditProblem,
}: ProblemTabsProps) => {
  return (
    <div className="w-full mt-4">
      <ProblemList
        problems={problems}
        onUpdateProblem={onUpdateProblem}
        onDeleteProblem={onDeleteProblem}
        onProblemReviewed={onProblemReviewed}
        onEditProblem={onEditProblem}
        isReviewList={isReviewList}
      />
    </div>
  );
};

export default ProblemTabs;
