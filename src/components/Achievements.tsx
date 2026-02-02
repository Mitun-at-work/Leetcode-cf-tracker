import { useMemo } from 'react';
import type { Achievement } from '../types';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface AchievementsGridProps {
  achievements: Achievement[];
  getProgress: (id: string) => number;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
};

const RARITY_TEXT: Record<string, string> = {
  common: 'text-gray-700 dark:text-gray-300',
  rare: 'text-blue-700 dark:text-blue-300',
  epic: 'text-purple-700 dark:text-purple-300',
  legendary: 'text-yellow-700 dark:text-yellow-300',
};

export function AchievementsGrid({ achievements, getProgress }: AchievementsGridProps) {
  const unlockedAchievements = useMemo(
    () => achievements.filter(a => a.unlockedAt),
    [achievements]
  );

  const completedAchievements = useMemo(
    () => achievements.filter(a => (a.completionCount || 0) > 0),
    [achievements]
  );

  const lockedAchievements = useMemo(
    () => achievements.filter(a => !a.unlockedAt),
    [achievements]
  );

  const sortedLocked = useMemo(
    () => [...lockedAchievements].sort((a, b) => {
      const progressA = getProgress(a.id);
      const progressB = getProgress(b.id);
      return progressB - progressA;
    }),
    [lockedAchievements, getProgress]
  );

  return (
    <div className="space-y-8">
      {/* Active/Unlocked Achievements */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-2xl font-bold">Active Streaks</h2>
          <Badge variant="secondary">{unlockedAchievements.length} / {achievements.length}</Badge>
        </div>
        {unlockedAchievements.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {unlockedAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="rounded-lg border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:from-green-950 dark:to-emerald-950"
              >
                <div className="mb-3 text-5xl">{achievement.icon}</div>
                <h3 className="mb-1 text-lg font-bold text-green-900 dark:text-green-100">{achievement.name}</h3>
                <p className="mb-4 text-sm text-green-800 dark:text-green-200">{achievement.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className={`${RARITY_COLORS[achievement.rarity]} text-white`}>
                    {achievement.rarity}
                  </Badge>
                  {achievement.completionCount > 0 && (
                    <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-300">
                      ✓ {achievement.completionCount}x
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">No active streaks. Start solving to unlock!</p>
          </div>
        )}
      </div>

      {/* Completed Achievements (previously unlocked) */}
      {completedAchievements.some(a => !a.unlockedAt && a.completionCount > 0) && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-2xl font-bold">Completed</h2>
            <Badge variant="secondary">
              {completedAchievements.filter(a => !a.unlockedAt).length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {completedAchievements
              .filter(a => !a.unlockedAt && a.completionCount > 0)
              .map(achievement => (
                <div
                  key={achievement.id}
                  className="rounded-lg border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 dark:from-amber-950 dark:to-yellow-950"
                >
                  <div className="mb-3 text-5xl">{achievement.icon}</div>
                  <h3 className="mb-1 text-lg font-bold text-amber-900 dark:text-amber-100">{achievement.name}</h3>
                  <p className="mb-4 text-sm text-amber-800 dark:text-amber-200">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={`${RARITY_COLORS[achievement.rarity]} text-white`}>
                      {achievement.rarity}
                    </Badge>
                    <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-300">
                      ✓ {achievement.completionCount}x
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {sortedLocked.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Locked</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sortedLocked.map(achievement => {
              const progress = getProgress(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6 opacity-60 dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="mb-3 text-5xl grayscale">{achievement.icon}</div>
                  <h3 className="mb-1 text-lg font-bold text-gray-700 dark:text-gray-300">{achievement.name}</h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={RARITY_TEXT[achievement.rarity]}>
                        {achievement.rarity}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
