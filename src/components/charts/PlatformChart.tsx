import { memo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useTheme } from '@/components/theme-provider';
import ClientOnly from '../client-only';

interface PlatformChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}

const PlatformChart = memo(({ data, total }: PlatformChartProps) => {
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
            label={false}
            outerRadius={80}
            innerRadius={60}
            paddingAngle={5}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
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
            {total}
          </text>
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

PlatformChart.displayName = 'PlatformChart';

export default PlatformChart;