import { useState, useCallback } from 'react';
import type { Problem } from '../types';

export const useProblemForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState<Problem | null>(null);

  const openForm = useCallback((problem: Problem | null = null) => {
    setProblemToEdit(problem);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setProblemToEdit(null);
  }, []);

  return {
    isFormOpen,
    problemToEdit,
    openForm,
    closeForm,
    setIsFormOpen,
  };
};
