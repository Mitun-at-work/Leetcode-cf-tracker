import { useState, useMemo, memo, useCallback } from 'react';
import type { Problem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookCopy, CalendarDays, Star, Clock, Flame, Target } from 'lucide-react';
import { isToday, isPast } from 'date-fns';
import { format, isSameDay, subDays, eachDayOfInterval, differenceInDays, eachWeekOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface DashboardProps {
  problems: Problem[];
}

const Dashboard = memo(({ problems }: DashboardProps) => {
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Get available years from problems
  const availableYears = useMemo(() => {
    const years = new Set(problems.map(p => new Date(p.dateSolved).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [problems]);

  const months = [
    { value: 'all', label: 'All Year' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ];
  const totalProblems = useMemo(() => problems.length, [problems.length]);
  const thisWeek = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return problems.filter((p) => new Date(p.dateSolved) >= weekAgo).length;
  }, [problems]);
  const forReview = useMemo(() => problems.filter((p) => p.isReview).length, [problems]);
  const dueForReview = useMemo(() => problems.filter(p => 
    p.isReview && 
    p.nextReviewDate && 
    (isToday(new Date(p.nextReviewDate)) || isPast(new Date(p.nextReviewDate)))
  ).length, [problems]);

  const dailyGoal = 4;
  const solvesToday = useMemo(() => problems.filter(p => isToday(new Date(p.dateSolved))).length, [problems]);
  const dailyProgress = useMemo(() => Math.min(100, Math.round((solvesToday / dailyGoal) * 100)), [solvesToday]);
  const remainingToday = useMemo(() => Math.max(0, dailyGoal - solvesToday), [solvesToday]);
  const streakAtRisk = useMemo(() => solvesToday === 0, [solvesToday]);

  const getXpForProblem = useCallback((problem: Problem) => {
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
  }, []);

  const totalXp = useMemo(() => problems.reduce((sum, p) => sum + getXpForProblem(p), 0), [problems, getXpForProblem]);
  const level = useMemo(() => Math.floor(totalXp / 100) + 1, [totalXp]);
  const xpIntoLevel = useMemo(() => totalXp % 100, [totalXp]);
  const xpToNext = useMemo(() => 100 - xpIntoLevel, [xpIntoLevel]);


  const getLevelName = useCallback((xp: number) => {
    const tier = Math.floor(xp / 3000);
    switch (tier) {
      case 0:
        return 'Novice';
      case 1:
        return 'Rookie';
      case 2:
        return 'Adept';
      case 3:
        return 'Specialist';
      case 4:
        return 'Expert';
      case 5:
        return 'Elite';
      case 6:
        return 'Veteran';
      case 7:
        return 'Champion';
      default:
        return 'Legend';
    }
  }, []);

  const currentLevelName = getLevelName(totalXp);
  const getLevelColor = useCallback((xp: number) => {
    const tier = Math.floor(xp / 3000);
    switch (tier) {
      case 0:
        return 'text-gray-500';
      case 1:
        return 'text-green-500';
      case 2:
        return 'text-cyan-500';
      case 3:
        return 'text-violet-500';
      case 4:
        return 'text-orange-500';
      case 5:
        return 'text-yellow-500';
      case 6:
        return 'text-pink-500';
      case 7:
        return 'text-amber-800';
      default:
        return 'text-red-500';
    }
  }, []);

  const getProgressColor = useCallback((value: number) => {
    if (value <= 25) return 'bg-red-500';
    if (value <= 50) return 'bg-yellow-500';
    if (value <= 75) return 'bg-orange-500';
    if (value >= 100) return 'bg-green-500';
    return 'bg-purple-500';
  }, []);

  const calculateStreaks = useCallback((problems: Problem[]) => {
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
  }, []);

  const { currentStreak, longestStreak } = useMemo(() => calculateStreaks(problems), [calculateStreaks, problems]);

  // For calendar: calculate date range based on selected year and month
  const { startDate, endDate } = useMemo(() => {
    const year = parseInt(selectedYear);
    
    if (selectedMonth === 'all') {
      // Show entire year
      return {
        startDate: startOfYear(new Date(year, 0, 1)),
        endDate: endOfYear(new Date(year, 11, 31))
      };
    } else {
      // Show specific month
      const month = parseInt(selectedMonth);
      return {
        startDate: startOfMonth(new Date(year, month, 1)),
        endDate: endOfMonth(new Date(year, month, 1))
      };
    }
  }, [selectedYear, selectedMonth]);
  
  // Find the Sunday of the week containing the start date
  const startSunday = new Date(startDate);
  const startDayOfWeek = startDate.getDay();
  startSunday.setDate(startDate.getDate() - startDayOfWeek);
  
  // Find the Saturday of the week containing the end date
  const endSaturday = new Date(endDate);
  const endDayOfWeek = endDate.getDay();
  endSaturday.setDate(endDate.getDate() + (6 - endDayOfWeek));
  
  // Generate solve counts for the selected date range
  const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
  const solveCounts = daysInRange.reduce((acc, day) => {
    const count = problems.filter(p => isSameDay(new Date(p.dateSolved), day)).length;
    acc[format(day, 'yyyy-MM-dd')] = count;
    return acc;
  }, {} as Record<string, number>);

  // Create weeks starting from the calculated Sunday
  const allWeeks = eachWeekOfInterval({ start: startSunday, end: endSaturday }, { weekStartsOn: 0 });
  const weeks = allWeeks;

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
      const isInDataRange = day >= startDate && day <= endDate;
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

  // Stats: use the actual data range
  const pastYearSolves = problems.filter(p => {
    const solveDate = new Date(p.dateSolved);
    return solveDate >= startDate && solveDate <= endDate;
  }).length;
  const activeDays = (Object.values(solveCounts) as number[]).filter(c => c > 0).length;
  const totalDays = differenceInDays(endDate, startDate) + 1;
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
              <div className={`text-2xl font-bold ${getLevelColor(totalXp)}`}>Level {level}</div>
              <div className="text-sm text-muted-foreground">{totalXp} XP</div>
            </div>
            <div className="text-sm text-muted-foreground">{currentLevelName} • {xpToNext} XP to next level</div>
            <Progress value={xpIntoLevel} indicatorClassName={getProgressColor(xpIntoLevel)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Solve Streaks</CardTitle>
            <div className="flex gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.length > 0 ? (
                    availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={currentYear.toString()}>
                      {currentYear}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
              <div className="flex-1 overflow-x-auto">
                <div 
                  className="grid gap-[1px]" 
                  style={{ 
                    gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                    maxWidth: selectedMonth === 'all' ? '100%' : `${weeks.length * 16}px`,
                    margin: selectedMonth === 'all' ? '0' : '0 auto'
                  }}
                >
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
                            style={selectedMonth !== 'all' ? { width: '14px', height: '14px' } : {}}
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
            <div className="text-lg font-medium">{pastYearSolves} Submissions in {selectedMonth === 'all' ? selectedYear : months.find(m => m.value === selectedMonth)?.label + ' ' + selectedYear}</div>
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
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default memo(Dashboard);
