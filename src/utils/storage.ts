import type { Problem, Contest } from '../types';
import ApiService from '../services/api';

const PROBLEMS_KEY = 'leetcode-cf-tracker-problems';
const POTD_PROBLEMS_KEY = 'potd-problems';
const COMPANY_PROBLEMS_KEY = 'company-problems';
const TO_SOLVE_PROBLEMS_KEY = 'to-solve-problems';
const CONTESTS_KEY = 'contests';
const OFFLINE_MODE_KEY = 'offline-mode';

class StorageService {
  private static isOfflineMode(): boolean {
    try {
      return localStorage.getItem(OFFLINE_MODE_KEY) === 'true' || !ApiService.isAuthenticated();
    } catch (error) {
      console.error('Error accessing localStorage for offline mode:', error);
      // Default to offline mode if localStorage is not accessible
      return true;
    }
  }

  static async getProblems(): Promise<Problem[]> {
    if (this.isOfflineMode()) {
      try {
        const problems = localStorage.getItem(PROBLEMS_KEY);
        return problems ? JSON.parse(problems) : [];
      } catch (error) {
        console.error('Error parsing problems from storage:', error);
        return [];
      }
    }

    try {
      const problems = await ApiService.getProblems();
      // Cache for offline use
      localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
      return problems;
    } catch (error) {
      console.error('Error fetching problems from API, falling back to local storage:', error);
      // Fallback to local storage
      const problems = localStorage.getItem(PROBLEMS_KEY);
      return problems ? JSON.parse(problems) : [];
    }
  }

  static async saveProblems(problems: Problem[]): Promise<void> {
    // Always save to localStorage for offline support
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));

    if (!this.isOfflineMode()) {
      // Sync with backend in the background
      this.syncProblemsToServer(problems).catch(error => {
        console.warn('Failed to sync problems to server:', error);
      });
    }
  }

  static async getPotdProblems(): Promise<Problem[]> {
    try {
      const problems = localStorage.getItem(POTD_PROBLEMS_KEY);
      return problems ? JSON.parse(problems) : [];
    } catch (error) {
      console.error('Error parsing POTD problems from storage:', error);
      return [];
    }
  }

  static async savePotdProblems(problems: Problem[]): Promise<void> {
    localStorage.setItem(POTD_PROBLEMS_KEY, JSON.stringify(problems));
  }

  static async getToSolveProblems(): Promise<Problem[]> {
    try {
      const problems = localStorage.getItem(TO_SOLVE_PROBLEMS_KEY);
      return problems ? JSON.parse(problems) : [];
    } catch (error) {
      console.error('Error parsing to-solve problems from storage:', error);
      return [];
    }
  }

  static async saveToSolveProblems(problems: Problem[]): Promise<void> {
    localStorage.setItem(TO_SOLVE_PROBLEMS_KEY, JSON.stringify(problems));
  }

  static async getContests(): Promise<Contest[]> {
    if (this.isOfflineMode()) {
      try {
        const contests = localStorage.getItem(CONTESTS_KEY);
        return contests ? JSON.parse(contests) : [];
      } catch (error) {
        console.error('Error parsing contests from storage:', error);
        return [];
      }
    }

    try {
      const contests = await ApiService.getContests();
      // Cache for offline use
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests));
      return contests;
    } catch (error) {
      console.error('Error fetching contests from API, falling back to local storage:', error);
      // Fallback to local storage
      const contests = localStorage.getItem(CONTESTS_KEY);
      return contests ? JSON.parse(contests) : [];
    }
  }

  static async saveContests(contests: Contest[]): Promise<void> {
    // Always save to localStorage for offline support
    localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests));

    if (!this.isOfflineMode()) {
      // Sync with backend in the background
      this.syncContestsToServer(contests).catch(error => {
        console.warn('Failed to sync contests to server:', error);
      });
    }
  }

  // Company Problems methods (for imported company problems that are not yet solved)
  static async getCompanyProblems(): Promise<Problem[]> {
    try {
      const companyProblems = localStorage.getItem(COMPANY_PROBLEMS_KEY);
      return companyProblems ? JSON.parse(companyProblems) : [];
    } catch (error) {
      console.error('Error parsing company problems from storage:', error);
      return [];
    }
  }

  static async saveCompanyProblems(companyProblems: Problem[]): Promise<void> {
    // Company problems are stored locally only (they're reference lists, not user progress)
    localStorage.setItem(COMPANY_PROBLEMS_KEY, JSON.stringify(companyProblems));
  }

  static async addCompanyProblem(problemData: Partial<Problem>): Promise<Problem> {
    const companyProblems = await this.getCompanyProblems();

    // Check if problem already exists (by URL)
    const existingProblem = companyProblems.find(p => p.url === problemData.url);
    if (existingProblem) {
      throw new Error('Problem already exists in company problems list');
    }

    const newProblem: Problem = {
      id: crypto.randomUUID(),
      platform: 'leetcode',
      title: problemData.title || '',
      problemId: problemData.problemId || '',
      difficulty: problemData.difficulty || '',
      url: problemData.url || '',
      dateSolved: '', // Empty = not solved
      createdAt: new Date().toISOString(),
      notes: problemData.notes || '',
      isReview: false,
      repetition: 0,
      interval: 0,
      nextReviewDate: null,
      topics: problemData.topics || [],
      status: 'active', // Not solved yet
      companies: problemData.companies || []
    };

    const updatedProblems = [...companyProblems, newProblem];
    await this.saveCompanyProblems(updatedProblems);
    return newProblem;
  }

  static async addProblem(problemData: Omit<Problem, 'id' | 'createdAt'>): Promise<Problem> {
    if (this.isOfflineMode()) {
      const problems = await this.getProblems();

      const newProblem: Problem = {
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        ...problemData,
      };

      problems.push(newProblem);
      await this.saveProblems(problems);

      return newProblem;
    }

    try {
      // Add id field for API compatibility
      const problemWithId = { ...problemData, id: crypto.randomUUID() };
      const newProblem = await ApiService.createProblem(problemWithId);

      // Update local cache with the new problem from server
      const problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY) || '[]') as Problem[];
      problems.push(newProblem);
      localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));

      return newProblem;
    } catch (error) {
      console.error('Error creating problem via API, falling back to local storage:', error);
      // Fallback to local storage
      const problems = await this.getProblems();

      const newProblem: Problem = {
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        ...problemData,
      };

      problems.push(newProblem);
      await this.saveProblems(problems);

      return newProblem;
    }
  }

  static async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem | null> {
    if (this.isOfflineMode()) {
      const problems = await this.getProblems();
      const index = problems.findIndex(p => p.id === id);

      if (index === -1) {
        console.error('Problem not found:', id);
        return null;
      }

      problems[index] = { ...problems[index], ...updates };
      await this.saveProblems(problems);

      return problems[index];
    }

    try {
      const updatedProblem = await ApiService.updateProblem(id, updates);

      // Update local cache with the updated problem from server
      const problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY) || '[]') as Problem[];
      const index = problems.findIndex(p => p.id === id);
      if (index !== -1) {
        problems[index] = updatedProblem;
        localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
      }

      return updatedProblem;
    } catch (error) {
      console.error('Error updating problem via API, falling back to local storage:', error);
      // Fallback to local storage
      const problems = await this.getProblems();
      const index = problems.findIndex(p => p.id === id);

      if (index === -1) {
        console.error('Problem not found:', id);
        return null;
      }

      problems[index] = { ...problems[index], ...updates };
      await this.saveProblems(problems);

      return problems[index];
    }
  }

  static async deleteProblem(id: string): Promise<boolean> {
    if (this.isOfflineMode()) {
      const problems = await this.getProblems();
      const filteredProblems = problems.filter(p => p.id !== id);

      if (filteredProblems.length === problems.length) {
        console.error('Problem not found for deletion:', id);
        return false;
      }

      await this.saveProblems(filteredProblems);
      return true;
    }

    try {
      await ApiService.deleteProblem(id);

      // Update local cache by removing the deleted problem
      const problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY) || '[]') as Problem[];
      const filteredProblems = problems.filter(p => p.id !== id);
      localStorage.setItem(PROBLEMS_KEY, JSON.stringify(filteredProblems));

      return true;
    } catch (error) {
      console.error('Error deleting problem via API, falling back to local storage:', error);
      // Fallback to local storage
      const problems = await this.getProblems();
      const filteredProblems = problems.filter(p => p.id !== id);

      if (filteredProblems.length === problems.length) {
        console.error('Problem not found for deletion:', id);
        return false;
      }

      await this.saveProblems(filteredProblems);
      return true;
    }
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods for offline/online mode
  static setOfflineMode(offline: boolean): void {
    localStorage.setItem(OFFLINE_MODE_KEY, offline.toString());
  }

  static getOfflineMode(): boolean {
    return this.isOfflineMode();
  }

  // Sync methods
  static async syncWithServer(): Promise<void> {
    if (this.isOfflineMode()) {
      console.log('Cannot sync in offline mode');
      return;
    }

    try {
      console.log('🔄 Starting full sync with server...');

      // Sync problems and contests
      await Promise.all([
        this.syncProblemsWithServer(),
        this.syncContestsWithServer()
      ]);

      console.log('✅ Full sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  private static async syncProblemsToServer(_problems: Problem[]): Promise<void> {
    try {
      // This is called when saving problems locally - just log for now
      console.log('🔄 Syncing problems to server in background...');

      // Note: Individual problem sync happens through addProblem, updateProblem, deleteProblem
      // This method is for bulk operations if needed in the future

    } catch (error) {
      console.error('Failed to sync problems to server:', error);
      throw error;
    }
  }

  private static async syncContestsToServer(_contests: Contest[]): Promise<void> {
    try {
      console.log('🔄 Syncing contests to server in background...');

      // Contests are typically read-only data fetched from external APIs
      // So we don't usually need to sync them back to our server
      // This is mainly for caching purposes

    } catch (error) {
      console.error('Failed to sync contests to server:', error);
      throw error;
    }
  }

  private static async syncProblemsWithServer(): Promise<void> {
    try {
      console.log('🔄 Syncing problems with server...');

      // Get local problems
      const _localProblems = JSON.parse(localStorage.getItem(PROBLEMS_KEY) || '[]') as Problem[];

      // Get server problems
      const serverProblems = await ApiService.getProblems();

      // Simple strategy: server data takes precedence
      // In a more complex app, you'd implement conflict resolution
      localStorage.setItem(PROBLEMS_KEY, JSON.stringify(serverProblems));

      console.log(`✅ Synced ${serverProblems.length} problems from server`);

    } catch (error) {
      console.error('Failed to sync problems with server:', error);
      throw error;
    }
  }

  private static async syncContestsWithServer(): Promise<void> {
    try {
      console.log('🔄 Syncing contests with server...');

      // Get server contests
      const serverContests = await ApiService.getContests();

      // Update local cache
      localStorage.setItem(CONTESTS_KEY, JSON.stringify(serverContests));

      console.log(`✅ Synced ${serverContests.length} contests from server`);

    } catch (error) {
      console.error('Failed to sync contests with server:', error);
      throw error;
    }
  }
}

export default StorageService;
