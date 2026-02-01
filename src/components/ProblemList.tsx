import { useState } from 'react';
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
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Star, Trash2, ExternalLink, ChevronDown, ChevronRight, CheckCircle, Pencil, Undo2 } from 'lucide-react';
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

interface ProblemListProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (id: string, currentInterval: number) => void;
  isReviewList?: boolean;
}

const ProblemList = ({ problems, onUpdateProblem, onDeleteProblem, onEditProblem, onProblemReviewed, isReviewList = false }: ProblemListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredProblems = problems.filter((problem) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesTitle = problem.title.toLowerCase().includes(searchTermLower);
    const matchesTopics = problem.topics && problem.topics.some(topic => topic.toLowerCase().includes(searchTermLower));
    return matchesTitle || matchesTopics;
  });

  const isDueForReview = (problem: Problem) => {
    if (!problem.isReview || !problem.nextReviewDate) return false;
    const reviewDate = startOfDay(new Date(problem.nextReviewDate));
    const today = startOfDay(new Date());
    return reviewDate <= today;
  };

  const getDifficultyBadgeVariant = (difficulty: string, platform: string): "default" | "destructive" | "secondary" | "outline" | "success" | "warning" => {
    if (platform === 'codeforces') return 'default';
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Problems</CardTitle>
            <div className="flex justify-between items-center pt-4">
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
        </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Difficulty / Rating</TableHead>
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
                        {problem.submissionLink && (
                          <div className="mt-1">
                            <a href={problem.submissionLink} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline flex items-center">
                              View Submission
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {problem.topics && problem.topics.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {problem.topics.map(topic => (
                              <Badge key={topic} variant="secondary">{topic}</Badge>
                            ))}
                          </div>
                        )}
                        {problem.companies && problem.companies.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {problem.companies.map(company => (
                              <Badge key={company} variant="default">{company}</Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={problem.platform === 'leetcode' ? 'outline' : 'default'}>
                          {problem.platform === 'leetcode' ? 'LeetCode' : 'CodeForces'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDifficultyBadgeVariant(problem.difficulty, problem.platform)}>
                          {problem.difficulty}
                        </Badge>
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
                              
                              {problem.status === 'active' && (
                                <>
                                  <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { isReview: !problem.isReview })}>
                                    <Star className="mr-2 h-5 w-5" />
                                    {problem.isReview ? 'Unmark review' : 'Mark for review'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { status: 'learned' })}>
                                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                    Mark as Learned
                                  </DropdownMenuItem>
                                </>
                              )}

                              {problem.status === 'learned' && (
                                <DropdownMenuItem onClick={() => onUpdateProblem(problem.id, { status: 'active' })}>
                                  <Undo2 className="mr-2 h-5 w-5" />
                                  Mark as Unlearned
                                </DropdownMenuItem>
                              )}

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
                        <TableCell colSpan={5}>
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
                  <TableCell colSpan={5} className="h-24 text-center">
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
};

export default ProblemList;
