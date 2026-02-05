import { memo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useTheme } from '@/components/theme-provider';
import ClientOnly from '../client-only';

interface DifficultyChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

const DifficultyChart = memo(({ data }: DifficultyChartProps) => {
  const { theme } = useTheme();

  return (
    <ClientOnly>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#030712' : '#fff',
              borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
            }}
            formatter={(value) => [`${value} problems`, 'Problems Solved']}
          />
        </PieChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
});

DifficultyChart.displayName = 'DifficultyChart';

export default DifficultyChart;