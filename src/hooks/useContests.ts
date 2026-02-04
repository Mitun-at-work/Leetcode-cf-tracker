import { useState, useEffect, useCallback } from 'react';
import type { Contest } from '../types';
import StorageService from '../utils/storage';
import { toast } from 'sonner';

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load contests on mount
  useEffect(() => {
    const loadContests = async () => {
      try {
        const contestsData = await StorageService.getContests();
        setContests(contestsData);
      } catch (_error) {
        toast.error('Failed to load contests');
      } finally {
        setIsLoaded(true);
      }
    };

    loadContests();
  }, []);

  // Auto-save when contests change
  useEffect(() => {
    if (isLoaded) {
      StorageService.saveContests(contests);
    }
  }, [contests, isLoaded]);

  const addContest = useCallback((contest: Omit<Contest, 'id'>) => {
    const newContest = { ...contest, id: crypto.randomUUID() };
    setContests(prev => [...prev, newContest]);
  }, []);

  const updateContest = useCallback((id: string, updates: Partial<Contest>) => {
    setContests(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteContest = useCallback((id: string) => {
    setContests(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    contests,
    isLoaded,
    addContest,
    updateContest,
    deleteContest,
  };
};
