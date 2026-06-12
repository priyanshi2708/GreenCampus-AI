import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { ResourceType } from './types';

interface ChartPoint {
  label: string;
  actual: number | null;
  predicted: number | null;
}

interface Props {
  historical: Record<ResourceType, number[]>;
  predicted: Record<ResourceType, number[]>;
}

type FilterType = 'day' | 'week' | 'month' | 'year';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const RESOURCE_TYPES: { key: ResourceType; label: string; color: string; unit: string }[] = [
  { key: 'electricity', label: 'Electricity', color: '#00E5FF', unit: 'kWh' },
  { key: 'water',       label: 'Water',       color: '#3b82f6', unit: 'L' },
  { key: 'waste',       label: 'Waste',       color: '#8B5CF6', unit: 'kg' },
  { key: 'carbon',      label: 'Carbon',      color: '#4ADE80', unit: 'kg' },
];

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3 py-2.5 text-xs border border-white/10 space-y-1">
      <p className="text-gray-400 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2 font-bold" style={{ color: p.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: {p.value.toFixed(1)} <span className="text-gray-500 font-normal">{unit}</span>
        </p>
      ))}
    </div>
  );
}

const ForecastChart = ({ historical, predicted }: Props) => {
  const [activeType, setActiveType] = useState<ResourceType>('electricity');
  const [activeFilter, setActiveFilter] = useState<FilterType>('month');

  const currentResource = RESOURCE_TYPES.find((r) => r.key === activeType)!;

  const chartData = useMemo(() => {
    const data: ChartPoint[] = [];
    const histArr = historical[activeType];
    const predArr = predicted[activeType];

    let steps = 12;
    let labelGen = (i: number, isFuture: boolean) => {
      if (isFuture) return `Pred ${i + 1}`;
      return `Pt ${i + 1}`;
    };

    if (activeFilter === 'day') {
      steps = 24;
      labelGen = (i: number, isFuture: boolean) => {
        const hour = i % 24;
        return `${String(hour).padStart(2, '0')}:00${isFuture ? ' (F)' : ''}`;
      };
    } else if (activeFilter === 'week') {
      steps = 7;
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      labelGen = (i: number, isFuture: boolean) => `${days[i % 7]}${isFuture ? ' (F)' : ''}`;
    } else if (activeFilter === 'month') {
      steps = 30;
      labelGen = (i: number, isFuture: boolean) => `Day ${i + 1}${isFuture ? ' (F)' : ''}`;
    } else if (activeFilter === 'year') {
      steps = 12;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      labelGen = (i: number, isFuture: boolean) => `${months[i % 12]}${isFuture ? ' (F)' : ''}`;
    }

    // Historical Points
    for (let i = 0; i < steps; i++) {
      // Pick or simulate historical values
      const val = histArr[i % histArr.length] ?? (100 + i * 5);
      data.push({
        label: labelGen(i, false),
        actual: parseFloat(val.toFixed(1)),
        predicted: null,
      });
    }

    // Connect last actual point to predictions
    const lastActual = data[data.length - 1].actual;

    // Predicted future points
    for (let i = 0; i < Math.ceil(steps / 2); i++) {
      const baseVal = predArr[i % predArr.length] ?? (histArr[histArr.length - 1] ?? 100);
      const val = baseVal * (1 + (i * 0.02 - 0.01)); // add some variance
      data.push({
        label: labelGen(i, true),
        actual: i === 0 ? lastActual : null, // smooth connection
        predicted: parseFloat(val.toFixed(1)),
      });
    }

    return data;
  }, [historical, predicted, activeType, activeFilter]);

  // Find index where prediction starts to add visual divider
  const predictionStartIndex = chartData.findIndex((d) => d.predicted !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-between"
    >
      <div>
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-white font-semibold">AI Forecast Chart</h3>
            <p className="text-gray-400 text-xs mt-0.5">Historical actuals vs machine learning projection</p>
          </div>

          {/* Time granularity filter */}
          <div className="flex items-center gap-1 bg-[#050816] rounded-xl p-1 border border-white/[0.06] self-start sm:self-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f.key ? 'bg-white/[0.06] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Selector pills */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {RESOURCE_TYPES.map((t) => {
            const active = t.key === activeType;
            return (
              <button
                key={t.key}
                onClick={() => setActiveType(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  active
                    ? 'bg-white/[0.07] border-white/10'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white'
                }`}
                style={active ? { color: t.color, boxShadow: `0 0 14px ${t.color}20` } : {}}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-[280px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              {/* Filter glow */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="rgba(255,255,255,0.15)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={activeFilter === 'month' ? 4 : 1}
            />
            <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip unit={currentResource.unit} />} />

            {/* Actual (Historical) Data */}
            <Area
              type="monotone"
              name="Actual Data"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorActual)"
              dot={false}
              activeDot={{ r: 5, fill: '#3b82f6' }}
            />

            {/* Predicted (Future) Data */}
            <Area
              type="monotone"
              name="Predicted Data"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="url(#colorPredicted)"
              dot={false}
              activeDot={{ r: 5, fill: '#8b5cf6' }}
              style={{ filter: 'url(#glow)' }}
            />

            {/* Vertical Divider Line */}
            {predictionStartIndex !== -1 && (
              <ReferenceLine
                x={chartData[predictionStartIndex].label}
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="4 4"
                label={{
                  value: 'Forecast Start',
                  fill: 'rgba(255,255,255,0.4)',
                  fontSize: 9,
                  position: 'insideTopRight',
                  offset: 10,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-1 bg-[#3b82f6] rounded-full" />
          <span>Actual Consumption (Blue)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-1 bg-[#8b5cf6] rounded-full" />
          <span>AI Projected Trend (Purple)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ForecastChart;
