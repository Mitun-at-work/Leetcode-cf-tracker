import type { Problem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookCopy, CalendarDays, Star, Trophy, Clock, Flame, Target } from 'lucide-react';
import { isToday, isPast } from 'date-fns';
import type { ActiveDailyCodingChallengeQuestion } from '../types';
import { format, isSameDay, subDays, eachDayOfInterval, differenceInDays, eachWeekOfInterval } from 'date-fns';
import ImportProblems from './ImportProblems';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { getDailyGoal } from '@/utils/settingsStorage';


interface DashboardProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onAddPotd: (potd: ActiveDailyCodingChallengeQuestion) => void;
  onImportProblems: (problems: Partial<Problem>[]) => void;
}

const Dashboard = ({ problems, onUpdateProblem, onAddPotd, onImportProblems }: DashboardProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const totalProblems = problems.length;
  const thisWeek = problems.filter((p) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(p.dateSolved) >= weekAgo;
  }).length;
  const forReview = problems.filter((p) => p.isReview).length;
  const dueForReview = problems.filter(p => 
    p.isReview && 
    p.nextReviewDate && 
    (isToday(new Date(p.nextReviewDate)) || isPast(new Date(p.nextReviewDate)))
  ).length;

  const dailyGoal = 4;
  const solvesToday = problems.filter(p => isToday(new Date(p.dateSolved))).length;
  const dailyProgress = Math.min(100, Math.round((solvesToday / dailyGoal) * 100));
  const remainingToday = Math.max(0, dailyGoal - solvesToday);
  const streakAtRisk = solvesToday === 0;

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

  const totalXp = problems.reduce((sum, p) => sum + getXpForProblem(p), 0);
  const level = Math.floor(totalXp / 100) + 1;
  const xpIntoLevel = totalXp % 100;
  const xpToNext = 100 - xpIntoLevel;

  const getProgressColor = (value: number) => {
    if (value <= 25) return 'bg-red-500';
    if (value <= 50) return 'bg-yellow-500';
    if (value <= 75) return 'bg-orange-500';
    if (value >= 100) return 'bg-green-500';
    return 'bg-purple-500';
  };

  const getDifficultyBadgeVariant = (difficulty: string, platform: string): "default" | "destructive" | "secondary" | "outline" | "success" | "warning" => {
    if (platform === 'codeforces') return 'default';
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const calculateStreaks = (problems: Problem[]) => {
    const today = new Date();
    const solveDates = problems.map(p => new Date(p.dateSolved).setHours(0,0,0,0)).sort((a,b) => a - b);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    let prevDate: number | null = null;
    solveDates.forEach(date => {
      if (prevDate !== null && differenceInDays(date, prevDate) === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = date;
    });
    
    // Check current streak
    let checkDate = today.setHours(0,0,0,0);
    while (solveDates.includes(checkDate)) {
      currentStreak++;
      checkDate = subDays(new Date(checkDate), 1).getTime();
    }
    
    return { currentStreak, longestStreak };
  };

  const { currentStreak, longestStreak } = calculateStreaks(problems);

  // For calendar: exactly 52 weeks (like LeetCode)
  const today = new Date();
  
  // Start from exactly 52 weeks ago (364 days) from today
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  
  // Find the Sunday of the week containing the start date
  const startSunday = new Date(startDate);
  const startDayOfWeek = startDate.getDay();
  startSunday.setDate(startDate.getDate() - startDayOfWeek);
  
  // Find the Saturday of the week containing today
  const endSaturday = new Date(today);
  const todayDayOfWeek = today.getDay();
  endSaturday.setDate(today.getDate() + (6 - todayDayOfWeek));
  
  // Generate solve counts for the actual data range (not the padded weeks)
  const last365Days = eachDayOfInterval({ start: startDate, end: today });
  const solveCounts = last365Days.reduce((acc, day) => {
    const count = problems.filter(p => isSameDay(new Date(p.dateSolved), day)).length;
    acc[format(day, 'yyyy-MM-dd')] = count;
    return acc;
  }, {} as Record<string, number>);

  // Create exactly 52 weeks starting from the calculated Sunday
  const allWeeks = eachWeekOfInterval({ start: startSunday, end: endSaturday }, { weekStartsOn: 0 });
  
  // Ensure we have exactly 52-53 weeks max (GitHub shows 53 sometimes)
  const weeks = allWeeks.slice(0, Math.min(53, allWeeks.length));

  // Calculate month labels with better alignment - FIXED
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = '';
  weeks.forEach((weekStart, index) => {
    const weekDate = new Date(weekStart);
    weekDate.setDate(weekDate.getDate() + 3); // Use Wednesday of the week for month calculation
    const monthLabel = format(weekDate, 'MMM');
    
    // Only add label if it's different from the last month
    if (monthLabel !== lastMonth) {
      monthLabels.push({ label: monthLabel, weekIndex: index });
      lastMonth = monthLabel;
    }
  });

  // Create heatmap data (7 rows for days, weeks as columns) - Sunday to Saturday
  const heatmapData: { date: Date; count: number; isInDataRange: boolean }[][] = weeks.map(weekStart => {
    return Array.from({length: 7}, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Check if this day is within our actual data range
      const isInDataRange = day >= startDate && day <= today;
      const count = isInDataRange ? (solveCounts[dateStr] || 0) : 0;
      
      return { date: day, count, isInDataRange };
    });
  });

  // Update color scheme to match LeetCode better
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-300 dark:bg-green-800';
    if (count === 3) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  // Stats: use the actual data range, not the padded weeks
  const pastYearSolves = problems.filter(p => new Date(p.dateSolved) >= startDate && new Date(p.dateSolved) <= today).length;
  const activeDays = Object.values(solveCounts).filter(c => c > 0).length;
  const totalDays = differenceInDays(today, startDate) + 1;
  const activePercentage = Math.round((activeDays / totalDays) * 100);


  return (
    <div className="space-y-8">
      

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Let’s go for 4 problems</CardTitle>
            <Target className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{solvesToday} / 4</div>
              <div className="text-sm text-muted-foreground">Solved Today</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {remainingToday === 0 ? 'Today’s goal completed 🎉' : `${remainingToday} more to complete today’s task`}
              </span>
              {streakAtRisk && <Badge variant="destructive">Streak at risk</Badge>}
            </div>
            <Progress value={dailyProgress} indicatorClassName={getProgressColor(dailyProgress)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XP & Level</CardTitle>
            <Flame className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">Level {level}</div>
              <div className="text-sm text-muted-foreground">{totalXp} XP</div>
            </div>
            <div className="text-sm text-muted-foreground">{xpToNext} XP to next level</div>
            <Progress value={xpIntoLevel} indicatorClassName={getProgressColor(xpIntoLevel)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solve Streaks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{currentStreak}</div>
                  <div className="text-sm">Streak</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Longest: {longestStreak} days
          </div>
          
          {/* LeetCode-style heatmap */}
          <div className="w-full">
            {/* Month labels */}
            <div className="relative mb-6 ml-12 h-4">
              {monthLabels.map((month, i) => (
                <div 
                  key={i} 
                  className="absolute text-xs text-muted-foreground font-medium"
                  style={{ 
                    left: `${(month.weekIndex / weeks.length) * 100}%`,
                    top: '0px'
                  }}
                >
                  {month.label}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex items-start">
              {/* Day labels */}
              <div className="flex flex-col justify-around text-xs text-muted-foreground mr-3 font-medium" style={{ height: '112px' }}>
                <span></span>
                <span>Mon</span>
                <span></span>
                <span>Wed</span>
                <span></span>
                <span>Fri</span>
                <span></span>
              </div>
              
              {/* Calendar grid - Fill all gaps */}
              <div className="flex-1">
                <div className="grid gap-[1px] w-full" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
                  {heatmapData.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[1px]">
                      {week.map((cell, dayIdx) => {
                        // Render all cells consistently to avoid gaps
                        const isOutOfRange = !cell.isInDataRange;
                        
                        return (
                          <div
                            key={dayIdx}
                            className={`aspect-square rounded-[2px] ${
                              isOutOfRange 
                                ? 'bg-gray-100 dark:bg-gray-800' 
                                : getColor(cell.count)
                            } hover:ring-1 hover:ring-gray-400 transition-all cursor-default`}
                            title={
                              isOutOfRange 
                                ? `${format(cell.date, 'MMM d, yyyy')}: Out of range`
                                : `${format(cell.date, 'MMM d, yyyy')}: ${cell.count} ${cell.count === 1 ? 'problem' : 'problems'}`
                            }
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center gap-[1px]">
                <div className="w-[12px] h-[12px] rounded-[1px] bg-gray-100 dark:bg-gray-800" />
                <div className="w-[12px] h-[12px] rounded-[1px] bg-green-200 dark:bg-green-900" />
                <div className="w-[12px] h-[12px] rounded-[1px] bg-green-300 dark:bg-green-800" />
                <div className="w-[12px] h-[12px] rounded-[1px] bg-green-400 dark:bg-green-700" />
                <div className="w-[12px] h-[12px] rounded-[1px] bg-green-500 dark:bg-green-600" />
              </div>
              <span>More</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-medium">{pastYearSolves} Submissions in the past year</div>
            <div className="text-sm text-muted-foreground">Total Active Days: {activeDays} ({activePercentage}%)</div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            <BookCopy className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProblems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solved This Week</CardTitle>
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeek}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marked for Review</CardTitle>
            <Star className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forReview}</div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
                <Clock className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{dueForReview}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Easy Problems</CardTitle>
                <Trophy className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{problems.filter(p => p.difficulty === 'Easy').length}</div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
