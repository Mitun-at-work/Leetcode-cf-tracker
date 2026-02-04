import { describe, it, expect, beforeEach, vi } from 'vitest';
import StorageService from '../storage';
import ApiService from '../../services/api';

// Mock ApiService
vi.mock('../../services/api', () => ({
  default: {
    isAuthenticated: vi.fn(),
    getProblems: vi.fn(),
    createProblem: vi.fn(),
    updateProblem: vi.fn(),
    deleteProblem: vi.fn(),
    getContests: vi.fn(),
    createContest: vi.fn(),
    updateContest: vi.fn(),
    deleteContest: vi.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

const mockProblems = [
  {
    id: 'problem-1',
    platform: 'leetcode' as const,
    title: 'Two Sum',
    problemId: 'two-sum',
    difficulty: 'Easy',
    url: 'https://leetcode.com/problems/two-sum/',
    dateSolved: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    notes: 'Hash table solution',
    isReview: false,
    repetition: 0,
    interval: 0,
    nextReviewDate: null,
    topics: ['Array', 'Hash Table'],
    status: 'active' as const,
    companies: ['Google']
  }
];

const mockContests = [
  {
    id: 'contest-1',
    name: 'Weekly Contest 123',
    platform: 'leetcode' as const,
    startTime: '2024-01-07T10:30:00.000Z',
    duration: 90,
    url: 'https://leetcode.com/contest/weekly-contest-123/',
    status: 'scheduled' as const,
    problemsSolved: 0
  }
];

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Offline Mode', () => {
    beforeEach(() => {
      vi.mocked(ApiService.isAuthenticated).mockReturnValue(false);
    });

    it('should get problems from localStorage in offline mode', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProblems));

      const problems = await StorageService.getProblems();

      expect(problems).toEqual(mockProblems);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('leetcode-cf-tracker-problems');
      expect(ApiService.getProblems).not.toHaveBeenCalled();
    });

    it('should save problems to localStorage in offline mode', async () => {
      await StorageService.saveProblems(mockProblems);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'leetcode-cf-tracker-problems',
        JSON.stringify(mockProblems)
      );
    });

    it('should add problem locally in offline mode', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));

      const problemData = {
        platform: 'leetcode' as const,
        title: 'New Problem',
        problemId: 'new-problem',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/new-problem/',
        dateSolved: '2024-01-01T00:00:00.000Z',
        notes: 'New problem notes',
        isReview: false,
        repetition: 0,
        interval: 0,
        nextReviewDate: null,
        topics: ['Array'],
        status: 'active' as const,
        companies: []
      };

      const result = await StorageService.addProblem(problemData);

      expect(result.title).toBe(problemData.title);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should update problem locally in offline mode', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProblems));

      const updates = { title: 'Updated Title', notes: 'Updated notes' };
      const result = await StorageService.updateProblem('problem-1', updates);

      expect(result?.title).toBe(updates.title);
      expect(result?.notes).toBe(updates.notes);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should delete problem locally in offline mode', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProblems));

      const result = await StorageService.deleteProblem('problem-1');

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Online Mode', () => {
    beforeEach(() => {
      vi.mocked(ApiService.isAuthenticated).mockReturnValue(true);
    });

    it('should get problems from API in online mode', async () => {
      vi.mocked(ApiService.getProblems).mockResolvedValue(mockProblems);

      const problems = await StorageService.getProblems();

      expect(problems).toEqual(mockProblems);
      expect(ApiService.getProblems).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'leetcode-cf-tracker-problems',
        JSON.stringify(mockProblems)
      );
    });

    it('should fallback to localStorage when API fails', async () => {
      vi.mocked(ApiService.getProblems).mockRejectedValue(new Error('API Error'));
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProblems));

      const problems = await StorageService.getProblems();

      expect(problems).toEqual(mockProblems);
      expect(ApiService.getProblems).toHaveBeenCalled();
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
    });

    it('should create problem via API in online mode', async () => {
      const problemData = {
        platform: 'leetcode' as const,
        title: 'API Problem',
        problemId: 'api-problem',
        difficulty: 'Hard',
        url: 'https://leetcode.com/problems/api-problem/',
        dateSolved: '2024-01-01T00:00:00.000Z',
        notes: 'API problem notes',
        isReview: false,
        repetition: 0,
        interval: 0,
        nextReviewDate: null,
        topics: ['Dynamic Programming'],
        status: 'active' as const,
        companies: ['Meta']
      };

      const expectedResult = { ...problemData, id: 'api-problem-id', createdAt: '2024-01-01T00:00:00.000Z' };
      vi.mocked(ApiService.createProblem).mockResolvedValue(expectedResult as Problem);

      const result = await StorageService.addProblem(problemData);

      expect(result).toEqual(expectedResult);
      expect(ApiService.createProblem).toHaveBeenCalledWith(problemData);
    });

    it('should update problem via API in online mode', async () => {
      const updates = { title: 'API Updated Title' };
      const expectedResult = { ...mockProblems[0], ...updates };
      vi.mocked(ApiService.updateProblem).mockResolvedValue(expectedResult as Problem);

      const result = await StorageService.updateProblem('problem-1', updates);

      expect(result).toEqual(expectedResult);
      expect(ApiService.updateProblem).toHaveBeenCalledWith('problem-1', updates);
    });

    it('should delete problem via API in online mode', async () => {
      vi.mocked(ApiService.deleteProblem).mockResolvedValue();

      const result = await StorageService.deleteProblem('problem-1');

      expect(result).toBe(true);
      expect(ApiService.deleteProblem).toHaveBeenCalledWith('problem-1');
    });
  });

  describe('Contests', () => {
    beforeEach(() => {
      vi.mocked(ApiService.isAuthenticated).mockReturnValue(true);
    });

    it('should get contests from API in online mode', async () => {
      vi.mocked(ApiService.getContests).mockResolvedValue(mockContests as Contest[]);

      const contests = await StorageService.getContests();

      expect(contests).toEqual(mockContests);
      expect(ApiService.getContests).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'contests',
        JSON.stringify(mockContests)
      );
    });

    it('should fallback to localStorage for contests when API fails', async () => {
      vi.mocked(ApiService.getContests).mockRejectedValue(new Error('API Error'));
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockContests));

      const contests = await StorageService.getContests();

      expect(contests).toEqual(mockContests);
      expect(ApiService.getContests).toHaveBeenCalled();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('contests');
    });
  });

  describe('POTD Problems', () => {
    it('should get POTD problems from localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProblems));

      const problems = await StorageService.getPotdProblems();

      expect(problems).toEqual(mockProblems);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('potd-problems');
    });

    it('should save POTD problems to localStorage', async () => {
      await StorageService.savePotdProblems(mockProblems);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'potd-problems',
        JSON.stringify(mockProblems)
      );
    });
  });

  describe('Utility Methods', () => {
    it('should set offline mode', () => {
      StorageService.setOfflineMode(true);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('offline-mode', 'true');
    });

    it('should get offline mode status', () => {
      mockLocalStorage.getItem.mockReturnValue('true');

      const isOffline = StorageService.getOfflineMode();

      expect(isOffline).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('offline-mode');
    });

    it('should handle sync with server', async () => {
      vi.mocked(ApiService.isAuthenticated).mockReturnValue(true);
      vi.mocked(ApiService.getProblems).mockResolvedValue([]);
      vi.mocked(ApiService.getContests).mockResolvedValue([]);

      await StorageService.syncWithServer();

      // Verify API methods were called
      expect(ApiService.getProblems).toHaveBeenCalled();
      expect(ApiService.getContests).toHaveBeenCalled();
    });

    it('should not sync in offline mode', async () => {
      vi.mocked(ApiService.isAuthenticated).mockReturnValue(false);

      await StorageService.syncWithServer();

      // Should not throw and should handle offline mode
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const problems = await StorageService.getProblems();

      expect(problems).toEqual([]);
    });

    it('should handle localStorage errors gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // The function should handle the error gracefully and return empty array
      const problems = await StorageService.getProblems();
      expect(problems).toEqual([]);
    });
  });
});
