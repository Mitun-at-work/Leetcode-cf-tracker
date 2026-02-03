import type { AchievementDef } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'seven_day_consistency',
    name: '7-Day Consistency',
    description: '7 days of consistent problem solving',
    icon: '/asset/7.gif',
    rarity: 'common',
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'one_month_consistency',
    name: '1-Month Consistency',
    description: '30 days of consistent problem solving',
    icon: '/asset/30.gif',
    rarity: 'common',
    condition: (stats) => stats.currentStreak >= 30,
  },
  {
    id: 'three_month_consistency',
    name: '3-Month Consistency',
    description: '90 days of consistent problem solving',
    icon: '/asset/90.gif',
    rarity: 'rare',
    condition: (stats) => stats.currentStreak >= 90,
  },
  {
    id: 'six_month_consistency',
    name: '6-Month Consistency',
    description: '180 days of consistent problem solving',
    icon: '/asset/180.gif',
    rarity: 'epic',
    condition: (stats) => stats.currentStreak >= 180,
  },
  {
    id: 'one_year_consistency',
    name: '1-Year Consistency',
    description: '365 days of consistent problem solving',
    icon: '/asset/365.gif',
    rarity: 'legendary',
    condition: (stats) => stats.currentStreak >= 365,
  },
];
