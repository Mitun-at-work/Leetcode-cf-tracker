import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Achievement, AchievementStats, Problem } from '../types';
import { ACHIEVEMENTS } from '../lib/achievements';
import { toast } from 'sonner';

const ACHIEVEMENTS_KEY = 'leetcode-cf-tracker-achievements';
const ACHIEVEMENTS_VERSION = 'v2'; // Increment this to force refresh
const ACHIEVEMENTS_VERSION_KEY = 'leetcode-cf-tracker-achievements-version';

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

    // Calculate streak based on solving at least 1 problem per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get unique solve dates (days where at least 1 problem was solved)
    const uniqueSolveDates = Array.from(
      new Set(
        problems.map(p => {
          const date = new Date(p.dateSolved);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      )
    ).sort((a, b) => a - b);

    // Calculate current streak (going backwards from today)
    let currentStreak = 0;
    let checkDate = today.getTime();
    
    // Check if there's a problem solved today or yesterday (to allow for today not being complete yet)
    const hasToday = uniqueSolveDates.includes(checkDate);
    const yesterday = checkDate - (1000 * 60 * 60 * 24);
    const hasYesterday = uniqueSolveDates.includes(yesterday);
    
    if (hasToday) {
      currentStreak = 1;
      checkDate -= 1000 * 60 * 60 * 24; // Move to yesterday
    } else if (hasYesterday) {
      currentStreak = 1;
      checkDate = yesterday - (1000 * 60 * 60 * 24); // Move to day before yesterday
    } else {
      // No streak if no problems solved today or yesterday
      currentStreak = 0;
    }
    
    // Continue counting backwards for consecutive days
    while (currentStreak > 0 && uniqueSolveDates.includes(checkDate)) {
      currentStreak++;
      checkDate -= 1000 * 60 * 60 * 24;
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: number | null = null;

    uniqueSolveDates.forEach(date => {
      if (prevDate === null) {
        tempStreak = 1;
      } else if ((date - prevDate) / (1000 * 60 * 60 * 24) === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
      prevDate = date;
    });
    longestStreak = Math.max(longestStreak, tempStreak);

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
      const savedVersion = localStorage.getItem(ACHIEVEMENTS_VERSION_KEY);
      const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
      
      // Force refresh if version changed or no saved data
      if (savedVersion !== ACHIEVEMENTS_VERSION || !saved) {
        // Clear old data and initialize fresh
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
        localStorage.setItem(ACHIEVEMENTS_VERSION_KEY, ACHIEVEMENTS_VERSION);
      } else {
        const loadedAchievements = JSON.parse(saved);
        
        // Sync with current ACHIEVEMENTS definitions
        const syncedAchievements = ACHIEVEMENTS.map(def => {
          const existing = loadedAchievements.find((a: Achievement) => a.id === def.id);
          if (existing) {
            // Keep existing progress
            return {
              ...existing,
              name: def.name, // Update name in case it changed
              description: def.description, // Update description in case it changed
              icon: def.icon, // Update icon in case it changed
              rarity: def.rarity, // Update rarity in case it changed
              completionCount: existing.completionCount || 0,
            };
          }
          // New achievement not in saved data
          return {
            id: def.id,
            name: def.name,
            description: def.description,
            icon: def.icon,
            rarity: def.rarity,
            unlockedAt: null,
            completionCount: 0,
          };
        });
        
        setAchievements(syncedAchievements);
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(syncedAchievements));
      }
    } catch (error) {
      // Silent fail
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

      // Calculate progress percentage for consistency achievements
      switch (achievementId) {
        case 'seven_day_consistency':
          return Math.min(100, (stats.currentStreak / 7) * 100);
        case 'one_month_consistency':
          return Math.min(100, (stats.currentStreak / 30) * 100);
        case 'three_month_consistency':
          return Math.min(100, (stats.currentStreak / 90) * 100);
        case 'six_month_consistency':
          return Math.min(100, (stats.currentStreak / 180) * 100);
        case 'one_year_consistency':
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
