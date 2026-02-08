import { useState, useEffect, useCallback, useRef } from 'react';
import type { Problem, ActiveDailyCodingChallengeQuestion } from '../types';
import StorageService from '../utils/storage';
import { toast } from 'sonner';

const REVIEW_INTERVALS = [2, 4, 7];

export const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [potdProblems, setPotdProblems] = useState<Problem[]>([]);
  const [companyProblems, setCompanyProblems] = useState<Problem[]>([]);
  const [toSolveProblems, setToSolveProblems] = useState<Problem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [problemsData, potdData, companyData, toSolveData] = await Promise.all([
          StorageService.getProblems(),
          StorageService.getPotdProblems(),
          StorageService.getCompanyProblems(),
          StorageService.getToSolveProblems(),
        ]);

        setProblems(problemsData);
        setPotdProblems(potdData);
        setCompanyProblems(companyData);
        setToSolveProblems(toSolveData);
      } catch (_error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Auto-save when data changes (with debouncing to reduce writes)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoaded && (problems.length > 0 || toSolveProblems.length > 0)) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(() => {
        StorageService.saveProblems(problems);
        StorageService.savePotdProblems(potdProblems);
        StorageService.saveCompanyProblems(companyProblems);
        StorageService.saveToSolveProblems(toSolveProblems);
      }, 500); // Debounce saves to 500ms
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [problems, potdProblems, companyProblems, toSolveProblems, isLoaded]);

  const addProblem = useCallback((problem: Omit<Problem, 'id' | 'createdAt'>) => {
    const newProblem: Problem = {
      ...problem,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProblems(prev => [...prev, newProblem]);
  }, []);

  const updateProblem = useCallback((id: string, updates: Partial<Problem>) => {
    setProblems(prev => {
      const newProblems = prev.map(p => {
        if (p.id !== id) return p;

        const updatedProblem = { ...p, ...updates };

        // Handle review scheduling
        if (updates.isReview !== undefined) {
          if (updates.isReview) {
            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + REVIEW_INTERVALS[0]);
            updatedProblem.nextReviewDate = nextReviewDate.toISOString();
            updatedProblem.repetition = 0;
            updatedProblem.interval = REVIEW_INTERVALS[0];
          } else {
            updatedProblem.nextReviewDate = null;
            updatedProblem.repetition = 0;
            updatedProblem.interval = 0;
          }
        }

        return updatedProblem;
      });

      return newProblems;
    });
  }, []);

  const deleteProblem = useCallback((id: string) => {
    setProblems(prev => prev.filter(p => p.id !== id));
  }, []);

  const markProblemReviewed = useCallback((id: string, currentInterval: number) => {
    const nextIntervalIndex = REVIEW_INTERVALS.indexOf(currentInterval) + 1;

    if (nextIntervalIndex < REVIEW_INTERVALS.length) {
      const nextInterval = REVIEW_INTERVALS[nextIntervalIndex];
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

      updateProblem(id, {
        nextReviewDate: nextReviewDate.toISOString(),
        interval: nextInterval,
        repetition: nextIntervalIndex,
      });

      toast.success(`Problem rescheduled for review in ${nextInterval} day(s).`);
    } else {
      updateProblem(id, {
        status: 'learned',
        isReview: false,
        nextReviewDate: null,
        repetition: 0,
        interval: 0,
      });

      toast.success('Problem marked as learned!');
    }
  }, [updateProblem]);

  // POTD operations
  const addPotdProblem = useCallback((potd: ActiveDailyCodingChallengeQuestion) => {
    const isDuplicate = potdProblems.some(p => p.problemId === potd.question.titleSlug);
    if (isDuplicate) {
      toast.info('Problem of the day already exists in your POTD list.');
      return;
    }

    const newProblem: Problem = {
      id: crypto.randomUUID(),
      platform: 'leetcode',
      title: potd.question.title,
      problemId: potd.question.titleSlug,
      difficulty: potd.question.difficulty,
      url: `https://leetcode.com${potd.link}`,
      dateSolved: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: '',
      isReview: false,
      repetition: 0,
      interval: 0,
      nextReviewDate: null,
      topics: potd.question.topicTags.map(t => t.name),
      status: 'active',
      companies: [],
    };

    setPotdProblems(prev => [...prev, newProblem]);
    toast.success('Problem of the day added to your POTD list!');
  }, [potdProblems]);

  const updatePotdProblem = useCallback((id: string, updates: Partial<Problem>) => {
    setPotdProblems(prev =>
      prev.map(p => {
        if (p.id !== id) return p;

        const updatedProblem = { ...p, ...updates };

        if (updates.isReview !== undefined) {
          if (updates.isReview) {
            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + REVIEW_INTERVALS[0]);
            updatedProblem.nextReviewDate = nextReviewDate.toISOString();
            updatedProblem.repetition = 0;
            updatedProblem.interval = REVIEW_INTERVALS[0];
          } else {
            updatedProblem.nextReviewDate = null;
            updatedProblem.repetition = 0;
            updatedProblem.interval = 0;
          }
        }

        return updatedProblem;
      })
    );
  }, []);

  const deletePotdProblem = useCallback((id: string) => {
    setPotdProblems(prev => prev.filter(p => p.id !== id));
  }, []);

  const markPotdProblemReviewed = useCallback((id: string, currentInterval: number) => {
    const nextIntervalIndex = REVIEW_INTERVALS.indexOf(currentInterval) + 1;

    if (nextIntervalIndex < REVIEW_INTERVALS.length) {
      const nextInterval = REVIEW_INTERVALS[nextIntervalIndex];
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

      updatePotdProblem(id, {
        nextReviewDate: nextReviewDate.toISOString(),
        interval: nextInterval,
        repetition: nextIntervalIndex,
      });

      toast.success(`POTD Problem rescheduled for review in ${nextInterval} day(s).`);
    } else {
      updatePotdProblem(id, {
        status: 'learned',
        isReview: false,
        nextReviewDate: null,
        repetition: 0,
        interval: 0,
      });

      toast.success('POTD Problem marked as learned!');
    }
  }, [updatePotdProblem]);

  // Company problems operations
  const importProblems = useCallback((importedProblems: Partial<Problem>[]) => {
    const existingSolvedUrls = new Set(problems.map(p => p.url));
    const existingCompanyUrls = new Set(companyProblems.map(p => p.url));
    const allExistingUrls = new Set([...existingSolvedUrls, ...existingCompanyUrls]);

    const INITIAL_PROBLEM_STATE: Partial<Problem> = {
      platform: 'leetcode',
      dateSolved: new Date().toISOString(),
      notes: '',
      submissionLink: '',
      isReview: false,
      topics: [],
      companies: [],
      status: 'active',
      repetition: 0,
      interval: 0,
      nextReviewDate: null,
    };

    const newProblems: Problem[] = importedProblems
      .filter(p => p.url && !allExistingUrls.has(p.url))
      .map(p => ({
        ...INITIAL_PROBLEM_STATE,
        ...p,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        platform: 'leetcode',
        status: 'active',
        dateSolved: '',
      } as Problem));

    if (newProblems.length > 0) {
      setCompanyProblems(prev => [...prev, ...newProblems]);
      toast.success(`${newProblems.length} company problem(s) imported successfully!`);
    } else {
      toast.info('No new problems to import. All problems already exist.');
    }
  }, [problems, companyProblems]);

  const markCompanyProblemAsSolved = useCallback((problem: Problem) => {
    const solvedProblem: Problem = {
      ...problem,
      dateSolved: new Date().toISOString(),
      status: 'learned',
    };

    setProblems(prev => [...prev, solvedProblem]);
    setCompanyProblems(prev => prev.filter(p => p.id !== problem.id));
  }, []);

  const removeCompanyProblem = useCallback((problemId: string) => {
    setCompanyProblems(prev => prev.filter(p => p.id !== problemId));
  }, []);

  // To-solve problems operations
  const addToSolveProblem = useCallback((problem: Omit<Problem, 'id' | 'createdAt'>) => {
    const newProblem: Problem = {
      ...problem,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      toSolve: true,
    };
    setToSolveProblems(prev => [...prev, newProblem]);
    toast.success('Added to problems to solve!');
  }, []);

  const updateToSolveProblem = useCallback((id: string, updates: Partial<Problem>) => {
    setToSolveProblems(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteToSolveProblem = useCallback((problemId: string) => {
    setToSolveProblems(prev => prev.filter(p => p.id !== problemId));
  }, []);

  const moveToSolveProblemToSolved = useCallback((toSolveProblem: Problem) => {
    // Add to solved list
    const solvedProblem: Problem = {
      ...toSolveProblem,
      dateSolved: new Date().toISOString(),
      toSolve: false,
      status: 'active',
    };
    
    setProblems(prev => [...prev, solvedProblem]);
    
    // Remove from to-solve list
    setToSolveProblems(prev => prev.filter(p => p.id !== toSolveProblem.id));
    toast.success('Problem moved to solved list!');
  }, []);

  // Computed values
  const activeProblems = problems.filter(p => p.status === 'active');
  const reviewProblems = activeProblems.filter(p => p.isReview && p.nextReviewDate);
  const reviewPotdProblems = potdProblems.filter(p => p.isReview && p.nextReviewDate);

  const dueReviewCount = [...reviewProblems, ...reviewPotdProblems].filter(
    p => p.nextReviewDate && new Date(p.nextReviewDate) <= new Date()
  ).length;

  return {
    problems,
    potdProblems,
    companyProblems,
    toSolveProblems,
    isLoaded,
    activeProblems,
    reviewProblems,
    reviewPotdProblems,
    dueReviewCount,
    addProblem,
    updateProblem,
    deleteProblem,
    markProblemReviewed,
    addPotdProblem,
    updatePotdProblem,
    deletePotdProblem,
    markPotdProblemReviewed,
    importProblems,
    markCompanyProblemAsSolved,
    removeCompanyProblem,
    addToSolveProblem,
    updateToSolveProblem,
    deleteToSolveProblem,
    moveToSolveProblemToSolved,
  };
};
