import { useMemo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Droplets, Trash2, Wind } from 'lucide-react';
import type { ResourceEntry } from './types';
import { fmt, getTodayTotals, getWeeklyTrend } from './utils';

interface Props {
  entries: ResourceEntry[];
}

/* Mini sparkline SVG */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 100, h = 36;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#sg-${color})`}
      />
    </svg>
  );
}

/* Animated counter hook */
function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * ease);
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

const CARDS = [
  {
    key: 'electricity' as const,
    label: "Today's Electricity",
    unit: 'kWh',
    icon: Zap,
    color: '#00E5FF',
    glowClass: 'shadow-[0_0_30px_rgba(0,229,255,0.18)]',
    borderClass: 'border-primaryGlow/20',
    iconBg: 'bg-primaryGlow/10',
    iconColor: 'text-primaryGlow',
    badge: 'bg-primaryGlow/10 text-primaryGlow',
  },
  {
    key: 'water' as const,
    label: "Today's Water",
    unit: 'L',
    icon: Droplets,
    color: '#3b82f6',
    glowClass: 'shadow-[0_0_30px_rgba(59,130,246,0.18)]',
    borderClass: 'border-accentBlue/20',
    iconBg: 'bg-accentBlue/10',
    iconColor: 'text-accentBlue',
    badge: 'bg-accentBlue/10 text-accentBlue',
  },
  {
    key: 'waste' as const,
    label: "Today's Waste",
    unit: 'kg',
    icon: Trash2,
    color: '#8B5CF6',
    glowClass: 'shadow-[0_0_30px_rgba(139,92,246,0.18)]',
    borderClass: 'border-accentPurple/20',
    iconBg: 'bg-accentPurple/10',
    iconColor: 'text-accentPurple',
    badge: 'bg-accentPurple/10 text-accentPurple',
  },
  {
    key: 'carbon' as const,
    label: "Today's Carbon",
    unit: 'kg CO₂e',
    icon: Wind,
    color: '#4ADE80',
    glowClass: 'shadow-[0_0_30px_rgba(74,222,128,0.18)]',
    borderClass: 'border-secondaryGlow/20',
    iconBg: 'bg-secondaryGlow/10',
    iconColor: 'text-secondaryGlow',
    badge: 'bg-secondaryGlow/10 text-secondaryGlow',
  },
];

function KPICard({
  card,
  value,
  trend,
  index,
}: {
  card: (typeof CARDS)[0];
  value: number;
  trend: number[];
  index: number;
}) {
  const animated = useCounter(value);
  const prevTotal = trend.slice(0, 6).reduce((a, b) => a + b, 0) / 6 || 1;
  const changePct = ((value - prevTotal) / prevTotal) * 100;
  const isUp = changePct > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative group glass-panel rounded-2xl p-5 overflow-hidden cursor-default ${card.glowClass} hover:${card.glowClass}`}
    >
      {/* Background orb */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.14]"
        style={{ background: card.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`p-2.5 rounded-xl ${card.iconBg} border ${card.borderClass}`}>
          <card.icon className={`w-5 h-5 ${card.iconColor}`} />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isUp ? 'bg-red-500/10 text-red-400' : 'bg-secondaryGlow/10 text-secondaryGlow'
          }`}
        >
          {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(1)}%
        </span>
      </div>

      {/* Value */}
      <div className="relative z-10 mb-1">
        <div className="text-xs text-gray-400 font-medium mb-0.5">{card.label}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-white tracking-tight">
            {fmt(animated, 1)}
          </span>
          <span className="text-xs text-gray-500">{card.unit}</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="relative z-10 mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
        <Sparkline data={trend} color={card.color} />
      </div>

      {/* Bottom label */}
      <p className="text-[10px] text-gray-500 mt-1 relative z-10">vs avg last 6 days</p>
    </motion.div>
  );
}

const ResourceKPICards = ({ entries }: Props) => {
  const totals = useMemo(() => getTodayTotals(entries), [entries]);
  const trends = useMemo(
    () => ({
      electricity: getWeeklyTrend(entries, 'electricity'),
      water: getWeeklyTrend(entries, 'water'),
      waste: getWeeklyTrend(entries, 'waste'),
      carbon: getWeeklyTrend(entries, 'carbon'),
    }),
    [entries],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {CARDS.map((card, i) => (
        <KPICard
          key={card.key}
          card={card}
          value={totals[card.key]}
          trend={trends[card.key]}
          index={i}
        />
      ))}
    </div>
  );
};

export default ResourceKPICards;
