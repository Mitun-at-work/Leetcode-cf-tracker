import { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from '@/components/theme-provider';
import ClientOnly from '../client-only';

interface ActivityChartProps {
  data: Array<{ month: string; fullMonth: string; problems: number }>;
  year: string;
}

const ActivityChart = memo(({ data, year }: ActivityChartProps) => {
  const { theme } = useTheme();

  return (
    <ClientOnly>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
          />
          <XAxis
            dataKey="month"
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <YAxis
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#030712' : '#fff',
              borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
            }}
            labelFormatter={(label) => `${label} ${year}`}
            formatter={(value) => [`${value} problems`, 'Problems Solved']}
          />
          <Bar dataKey="problems" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
});

ActivityChart.displayName = 'ActivityChart';

export default ActivityChart;