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
import { MoreHorizontal, Trash2, ExternalLink, ChevronDown, ChevronRight, Pencil, Filter, CheckCircle2 } from 'lucide-react';
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
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PLATFORM_LABELS: Record<Problem['platform'], string> = {
  leetcode: 'LeetCode',
  codeforces: 'CodeForces',
  atcoder: 'AtCoder',
  algozenith: 'AlgoZenith',
  cses: 'CSES',
  hackerrank: 'HackerRank',
};

interface ToSolveProblemListProps {
  problems: Problem[];
  onDeleteProblem: (id: string) => void;
  onMoveToSolved: (problem: Problem) => void;
  onEditProblem: (problem: Problem) => void;
}

const ToSolveProblemList = memo(({ 
  problems, 
  onDeleteProblem, 
  onMoveToSolved,
  onEditProblem 
}: ToSolveProblemListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
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

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch = 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.problemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlatform = selectedPlatforms.size === 0 || selectedPlatforms.has(problem.platform);
      const matchesDifficulty = selectedDifficulties.size === 0 || selectedDifficulties.has(problem.difficulty);
      const matchesTopic = selectedTopics.size === 0 || problem.topics.some(t => selectedTopics.has(t));

      return matchesSearch && matchesPlatform && matchesDifficulty && matchesTopic;
    });
  }, [problems, searchTerm, selectedPlatforms, selectedDifficulties, selectedTopics]);

  // Pagination
  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProblems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProblems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);

  const availablePlatforms = useMemo(
    () => Array.from(new Set(problems.map(p => p.platform))),
    [problems]
  );

  const availableDifficulties = useMemo(
    () => Array.from(new Set(problems.map(p => p.difficulty))).sort(),
    [problems]
  );

  const availableTopics = useMemo(
    () => Array.from(new Set(problems.flatMap(p => p.topics))).sort(),
    [problems]
  );

  const handleDelete = (id: string) => {
    onDeleteProblem(id);
    setProblemToDelete(null);
    toast.success('Problem removed from to-solve list');
  };

  const getDifficultyBadgeClass = useCallback((difficulty: string): string => {
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
  }, []);

  const activeFilters = selectedPlatforms.size + selectedDifficulties.size + selectedTopics.size;

  if (problems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Problems to Solve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You haven't added any problems to solve yet. Add problems to keep track of what you want to solve!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by title, problem ID, or notes..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
              {activeFilters > 0 && <Badge variant="secondary">{activeFilters}</Badge>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {activeFilters > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPlatforms(new Set());
                    setSelectedDifficulties(new Set());
                    setSelectedTopics(new Set());
                  }}
                  className="w-full justify-start"
                >
                  Clear all
                </Button>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuLabel>Platform</DropdownMenuLabel>
            {availablePlatforms.map(platform => (
              <DropdownMenuCheckboxItem
                key={platform}
                checked={selectedPlatforms.has(platform)}
                onCheckedChange={() => togglePlatform(platform)}
              >
                {PLATFORM_LABELS[platform]}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
            {availableDifficulties.map(difficulty => (
              <DropdownMenuCheckboxItem
                key={difficulty}
                checked={selectedDifficulties.has(difficulty)}
                onCheckedChange={() => toggleDifficulty(difficulty)}
              >
                {difficulty}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Topic</DropdownMenuLabel>
            <div className="max-h-48 overflow-y-auto">
              {availableTopics.length > 0 ? (
                availableTopics.map(topic => (
                  <DropdownMenuCheckboxItem
                    key={topic}
                    checked={selectedTopics.has(topic)}
                    onCheckedChange={() => toggleTopic(topic)}
                  >
                    {topic}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No topics</div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
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
            {paginatedProblems.map((problem) => (
              <React.Fragment key={problem.id}>
                <TableRow>
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
                    </div>
                    {problem.topics && problem.topics.length > 0 && (
                      <div className="mt-4 mb-4 flex flex-wrap gap-1">
                        {problem.topics.slice(0, 2).map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                        ))}
                        {problem.topics.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{problem.topics.length - 2}
                          </Badge>
                        )}
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
                    <span className="text-sm text-muted-foreground">N/A</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">N/A</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditProblem(problem)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onMoveToSolved(problem);
                          }}
                          className="text-green-600 dark:text-green-400"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Move to Solved
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(problem.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setProblemToDelete(problem.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            ))}
            {paginatedProblems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredProblems.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProblems.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredProblems.length)} of {filteredProblems.length} problems
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 4) {
                  pageNum = i + 1;
                } else if (currentPage <= 2) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 3 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!problemToDelete} onOpenChange={(open) => !open && setProblemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from To-Solve List?</AlertDialogTitle>
            <AlertDialogDescription>
              This problem will be removed from your to-solve list. You can always add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => problemToDelete && handleDelete(problemToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

ToSolveProblemList.displayName = 'ToSolveProblemList';

import React from 'react';

export default ToSolveProblemList;
