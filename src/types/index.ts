export interface Problem {
  id: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder' | 'algozenith' | 'cses' | 'hackerrank';
  title: string;
  problemId: string;
  difficulty: string;
  url: string;
  submissionLink?: string;
  dateSolved: string;
  createdAt: string;
  notes: string;
  isReview: boolean;
  repetition: number;
  interval: number;
  nextReviewDate: string | null;
  topics: string[];
  status: 'active' | 'learned';
  companies: string[];
  toSolve?: boolean;
}

export interface Section {
  id: string;
  name: string;
  problemIds: string[];
}

export interface PlatformStats {
  leetcode: number;
  codeforces: number;
  atcoder: number;
  algozenith: number;
  cses: number;
  hackerrank: number;
}

export interface DifficultyStats {
  leetcode: {
    easy: number;
    medium: number;
    hard: number;
  };
  codeforces: Record<string, number>;
  atcoder: {
    easy: number;
    medium: number;
    hard: number;
  };
  algozenith: {
    easy: number;
    medium: number;
    hard: number;
  };
  cses: {
    easy: number;
    medium: number;
    hard: number;
  };
  hackerrank: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface OverallStats {
  totalProblems: number;
  thisWeek: number;
  thisMonth: number;
  streakDays: number;
  byPlatform: PlatformStats;
  byDifficulty: DifficultyStats;
  recentActivity: Problem[];
}

export interface ChartDataPoint {
  date: string;
  problems: number;
  cumulative: number;
}

export interface LeetCodeTopicTag {
  name: string;
  id: string;
  slug: string;
}

export interface LeetCodeQuestion {
  acRate: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  freqBar: number | null;
  frontendQuestionId: string;
  isFavor: boolean;
  paidOnly: boolean;
  status: string | null;
  title: string;
  titleSlug: string;
  hasVideoSolution: boolean;
  hasSolution: boolean;
  topicTags: LeetCodeTopicTag[];
}

export interface ActiveDailyCodingChallengeQuestion {
  date: string;
  userStatus: string;
  link: string;
  question: LeetCodeQuestion;
}

export interface LeetCodeDailyProblemResponse {
  data: {
    activeDailyCodingChallengeQuestion: ActiveDailyCodingChallengeQuestion;
  };
}

export interface Contest {
  id: string;
  name: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder' | 'codechef' | 'hackerrank' | 'other';
  startTime: string;
  duration: number; // in minutes
  url: string;
  rank?: number;
  problemsSolved?: number;
  totalProblems?: number;
  status: 'scheduled' | 'live' | 'completed';
  type?: string; // Optional type field for contest categorization
}

// API Types
export interface User {
  id: string;
  email: string;
  username: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  reviewIntervals: number[];
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export type CreateProblemRequest = Omit<Problem, '_id' | 'userId' | 'createdAt'>;
export type UpdateProblemRequest = Partial<Problem>;
export type BulkCreateProblemsRequest = {
  problems: Partial<Problem>[];
};
export type CreateContestRequest = Omit<Contest, '_id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateContestRequest = Partial<Contest>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  completionCount: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalProblems: number;
  currentStreak: number;
  longestStreak: number;
  platformCounts: Record<string, number>;
  difficultyCounts: Record<string, number>;
  topicCounts: Record<string, number>;
  reviewCount: number;
  learnedCount: number;
  xp: number;
  level: number;
}

export interface ImportedProblemData {
  title: string;
  url: string;
  difficulty: string;
  tags?: string[];
  source?: string;
  platform?: 'leetcode' | 'codeforces' | 'atcoder' | 'algozenith' | 'cses' | 'hackerrank';
  problemId?: string;
  submissionLink?: string;
  id?: string;
  createdAt?: string;
  dateSolved?: string;
  notes?: string;
  isReview?: boolean;
  repetition?: number;
  interval?: number;
  nextReviewDate?: string | null;
  topics?: string[];
  status?: 'active' | 'learned';
  companies?: string[];
  inMasterSheet?: boolean;
  toSolve?: boolean;
}