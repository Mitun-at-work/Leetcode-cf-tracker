import { lazy } from 'react';

// Lazy load chart components to reduce initial bundle size
export const PlatformChart = lazy(() => import('./PlatformChart'));
export const DifficultyChart = lazy(() => import('./DifficultyChart'));
export const ActivityChart = lazy(() => import('./ActivityChart'));