import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Zap, Droplets, Trash2, Wind } from 'lucide-react';
import type { ResourceEntry } from './types';

interface Props { entries: ResourceEntry[]; }

type Tab = 'electricity' | 'water' | 'waste' | 'carbon';

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; color: string; gradId: string; textColor: string }[] = [
  { key: 'electricity', label: 'Energy',   icon: Zap,      color: '#00E5FF', gradId: 'grad-e', textColor: 'text-primaryGlow' },
  { key: 'water',       label: 'Water',    icon: Droplets, color: '#3b82f6', gradId: 'grad-w', textColor: 'text-accentBlue' },
  { key: 'waste',       label: 'Waste',    icon: Trash2,   color: '#8B5CF6', gradId: 'grad-wa', textColor: 'text-accentPurple' },
  { key: 'carbon',      label: 'Carbon',   icon: Wind,     color: '#4ADE80', gradId: 'grad-c', textColor: 'text-secondaryGlow' },
];

const UNIT: Record<Tab, string> = {
  electricity: 'kWh',
  water: 'L',
  waste: 'kg',
  carbon: 'kg CO₂e',
};

function CustomTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3 py-2 text-xs border border-white/10">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-bold">{payload[0].value.toFixed(1)} <span className="text-gray-400 font-normal">{unit}</span></p>
    </div>
  );
}

const ResourceAnalyticsCharts = ({ entries }: Props) => {
  const [tab, setTab] = useState<Tab>('electricity');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const currentTab = TABS.find((t) => t.key === tab)!;

  // Aggregate by date (last 30 days)
  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      days[ds] = 0;
    }
    entries.forEach((e) => {
      if (days[e.date] !== undefined) days[e.date] += e[tab];
    });
    return Object.entries(days).map(([date, value]) => ({
      date: date.slice(5), // MM-DD
      value: parseFloat(value.toFixed(2)),
    }));
  }, [entries, tab]);

  // Top 5 buildings bar data
  const buildingData = useMemo(() => {
    const agg: Record<string, number> = {};
    entries.forEach((e) => { agg[e.building] = (agg[e.building] || 0) + e[tab]; });
    return Object.entries(agg)
      .map(([name, value]) => ({ name: name.split(' ').slice(0, 2).join(' '), value: parseFloat(value.toFixed(1)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [entries, tab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel rounded-2xl p-6 h-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-white font-semibold">Visual Analytics</h3>
          <p className="text-gray-400 text-xs mt-0.5">30-day trend & building breakdown</p>
        </div>

        {/* Chart type toggle */}
        <div className="flex items-center gap-1 bg-[#050816] rounded-xl p-1 border border-white/[0.06]">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${chartType === 'area' ? 'bg-white/[0.06] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Trend
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${chartType === 'bar' ? 'bg-white/[0.06] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Buildings
          </button>
        </div>
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                active
                  ? `bg-white/[0.07] border border-white/10 ${t.textColor}`
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
              style={active ? { boxShadow: `0 0 14px ${t.color}25` } : {}}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id={currentTab.gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentTab.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={currentTab.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.15)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip unit={UNIT[tab]} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={currentTab.color}
                strokeWidth={2.5}
                fill={`url(#${currentTab.gradId})`}
                dot={false}
                activeDot={{ r: 5, fill: currentTab.color, stroke: '#050816', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={buildingData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.15)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip unit={UNIT[tab]} />} />
              <Bar
                dataKey="value"
                fill={currentTab.color}
                fillOpacity={0.7}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="text-center text-xs text-gray-600 mt-3">
        {chartType === 'area' ? 'Daily totals — last 30 days' : 'Total by building'}
      </p>
    </motion.div>
  );
};

export default ResourceAnalyticsCharts;
