import { memo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
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
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
});

DifficultyChart.displayName = 'DifficultyChart';

export default DifficultyChart;