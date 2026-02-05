import { memo, useCallback } from 'react';
import { format } from 'date-fns';

interface HeatmapChartProps {
  heatmap: Array<Array<{ date: Date; count: number; isInDataRange: boolean }>>;
  monthLabels: Array<{ label: string; weekIndex: number }>;
  weeks: Date[];
  getHeatmapColor: (count: number) => string;
}

const HeatmapChart = memo(({
  heatmap,
  monthLabels,
  weeks,
  getHeatmapColor
}: HeatmapChartProps) => {
  const getTooltipContent = useCallback((day: { date: Date; count: number; isInDataRange: boolean }) => {
    if (!day.isInDataRange) return null;
    return `${format(day.date, 'MMM dd, yyyy')}: ${day.count} problems`;
  }, []);

  return (
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

        {/* Heatmap cells */}
        <div className="flex-1 overflow-x-auto">
          <div className="inline-flex flex-col gap-1">
            {heatmap.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-700 ${
                      day.isInDataRange ? getHeatmapColor(day.count) : 'bg-gray-50 dark:bg-gray-900'
                    }`}
                    title={getTooltipContent(day) || undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex mx-2 gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
          <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
});

HeatmapChart.displayName = 'HeatmapChart';

export default HeatmapChart;