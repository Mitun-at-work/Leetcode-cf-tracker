export interface Problem {
  id: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder' | 'algozenith' | 'cses';
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
}

export interface PlatformStats {
  leetcode: number;
  codeforces: number;
  atcoder: number;
  algozenith: number;
  cses: number;
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
  platform: 'leetcode' | 'codeforces' | 'atcoder' | 'codechef' | 'other';
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

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
