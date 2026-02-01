import { useState } from 'react';
import type { Problem } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProblemList from './ProblemList';

interface ProblemTabsProps {
  problems: Problem[];
  isPotdList?: boolean;
  isReviewList?: boolean;
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onProblemReviewed: (id: string, currentInterval: number) => void;
  onEditProblem: (problem: Problem) => void;
}

const ProblemTabs = ({
  problems,
  isPotdList = false,
  isReviewList = false,
  onUpdateProblem,
  onDeleteProblem,
  onProblemReviewed,
  onEditProblem,
}: ProblemTabsProps) => {
  const [activePlatform, setActivePlatform] = useState('leetcode');

  return (
    <Tabs value={activePlatform} onValueChange={setActivePlatform} className="w-full mt-4">
      <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-md h-10">
        <TabsTrigger
          value="leetcode"
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm"
        >
          LeetCode
        </TabsTrigger>
        <TabsTrigger
          value="codeforces"
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm"
        >
          Codeforces
        </TabsTrigger>
        <TabsTrigger
          value="atcoder"
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm"
        >
          AtCoder
        </TabsTrigger>
      </TabsList>

      <TabsContent value="leetcode">
        <ProblemList
          problems={problems.filter(p => p.platform === 'leetcode')}
          onUpdateProblem={onUpdateProblem}
          onDeleteProblem={onDeleteProblem}
          onProblemReviewed={onProblemReviewed}
          onEditProblem={onEditProblem}
          isReviewList={isReviewList}
        />
      </TabsContent>

      <TabsContent value="codeforces">
        <ProblemList
          problems={problems.filter(p => p.platform === 'codeforces')}
          onUpdateProblem={onUpdateProblem}
          onDeleteProblem={onDeleteProblem}
          onProblemReviewed={onProblemReviewed}
          onEditProblem={onEditProblem}
          isReviewList={isReviewList}
        />
      </TabsContent>

      <TabsContent value="atcoder">
        <ProblemList
          problems={problems.filter(p => p.platform === 'atcoder')}
          onUpdateProblem={onUpdateProblem}
          onDeleteProblem={onDeleteProblem}
          onProblemReviewed={onProblemReviewed}
          onEditProblem={onEditProblem}
          isReviewList={isReviewList}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProblemTabs;
