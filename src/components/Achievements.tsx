import { useMemo } from 'react';
import type { Achievement } from '../types';
import { Badge } from './ui/badge';
import './achievements.css';

interface AchievementsGridProps {
  achievements: Achievement[];
  getProgress: (id: string) => number;
}

export function AchievementsGrid({ achievements, getProgress }: AchievementsGridProps) {
  // Combine all achievements (active and completed) and sort by achievement order
  const allAchievements = useMemo(() => {
    return achievements.map(achievement => ({
      ...achievement,
      totalCompletions: (achievement.completionCount || 0) + (achievement.unlockedAt ? 1 : 0),
    }));
  }, [achievements]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Badges</h2>
          <p className="text-sm text-muted-foreground">Earn badges by maintaining daily problem-solving streaks</p>
        </div>

      {/* Achievements as LeetCode-style Badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
        {allAchievements.map(achievement => {
          const isActive = !!achievement.unlockedAt;
          const totalTimes = achievement.totalCompletions;
          const progress = getProgress(achievement.id);
          
          return (
            <div
              key={achievement.id}
              className="flex flex-col items-center gap-3"
            >
              {/* Badge Circle */}
              <div className={`relative w-28 h-28 rounded-full flex items-center justify-center border-4 transition-all ${
                isActive
                  ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/40 shadow-[0_8px_16px_rgba(249,115,22,0.3)] dark:shadow-[0_8px_16px_rgba(249,115,22,0.5)] achievement-shine'
                  : totalTimes > 0
                  ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 shadow-sm'
              }`}>
                <div className={`${isActive ? '' : 'opacity-50'}`}>
                  <img 
                    src={achievement.icon} 
                    alt={achievement.name}
                    className="w-16 h-16 object-contain frozen-gif"
                  />
                </div>
                
                {/* Count Badge - Always show */}
                <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : totalTimes > 0
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-400 dark:bg-gray-700 text-white'
                }`}>
                  {totalTimes}
                </div>
              </div>

              {/* Badge Info */}
              <div className="text-center max-w-[140px]">
                <h3 className={`text-sm font-semibold mb-2 ${
                  isActive 
                    ? 'text-foreground' 
                    : 'text-muted-foreground'
                }`}>
                  {achievement.name}
                </h3>
                
                {/* Progress or Status */}
                {isActive ? (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
                    Active
                  </Badge>
                ) : totalTimes > 0 ? (
                  <Badge variant="secondary" className="text-xs">
                    Completed
                  </Badge>
                ) : (
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
  );
}
