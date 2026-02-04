import { useState, useMemo, useCallback, memo } from 'react';
import type { Problem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTheme } from '@/components/theme-provider';
import ClientOnly from './client-only';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookCopy, CalendarDays, Star, Clock } from 'lucide-react';

interface AnalyticsProps {
  problems: Problem[];
}

const Analytics = memo(({ problems }: AnalyticsProps) => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'alltime' | 'year'>('alltime');

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={theme === 'dark' ? '#fff' : '#000'}
                    style={{ fontSize: '20px', fontWeight: 600 }}
                  >
                    {totalSolved}
                  </text>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  {totalSolved > 0 && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={theme === 'dark' ? '#fff' : '#000'}
                    style={{ fontSize: '20px', fontWeight: 600 }}
                  >
                    {totalDifficultySolved}
                  </text>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  {totalDifficultySolved > 0 && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
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
