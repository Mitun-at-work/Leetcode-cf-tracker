import { useState, useCallback } from 'react';
import type { Problem } from '../types';

export const useProblemForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState<Problem | null>(null);
  const [formContext, setFormContext] = useState<'regular' | 'tosolve'>('regular');

  const openForm = useCallback((problem: Problem | null = null, context: 'regular' | 'tosolve' = 'regular') => {
    setProblemToEdit(problem);
    setFormContext(context);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setProblemToEdit(null);
    setFormContext('regular');
  }, []);

  return {
    isFormOpen,
    problemToEdit,
    formContext,
    openForm,
    closeForm,
    setIsFormOpen,
  };
};
