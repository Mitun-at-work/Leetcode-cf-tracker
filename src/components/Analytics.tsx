import { useState, useMemo, memo } from 'react';
import type { Problem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { useTheme } from '@/components/theme-provider';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfYear, endOfYear } from 'date-fns';
import ClientOnly from './client-only';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface AnalyticsProps {
  problems: Problem[];
}

const Analytics = memo(({ problems }: AnalyticsProps) => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'7days' | 'month' | 'year'>('7days');

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
    return problems.filter(p => {
      const problemDate = new Date(p.dateSolved);
      const problemYear = problemDate.getFullYear();
      const problemMonth = problemDate.getMonth();

      if (problemYear !== parseInt(selectedYear)) return false;
      if (selectedMonth !== 'all' && problemMonth !== parseInt(selectedMonth)) return false;

      return true;
    });
  }, [problems, selectedYear, selectedMonth]);

  const leetcodeProblems = filteredProblems.filter((p) => p.platform === 'leetcode');
  const codeforcesProblems = filteredProblems.filter((p) => p.platform === 'codeforces');
  const atcoderProblems = filteredProblems.filter((p) => p.platform === 'atcoder');
  const algozenithProblems = filteredProblems.filter((p) => p.platform === 'algozenith');
  const csesProblems = filteredProblems.filter((p) => p.platform === 'cses');

  const getDifficultyBucket = (problem: Problem): 'Easy' | 'Medium' | 'Hard' | null => {
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
  };

  const difficultyData = [
    { name: 'Easy', value: filteredProblems.filter((p) => getDifficultyBucket(p) === 'Easy').length, color: 'hsl(var(--success))' },
    { name: 'Medium', value: filteredProblems.filter((p) => getDifficultyBucket(p) === 'Medium').length, color: 'hsl(var(--warning))' },
    { name: 'Hard', value: filteredProblems.filter((p) => getDifficultyBucket(p) === 'Hard').length, color: 'hsl(var(--destructive))' },
  ];

  const platformData = [
    { name: 'LeetCode', value: leetcodeProblems.length, color: '#2563eb' }, // blue-600
    { name: 'Codeforces', value: codeforcesProblems.length, color: '#f97316' }, // orange-500
    { name: 'AtCoder', value: atcoderProblems.length, color: '#22c55e' }, // green-500
    { name: 'AlgoZenith', value: algozenithProblems.length, color: '#a855f7' }, // purple-500
    { name: 'CSES', value: csesProblems.length, color: '#ef4444' }, // red-500
  ];

  const totalSolved = filteredProblems.length;
  const totalDifficultySolved = difficultyData.reduce((sum, entry) => sum + entry.value, 0);

  const platformChartData = totalSolved > 0
    ? platformData
    : [{ name: 'No data', value: 1, color: '#e5e7eb' }];

  const difficultyChartData = totalDifficultySolved > 0
    ? difficultyData
    : [{ name: 'No data', value: 1, color: '#e5e7eb' }];

  // Submission data based on view
  const submissionData = useMemo(() => {
    if (selectedView === '7days') {
      const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
      return last7Days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
          date: format(date, 'MMM d'),
          count: problems.filter(p => format(new Date(p.dateSolved), 'yyyy-MM-dd') === dateStr).length,
        };
      });
    } else if (selectedView === 'month') {
      const year = parseInt(selectedYear);
      const month = selectedMonth === 'all' ? new Date().getMonth() : parseInt(selectedMonth);
      const start = startOfMonth(new Date(year, month));
      const end = endOfMonth(new Date(year, month));
      const days = eachDayOfInterval({ start, end });
      
      return days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
          date: format(date, 'MMM d'),
          count: filteredProblems.filter(p => format(new Date(p.dateSolved), 'yyyy-MM-dd') === dateStr).length,
        };
      });
    } else {
      // Year view - group by month
      const year = parseInt(selectedYear);
      return months.slice(1).map((month, index) => {
        const monthProblems = filteredProblems.filter(p => {
          const problemDate = new Date(p.dateSolved);
          return problemDate.getFullYear() === year && problemDate.getMonth() === index;
        });
        return {
          date: month.label.substring(0, 3),
          count: monthProblems.length,
        };
      });
    }
  }, [selectedView, selectedYear, selectedMonth, problems, filteredProblems]);

  const topicsData = Object.entries(
    filteredProblems.reduce((acc, p) => {
      if (p.topics && Array.isArray(p.topics)) {
        p.topics.forEach(topic => {
          acc[topic] = (acc[topic] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 15);


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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Timeline View</label>
              <Select value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Problems by Topic (Top 15)</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={topicsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" stroke={theme === 'dark' ? '#fff' : '#000'} />
                  <YAxis type="category" dataKey="name" stroke={theme === 'dark' ? '#fff' : '#000'} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  <Bar dataKey="value" fill="#d1d5db" />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedView === '7days' && 'Submissions in the Last 7 Days'}
              {selectedView === 'month' && `Submissions - ${months.find(m => m.value === selectedMonth)?.label || 'Current Month'}`}
              {selectedView === 'year' && `Submissions by Month - ${selectedYear}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={submissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme === 'dark' ? '#fff' : '#000'}
                    angle={selectedView === 'month' ? -45 : 0}
                    textAnchor={selectedView === 'month' ? 'end' : 'middle'}
                    height={selectedView === 'month' ? 80 : 30}
                  />
                  <YAxis allowDecimals={false} stroke={theme === 'dark' ? '#fff' : '#000'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ClientOnly>
          </CardContent>
        </Card>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.filter(p => p.value > 0).map((platform) => (
                <div key={platform.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{platform.name}</span>
                    <span className="text-sm font-bold">{platform.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${totalSolved > 0 ? (platform.value / totalSolved) * 100 : 0}%`,
                        backgroundColor: platform.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
