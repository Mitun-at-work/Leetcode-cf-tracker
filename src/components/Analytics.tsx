import type { Problem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTheme } from '@/components/theme-provider';
import { format, subDays } from 'date-fns';
import ClientOnly from './client-only';

interface AnalyticsProps {
  problems: Problem[];
}

const Analytics = ({ problems }: AnalyticsProps) => {
  const { theme } = useTheme();

  const leetcodeProblems = problems.filter((p) => p.platform === 'leetcode');
  const codeforcesProblems = problems.filter((p) => p.platform === 'codeforces');
  const atcoderProblems = problems.filter((p) => p.platform === 'atcoder');
  const algozenithProblems = problems.filter((p) => p.platform === 'algozenith');
  const csesProblems = problems.filter((p) => p.platform === 'cses');

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
    { name: 'Easy', value: problems.filter((p) => getDifficultyBucket(p) === 'Easy').length, color: 'hsl(var(--success))' },
    { name: 'Medium', value: problems.filter((p) => getDifficultyBucket(p) === 'Medium').length, color: 'hsl(var(--warning))' },
    { name: 'Hard', value: problems.filter((p) => getDifficultyBucket(p) === 'Hard').length, color: 'hsl(var(--destructive))' },
  ];

  const platformData = [
    { name: 'LeetCode', value: leetcodeProblems.length, color: '#2563eb' }, // blue-600
    { name: 'Codeforces', value: codeforcesProblems.length, color: '#f97316' }, // orange-500
    { name: 'AtCoder', value: atcoderProblems.length, color: '#22c55e' }, // green-500
    { name: 'AlgoZenith', value: algozenithProblems.length, color: '#a855f7' }, // purple-500
    { name: 'CSES', value: csesProblems.length, color: '#ef4444' }, // red-500
  ];

  const totalSolved = problems.length;
  const totalDifficultySolved = difficultyData.reduce((sum, entry) => sum + entry.value, 0);

  const platformChartData = totalSolved > 0
    ? platformData
    : [{ name: 'No data', value: 1, color: '#e5e7eb' }];

  const difficultyChartData = totalDifficultySolved > 0
    ? difficultyData
    : [{ name: 'No data', value: 1, color: '#e5e7eb' }];

  const getCodeforcesDifficulty = (rating: number) => {
    if (rating < 1200) return { name: 'Newbie', color: '#808080' }; // Grey
    if (rating < 1400) return { name: 'Pupil', color: '#008000' }; // Green
    if (rating < 1600) return { name: 'Specialist', color: '#00FFFF' }; // Cyan
    if (rating < 1900) return { name: 'Expert', color: '#0000FF' }; // Blue
    if (rating < 2100) return { name: 'Candidate Master', color: '#FF00FF' }; // Magenta
    return { name: 'Master+', color: '#FF0000' }; // Red
  };


  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
  const submissionData = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date: format(date, 'MMM d'),
      count: problems.filter(p => format(new Date(p.dateSolved), 'yyyy-MM-dd') === dateStr).length,
    }
  });

  const topicsData = Object.entries(
    problems.reduce((acc, p) => {
      if (p.topics && Array.isArray(p.topics)) {
        p.topics.forEach(topic => {
          acc[topic] = (acc[topic] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));


  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Problems by Topic</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Submissions in the Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={submissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke={theme === 'dark' ? '#fff' : '#000'} />
                  <YAxis allowDecimals={false} stroke={theme === 'dark' ? '#fff' : '#000'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#030712' : '#fff',
                      borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
                    }}
                  />
                  <Bar dataKey="count" fill="#d1d5db" />
                </BarChart>
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
};

export default Analytics;
