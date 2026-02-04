import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import type { Problem, Section } from '../types';
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
import { MoreHorizontal, Star, Trash2, ExternalLink, ChevronDown, ChevronRight, Pencil, Filter, X, BookMarked, ChevronLeft } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { startOfDay } from 'date-fns';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { topics } from '@/lib/topics';
import { toast } from 'sonner';

const PLATFORM_LABELS: Record<Problem['platform'], string> = {
  leetcode: 'LeetCode',
  codeforces: 'CodeForces',
  atcoder: 'AtCoder',
  algozenith: 'AlgoZenith',
  cses: 'CSES',
  hackerrank: 'HackerRank',
};

interface ProblemListProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (id: string, currentInterval: number) => void;
  isReviewList?: boolean;
  sections?: Section[];
  onAddProblemToSection?: (sectionId: string, problemId: string) => void;
}

const ProblemList = memo(({ 
  problems, 
  onUpdateProblem, 
  onDeleteProblem, 
  onEditProblem, 
  onProblemReviewed, 
  isReviewList = false,
  sections = [],
  onAddProblemToSection
}: ProblemListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [problemToAddToSection, setProblemToAddToSection] = useState<Problem | null>(null);
  
  // Filter states
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Problem['platform']>>(new Set());
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>('');

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
    setSelectedDate('');
  }, []);

  const hasActiveFilters = selectedPlatforms.size > 0 || selectedDifficulties.size > 0 || selectedTopics.size > 0 || selectedDate !== '';

  // Get unique difficulties from all problems
  const uniqueDifficulties = useMemo(() => 
    Array.from(new Set(problems.map(p => p.difficulty))).sort(),
    [problems]
  );

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      // Search filter
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesTitle = problem.title.toLowerCase().includes(searchTermLower);
        const matchesTopics = problem.topics?.some(topic => topic.toLowerCase().includes(searchTermLower));
        if (!matchesTitle && !matchesTopics) return false;
      }

      // Platform filter
      if (selectedPlatforms.size > 0 && !selectedPlatforms.has(problem.platform)) return false;

      // Difficulty filter
      if (selectedDifficulties.size > 0 && !selectedDifficulties.has(problem.difficulty)) return false;

      // Topic filter (at least one topic should match)
      if (selectedTopics.size > 0 && (!problem.topics || !problem.topics.some(topic => selectedTopics.has(topic)))) return false;

      // Date filter (exact match)
      if (selectedDate) {
        const problemDate = problem.dateSolved.split('T')[0];
        if (problemDate !== selectedDate) return false;
      }

      return true;
    });
  }, [problems, searchTerm, selectedPlatforms, selectedDifficulties, selectedTopics, selectedDate]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPlatforms, selectedDifficulties, selectedTopics, selectedDate, itemsPerPage]);

  // Pagination calculations
  const { totalPages, startIndex, endIndex, paginatedProblems } = useMemo(() => {
    const total = Math.ceil(filteredProblems.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = filteredProblems.slice(start, end);
    
    return {
      totalPages: total,
      startIndex: start,
      endIndex: end,
      paginatedProblems: paginated
    };
  }, [filteredProblems, currentPage, itemsPerPage]);

  const isDueForReview = useCallback((problem: Problem) => {
    if (!problem.isReview || !problem.nextReviewDate) return false;
    const reviewDate = startOfDay(new Date(problem.nextReviewDate));
    const today = startOfDay(new Date());
    return reviewDate <= today;
  }, []);

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

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);

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

                  {/* Date Filter */}
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="Filter by date"
                    className="h-8 w-40"
                  />

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
                    {selectedDate && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedDate('');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer transition-colors"
                      >
                        Date: {selectedDate}
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
            </div>
        </CardHeader>
      <CardContent>
        {/* Pagination Controls */}
        {filteredProblems.length > 0 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredProblems.length)} of {filteredProblems.length} problems
              </span>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="h-8 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
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
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

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
              {paginatedProblems.length > 0 ? (
                paginatedProblems.flatMap((problem) => (
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

                              <DropdownMenuItem onClick={() => setProblemToAddToSection(problem)}>
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

      {/* Section Selection Dialog */}
      <Dialog open={!!problemToAddToSection} onOpenChange={() => setProblemToAddToSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Master Sheet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select a section to add "{problemToAddToSection?.title}" to:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (problemToAddToSection && onAddProblemToSection) {
                      // Add problem to section
                      onAddProblemToSection(section.id, problemToAddToSection.id);
                      // Mark problem as in master sheet
                      onUpdateProblem(problemToAddToSection.id, { inMasterSheet: true });
                      setProblemToAddToSection(null);
                      toast.success(`Added to "${section.name}" section`);
                    }
                  }}
                >
                  {section.name}
                </Button>
              ))}
              {sections.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sections available. Create a section in the Master Sheet tab first.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

ProblemList.displayName = 'ProblemList';

export default ProblemList;
