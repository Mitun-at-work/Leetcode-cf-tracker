import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Achievement, AchievementStats, Problem } from '../types';
import { ACHIEVEMENTS } from '../lib/achievements';
import { toast } from 'sonner';

const ACHIEVEMENTS_KEY = 'leetcode-cf-tracker-achievements';

export const useAchievements = (problems: Problem[]) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Calculate achievement stats from problems
  const stats = useMemo<AchievementStats>(() => {
    const totalProblems = problems.length;
    const learnedCount = problems.filter(p => p.status === 'learned').length;
    const reviewCount = problems.filter(p => p.isReview).length;
    const mastersheetCount = problems.filter(p => p.inMasterSheet).length;

    // Platform counts
    const platformCounts = problems.reduce((acc, p) => {
      acc[p.platform] = (acc[p.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Difficulty counts
    const difficultyCounts = problems.reduce((acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Topic counts
    const topicCounts = problems.reduce((acc, p) => {
      if (p.topics && Array.isArray(p.topics)) {
        p.topics.forEach(topic => {
          acc[topic] = (acc[topic] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate streak
    const today = new Date();
    const solveDates = problems
      .map(p => new Date(p.dateSolved).setHours(0, 0, 0, 0))
      .sort((a, b) => a - b);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: number | null = null;

    solveDates.forEach(date => {
      if (prevDate !== null && (date - prevDate) / (1000 * 60 * 60 * 24) === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = date;
    });

    // Check current streak
    let checkDate = today.setHours(0, 0, 0, 0);
    while (solveDates.includes(checkDate)) {
      currentStreak++;
      checkDate -= 1000 * 60 * 60 * 24;
    }

    // Calculate XP and level
    const getXpForProblem = (problem: Problem) => {
      if (problem.difficulty === 'Easy') return 10;
      if (problem.difficulty === 'Medium') return 20;
      if (problem.difficulty === 'Hard') return 30;

      const numericDifficulty = Number(problem.difficulty);
      if (!Number.isNaN(numericDifficulty)) {
        if (numericDifficulty < 1200) return 10;
        if (numericDifficulty < 1600) return 20;
        return 30;
      }

      return 15;
    };

    const xp = problems.reduce((sum, p) => sum + getXpForProblem(p), 0);
    const level = Math.floor(xp / 100) + 1;

    return {
      totalProblems,
      currentStreak,
      longestStreak,
      platformCounts,
      difficultyCounts,
      topicCounts,
      mastersheetCount,
      reviewCount,
      learnedCount,
      xp,
      level,
    };
  }, [problems]);

  // Load achievements from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (saved) {
        const loadedAchievements = JSON.parse(saved);
        // Ensure all achievements have completionCount
        const migratedAchievements = loadedAchievements.map((a: Achievement) => ({
          ...a,
          completionCount: a.completionCount || 0,
        }));
        setAchievements(migratedAchievements);
      } else {
        // Initialize with all achievements locked
        const initialized = ACHIEVEMENTS.map(def => ({
          id: def.id,
          name: def.name,
          description: def.description,
          icon: def.icon,
          rarity: def.rarity,
          unlockedAt: null,
          completionCount: 0,
        }));
        setAchievements(initialized);
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(initialized));
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Check for newly unlocked achievements and track completions
  useEffect(() => {
    if (!isLoaded) return;

    const updatedAchievements = achievements.map(achievement => {
      const def = ACHIEVEMENTS.find(a => a.id === achievement.id);
      if (!def) return achievement;

      const conditionMet = def.condition(stats);

      // If condition is met and it wasn't unlocked before, unlock it
      if (conditionMet && !achievement.unlockedAt) {
        toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, {
          description: achievement.description,
        });
        return {
          ...achievement,
          unlockedAt: new Date().toISOString(),
          completionCount: 1,
        };
      }

      // If condition is met and it was already unlocked, just ensure it stays unlocked
      if (conditionMet && achievement.unlockedAt) {
        return achievement;
      }

      // If condition is NOT met but it was unlocked before (streak broken)
      if (!conditionMet && achievement.unlockedAt) {
        // Increment completion count and reset unlock status
        return {
          ...achievement,
          unlockedAt: null,
          completionCount: achievement.completionCount || 1,
        };
      }

      return achievement;
    });

    // Check if anything changed
    if (JSON.stringify(updatedAchievements) !== JSON.stringify(achievements)) {
      setAchievements(updatedAchievements);
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updatedAchievements));
    }
  }, [stats, isLoaded, achievements]);

  const unlockedCount = useMemo(
    () => achievements.filter(a => a.unlockedAt).length,
    [achievements]
  );

  const getAchievementProgress = useCallback(
    (achievementId: string): number => {
      const def = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!def) return 0;

      // Calculate progress percentage for streak achievements
      switch (achievementId) {
        case 'seven_day_streak':
          return Math.min(100, (stats.currentStreak / 7) * 100);
        case 'one_month_streak':
          return Math.min(100, (stats.currentStreak / 30) * 100);
        case 'six_month_streak':
          return Math.min(100, (stats.currentStreak / 180) * 100);
        case 'one_year_streak':
          return Math.min(100, (stats.currentStreak / 365) * 100);
        default:
          return 0;
      }
    },
    [stats]
  );

  return {
    achievements,
    unlockedCount,
    stats,
    getAchievementProgress,
  };
};
