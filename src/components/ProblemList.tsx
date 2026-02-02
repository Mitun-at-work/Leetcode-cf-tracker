import { useState, useMemo, useCallback, memo } from 'react';
import type { Problem } from '../types';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Star, Trash2, ExternalLink, ChevronDown, ChevronRight, Pencil, Filter, X, BookMarked } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { startOfDay } from 'date-fns';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { topics } from '@/lib/topics';

const PLATFORM_LABELS: Record<Problem['platform'], string> = {
  leetcode: 'LeetCode',
  codeforces: 'CodeForces',
  atcoder: 'AtCoder',
  algozenith: 'AlgoZenith',
  cses: 'CSES',
};

interface ProblemListProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (id: string, currentInterval: number) => void;
  isReviewList?: boolean;
}

const ProblemList = memo(({ problems, onUpdateProblem, onDeleteProblem, onEditProblem, onProblemReviewed, isReviewList = false }: ProblemListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Filter states
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Problem['platform']>>(new Set());
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  const toggleRowExpansion = useCallback((id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const togglePlatform = useCallback((platform: Problem['platform']) => {
    setSelectedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platform)) {
        newSet.delete(platform);
      } else {
        newSet.add(platform);
      }
      return newSet;
    });
  }, []);

  const toggleDifficulty = useCallback((difficulty: string) => {
    setSelectedDifficulties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(difficulty)) {
        newSet.delete(difficulty);
      } else {
        newSet.add(difficulty);
      }
      return newSet;
    });
  }, []);

  const toggleTopic = useCallback((topic: string) => {
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topic)) {
        newSet.delete(topic);
      } else {
        newSet.add(topic);
      }
      return newSet;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedPlatforms(new Set());
    setSelectedDifficulties(new Set());
    setSelectedTopics(new Set());
  }, []);

  const hasActiveFilters = selectedPlatforms.size > 0 || selectedDifficulties.size > 0 || selectedTopics.size > 0;

  // Get unique difficulties from all problems
  const uniqueDifficulties = useMemo(() => 
    Array.from(new Set(problems.map(p => p.difficulty))).sort(),
    [problems]
  );

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesTitle = problem.title.toLowerCase().includes(searchTermLower);
      const matchesTopics = problem.topics && problem.topics.some(topic => topic.toLowerCase().includes(searchTermLower));
      const matchesSearch = matchesTitle || matchesTopics;

      // Platform filter
      const matchesPlatform = selectedPlatforms.size === 0 || selectedPlatforms.has(problem.platform);

      // Difficulty filter
      const matchesDifficulty = selectedDifficulties.size === 0 || selectedDifficulties.has(problem.difficulty);

      // Topic filter (at least one topic should match)
      const matchesTopicFilter = selectedTopics.size === 0 || 
        (problem.topics && problem.topics.some(topic => selectedTopics.has(topic)));

      return matchesSearch && matchesPlatform && matchesDifficulty && matchesTopicFilter;
    });
  }, [problems, searchTerm, selectedPlatforms, selectedDifficulties, selectedTopics]);

  const isDueForReview = (problem: Problem) => {
    if (!problem.isReview || !problem.nextReviewDate) return false;
    const reviewDate = startOfDay(new Date(problem.nextReviewDate));
    const today = startOfDay(new Date());
    return reviewDate <= today;
  };

  const getDifficultyBadgeClass = (difficulty: string): string => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-600 text-white border-green-600 hover:bg-green-700';
      case 'Medium':
        return 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600';
      case 'Hard':
        return 'bg-red-600 text-white border-red-600 hover:bg-red-700';
      default:
        return 'bg-foreground text-background border-foreground';
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Problems</CardTitle> 
            <div className="flex flex-col gap-4 pt-4">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        {filteredProblems.length} of {problems.length} problems
                    </p>
                    <div className="w-1/3">
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search problems..."
                        />
                    </div>
                </div>

                {/* Filter Section */}
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Platform Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="mr-2 h-4 w-4" />
                        Platform
                        {selectedPlatforms.size > 0 && (
                          <Badge variant="secondary" className="ml-2 rounded-full px-1 min-w-[1.25rem] h-5">
                            {selectedPlatforms.size}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel>Filter by Platform</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={selectedPlatforms.has(key as Problem['platform'])}
                          onCheckedChange={() => togglePlatform(key as Problem['platform'])}
                        >
                          {label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Difficulty Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="mr-2 h-4 w-4" />
                        Difficulty
                        {selectedDifficulties.size > 0 && (
                          <Badge variant="secondary" className="ml-2 rounded-full px-1 min-w-[1.25rem] h-5">
                            {selectedDifficulties.size}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel>Filter by Difficulty</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {uniqueDifficulties.map(difficulty => (
                        <DropdownMenuCheckboxItem
                          key={difficulty}
                          checked={selectedDifficulties.has(difficulty)}
                          onCheckedChange={() => toggleDifficulty(difficulty)}
                        >
                          {difficulty}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Topic Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="mr-2 h-4 w-4" />
                        Topics
                        {selectedTopics.size > 0 && (
                          <Badge variant="secondary" className="ml-2 rounded-full px-1 min-w-[1.25rem] h-5">
                            {selectedTopics.size}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 max-h-96 overflow-y-auto">
                      <DropdownMenuLabel>Filter by Topic</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {topics.map(topic => (
                        <DropdownMenuCheckboxItem
                          key={topic}
                          checked={selectedTopics.has(topic)}
                          onCheckedChange={() => toggleTopic(topic)}
                        >
                          {topic}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={clearAllFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Active Filter Tags */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedPlatforms).map(platform => (
                      <button
                        key={platform}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePlatform(platform);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer transition-colors"
                      >
                        {PLATFORM_LABELS[platform]}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                    {Array.from(selectedDifficulties).map(difficulty => (
                      <button
                        key={difficulty}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleDifficulty(difficulty);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer transition-colors"
                      >
                        {difficulty}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                    {Array.from(selectedTopics).map(topic => (
                      <button
                        key={topic}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleTopic(topic);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer transition-colors"
                      >
                        {topic}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
            </div>
        </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Difficulty / Rating</TableHead>
                <TableHead>Submission</TableHead>
                <TableHead>Next Review</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProblems.length > 0 ? (
                filteredProblems.flatMap((problem) => (
                  <React.Fragment key={problem.id}>
                    <TableRow data-state={isDueForReview(problem) ? 'selected' : undefined}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(problem.id)} className="mr-2 h-8 w-8">
                            {expandedRows.has(problem.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                          {problem.url ? (
                            <a href={problem.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                              {problem.title}
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          ) : (
                            problem.title
                          )}
                          {problem.isReview && <Star className={`ml-2 h-5 w-5 ${isDueForReview(problem) ? 'text-blue-500' : 'text-yellow-500'}`} />}
                        </div>
                        {problem.topics && problem.topics.length > 0 && (
                          <div className="mt-4 mb-4 flex flex-wrap gap-2">
                            {problem.topics.map(topic => (
                              <Badge key={topic} variant="outline" className="bg-black text-white border-black dark:bg-white dark:text-black dark:border-white">{topic}</Badge>
                            ))}
                          </div>
                        )}

                      </TableCell>
                      <TableCell>
                        <Badge variant={problem.platform === 'leetcode' ? 'outline' : 'default'}>
                          {PLATFORM_LABELS[problem.platform]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getDifficultyBadgeClass(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {problem.submissionLink ? (
                          <a href={problem.submissionLink} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline flex items-center">
                            View
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isDueForReview(problem) ? (
                          <Badge variant="destructive">Due Today</Badge>
                        ) : problem.isReview && problem.nextReviewDate ? (
                          new Date(problem.nextReviewDate).toLocaleDateString()
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isReviewList ? (
                           <Button size="sm" onClick={() => onProblemReviewed(problem.id, problem.interval)} disabled={!isDueForReview(problem)}>
                              Reviewed &amp; Advance
                            </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditProblem(problem)}>
                                <Pencil className="mr-2 h-5 w-5" />
                                Edit
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { isReview: !problem.isReview })}>
                                <Star className="mr-2 h-5 w-5" />
                                {problem.isReview ? 'Unmark review' : 'Mark for review'}
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { inMasterSheet: !problem.inMasterSheet })}>
                                <BookMarked className="mr-2 h-5 w-5" />
                                {problem.inMasterSheet ? 'Remove from Master Sheet' : 'Add to Master Sheet'}
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => setProblemToDelete(problem.id)}>
                                <Trash2 className="mr-2 h-5 w-5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(problem.id) && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="p-4 bg-muted/50 rounded-md">
                            <h4 className="font-semibold mb-2">Notes</h4>
                            <div className="prose dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {problem.notes || 'No notes for this problem.'}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <AlertDialog open={!!problemToDelete} onOpenChange={() => setProblemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the problem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (problemToDelete) {
                  onDeleteProblem(problemToDelete);
                  setProblemToDelete(null);
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
});

ProblemList.displayName = 'ProblemList';

export default ProblemList;
