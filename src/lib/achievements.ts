import type { AchievementDef } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'seven_day_streak',
    name: '7-Day Streak',
    description: 'Maintain a 7-day solving streak',
    icon: '🔥',
    rarity: 'common',
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'one_month_streak',
    name: '1-Month Streak',
    description: 'Maintain a 30-day solving streak',
    icon: '📅',
    rarity: 'rare',
    condition: (stats) => stats.currentStreak >= 30,
  },
  {
    id: 'six_month_streak',
    name: '6-Month Streak',
    description: 'Maintain a 180-day solving streak',
    icon: '🏆',
    rarity: 'epic',
    condition: (stats) => stats.currentStreak >= 180,
  },
  {
    id: 'one_year_streak',
    name: '1-Year Streak',
    description: 'Maintain a 365-day solving streak',
    icon: '👑',
    rarity: 'legendary',
    condition: (stats) => stats.currentStreak >= 365,
  },
];
