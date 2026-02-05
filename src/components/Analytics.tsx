import { useState, useMemo, useCallback, memo, Suspense } from 'react';
import type { Problem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, eachDayOfInterval, eachWeekOfInterval, startOfYear, endOfYear } from 'date-fns';
import { PlatformChart, DifficultyChart, ActivityChart } from './charts';

interface AnalyticsProps {
  problems: Problem[];
}

const Analytics = memo(({ problems }: AnalyticsProps) => {
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'alltime' | 'year'>('alltime');

  // Separate year state for weekly activity chart
  const [weeklyActivityYear, setWeeklyActivityYear] = useState<string>(currentYear.toString());

  // Get available years from problems
  const availableYears = useMemo(() => {
    const years = new Set(problems.map(p => new Date(p.dateSolved).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [problems]);

  const months = [
    { value: 'all', label: 'All Months' },
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

  // Filter problems based on selected year and month
  const filteredProblems = useMemo(() => {
        if (timeFilter === 'alltime') {
          return problems;
        }

    return problems.filter(p => {
      const problemDate = new Date(p.dateSolved);
      const problemYear = problemDate.getFullYear();
      const problemMonth = problemDate.getMonth();

      if (problemYear !== parseInt(selectedYear)) return false;
      if (selectedMonth !== 'all' && problemMonth !== parseInt(selectedMonth)) return false;

      return true;
    });
  }, [problems, selectedYear, selectedMonth, timeFilter]);

  const getDifficultyBucket = useCallback((problem: Problem): 'Easy' | 'Medium' | 'Hard' | null => {
    if (problem.difficulty === 'Easy' || problem.difficulty === 'Medium' || problem.difficulty === 'Hard') {
      return problem.difficulty;
    }

    const numericDifficulty = Number(problem.difficulty);
    if (!Number.isNaN(numericDifficulty)) {
      if (numericDifficulty < 1200) return 'Easy';
      if (numericDifficulty < 1600) return 'Medium';
      return 'Hard';
    }

    return null;
  }, []);

  const { platformCounts, difficultyCounts, totalSolved } = useMemo(() => {
    const counts = {
      platform: {
        leetcode: 0,
        codeforces: 0,
        atcoder: 0,
        algozenith: 0,
        cses: 0,
        hackerrank: 0,
      },
      difficulty: { Easy: 0, Medium: 0, Hard: 0 },
    };

    filteredProblems.forEach((problem) => {
      if (problem.platform in counts.platform) {
        counts.platform[problem.platform as keyof typeof counts.platform] += 1;
      }

      const bucket = getDifficultyBucket(problem);
      if (bucket) {
        counts.difficulty[bucket] += 1;
      }
    });

    return {
      platformCounts: counts.platform,
      difficultyCounts: counts.difficulty,
      totalSolved: filteredProblems.length,
    };
  }, [filteredProblems, getDifficultyBucket]);

  const difficultyData = [
    { name: 'Easy', value: difficultyCounts.Easy, color: 'hsl(var(--success))' },
    { name: 'Medium', value: difficultyCounts.Medium, color: 'hsl(var(--warning))' },
    { name: 'Hard', value: difficultyCounts.Hard, color: 'hsl(var(--destructive))' },
  ];

  const platformData = [
    { name: 'LeetCode', value: platformCounts.leetcode, color: '#2563eb' }, // blue-600
    { name: 'Codeforces', value: platformCounts.codeforces, color: '#f97316' }, // orange-500
    { name: 'AtCoder', value: platformCounts.atcoder, color: '#22c55e' }, // green-500
    { name: 'AlgoZenith', value: platformCounts.algozenith, color: '#a855f7' }, // purple-500
    { name: 'CSES', value: platformCounts.cses, color: '#ef4444' }, // red-500
    { name: 'HackerRank', value: platformCounts.hackerrank, color: '#10b981' }, // emerald-500
  ];

  const totalDifficultySolved = difficultyData.reduce((sum, entry) => sum + entry.value, 0);

  const platformChartData = totalSolved > 0
    ? platformData
    : [{ name: 'No data', value: 1, color: '#e5e7eb' }];

  const difficultyChartData = totalDifficultySolved > 0
    ? difficultyData
    : [{ name: 'No data', value: 1, color: '#e5e7eb' }];

  const topicsData = useMemo(() => {
    return Object.entries(
      filteredProblems.reduce((acc, p) => {
        if (p.topics && Array.isArray(p.topics)) {
          p.topics.forEach(topic => {
            acc[topic] = (acc[topic] || 0) + 1;
          });
        }
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [filteredProblems]);

  // Monthly activity data for bar chart
  const monthlyActivityData = useMemo(() => {
    if (problems.length === 0) return [];

    // Always use the selected year for weekly activity (independent of main filters)
    // Filter problems for the selected year only
    const yearProblems = problems.filter(p => {
      const problemYear = new Date(p.dateSolved).getFullYear();
      return problemYear === parseInt(weeklyActivityYear);
    });

    // Group by month instead of week for better readability
    const monthlyData: Record<string, number> = {};
    
    yearProblems.forEach(problem => {
      const monthKey = format(new Date(problem.dateSolved), 'yyyy-MM');
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    // Create monthly data points for the entire year
    const months = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(parseInt(weeklyActivityYear), month, 1);
      const monthKey = format(date, 'yyyy-MM');
      months.push({
        month: format(date, 'MMM'),
        fullMonth: monthKey,
        problems: monthlyData[monthKey] || 0
      });
    }

    return months; // Remove the filter to show all weeks, even those with 0 activity
  }, [problems, weeklyActivityYear]);

  // Heatmap data processing
  const getHeatmapColor = useCallback((count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-300 dark:bg-green-800';
    if (count === 3) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  }, []);

  return (
    <div className="space-y-8">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as 'alltime' | 'year')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alltime">All Time</SelectItem>
                  <SelectItem value="year">By Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeFilter === 'year' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32">
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
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-40">
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
              </>
            )}

            <div className="flex flex-col gap-2 ml-auto">
              <label className="text-sm font-medium">Filtered Problems</label>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {totalSolved} problems
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Easy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{difficultyData[0].value}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{difficultyData[1].value}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{difficultyData[2].value}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problems by Topic (Top 15)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topicsData.map((topic, index) => {
              const percentage = totalSolved > 0 ? ((topic.value / totalSolved) * 100).toFixed(1) : '0';
              
              return (
                <div 
                  key={topic.name} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs font-semibold">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{topic.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-primary">{topic.value}</span>
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          {topicsData.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No topics data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Activity */}
      {problems.some(p => new Date(p.dateSolved).getFullYear() === parseInt(weeklyActivityYear)) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Activity - {weeklyActivityYear}</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Year:</label>
                <Select value={weeklyActivityYear} onValueChange={setWeeklyActivityYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex items-center justify-center h-64">Loading chart...</div>}>
              <ActivityChart data={monthlyActivityData} year={weeklyActivityYear} />
            </Suspense>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex items-center justify-center h-64">Loading chart...</div>}>
              <PlatformChart data={platformChartData} total={totalSolved} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex items-center justify-center h-64">Loading chart...</div>}>
              <DifficultyChart data={difficultyChartData} />
            </Suspense>
          </CardContent>
        </Card>

      </div>

      {problems.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-500">Start adding problems to see your analytics!</p>
        </div>
      )}
    </div>
  );
});

Analytics.displayName = 'Analytics';

export default memo(Analytics);
