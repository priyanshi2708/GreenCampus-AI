import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ResourceEntry } from './types';
import { fmt } from './utils';

interface Props { entries: ResourceEntry[]; }

/** Thresholds are per-entry averages — tune as needed */
const BENCHMARKS = {
  electricity: 400, // kWh per entry
  water: 2000,      // Liters
  waste: 80,        // kg
  carbon: 100,      // kg CO2e
};

function scoreMetric(avg: number, benchmark: number): number {
  if (avg <= 0) return 100;
  const ratio = avg / benchmark;
  return Math.max(0, Math.min(100, 100 - (ratio - 1) * 60));
}

function getRating(score: number): {
  label: string;
  color: string;
  glowColor: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
} {
  if (score >= 80) return { label: 'Excellent', color: '#4ADE80', glowColor: 'rgba(74,222,128,0.4)', bgColor: 'bg-secondaryGlow/10', borderColor: 'border-secondaryGlow/30', emoji: '🌿' };
  if (score >= 60) return { label: 'Good',      color: '#00E5FF', glowColor: 'rgba(0,229,255,0.4)',  bgColor: 'bg-primaryGlow/10',  borderColor: 'border-primaryGlow/30',  emoji: '✅' };
  if (score >= 40) return { label: 'Average',   color: '#f59e0b', glowColor: 'rgba(245,158,11,0.4)', bgColor: 'bg-amber-500/10',    borderColor: 'border-amber-500/30',    emoji: '⚠️' };
  return               { label: 'Needs Attention', color: '#ef4444', glowColor: 'rgba(239,68,68,0.4)', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', emoji: '🔴' };
}

/** SVG progress ring */
function ProgressRing({ score, color, glow }: { score: number; color: string; glow: string }) {
  const R = 62, STROKE = 9;
  const circ = 2 * Math.PI * R;
  const progress = (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20"
        style={{ background: color }}
      />
      <svg width="160" height="160" className="rotate-[-90deg]">
        {/* Track */}
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
        {/* Progress */}
        <circle
          cx="80"
          cy="80"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circ}`}
          style={{ filter: `drop-shadow(0 0 8px ${glow})`, transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white leading-none">{Math.round(score)}</span>
        <span className="text-xs text-gray-400 mt-1">/100</span>
      </div>
    </div>
  );
}

const METRIC_INFO = [
  { key: 'electricity' as const, label: 'Electricity', unit: 'kWh', color: 'text-primaryGlow', bar: 'bg-primaryGlow' },
  { key: 'water'       as const, label: 'Water',       unit: 'L',   color: 'text-accentBlue',  bar: 'bg-accentBlue' },
  { key: 'waste'       as const, label: 'Waste',       unit: 'kg',  color: 'text-accentPurple',bar: 'bg-accentPurple' },
  { key: 'carbon'      as const, label: 'Carbon',      unit: 'kg',  color: 'text-secondaryGlow', bar: 'bg-secondaryGlow' },
];

const ResourceHealthScore = ({ entries }: Props) => {
  const { score, avgs, metricScores } = useMemo(() => {
    if (!entries.length) return { score: 0, avgs: { electricity: 0, water: 0, waste: 0, carbon: 0 }, metricScores: { electricity: 0, water: 0, waste: 0, carbon: 0 } };

    const totals = entries.reduce(
      (acc, e) => ({
        electricity: acc.electricity + e.electricity,
        water:       acc.water + e.water,
        waste:       acc.waste + e.waste,
        carbon:      acc.carbon + e.carbon,
      }),
      { electricity: 0, water: 0, waste: 0, carbon: 0 },
    );

    const n = entries.length;
    const avgs = {
      electricity: totals.electricity / n,
      water:       totals.water / n,
      waste:       totals.waste / n,
      carbon:      totals.carbon / n,
    };

    const metricScores = {
      electricity: scoreMetric(avgs.electricity, BENCHMARKS.electricity),
      water:       scoreMetric(avgs.water,       BENCHMARKS.water),
      waste:       scoreMetric(avgs.waste,       BENCHMARKS.waste),
      carbon:      scoreMetric(avgs.carbon,      BENCHMARKS.carbon),
    };

    const score = (metricScores.electricity + metricScores.water + metricScores.waste + metricScores.carbon) / 4;

    return { score, avgs, metricScores };
  }, [entries]);

  const rating = getRating(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel rounded-2xl p-6 flex flex-col h-full"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-white font-semibold">Resource Health Score</h3>
        <p className="text-gray-400 text-xs mt-0.5">Composite sustainability index</p>
      </div>

      {/* Ring */}
      <div className="flex justify-center mb-5">
        <ProgressRing score={score} color={rating.color} glow={rating.glowColor} />
      </div>

      {/* Rating badge */}
      <div className="flex justify-center mb-6">
        <motion.div
          key={rating.label}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${rating.bgColor} border ${rating.borderColor}`}
        >
          <span>{rating.emoji}</span>
          <span className="font-bold text-sm" style={{ color: rating.color }}>{rating.label}</span>
        </motion.div>
      </div>

      {/* Per-metric breakdown */}
      <div className="space-y-3 flex-1">
        {METRIC_INFO.map((m) => {
          const ms = metricScores[m.key];
          return (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${m.color}`}>{m.label}</span>
                <span className="text-xs text-gray-400">
                  avg {fmt(avgs[m.key], 1)} {m.unit}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ms}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className={`h-full rounded-full ${m.bar} opacity-70`}
                />
              </div>
              <p className="text-right text-[10px] text-gray-600 mt-0.5">{Math.round(ms)}/100</p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-1.5">
        {[
          { range: '80–100', label: 'Excellent', color: 'bg-secondaryGlow' },
          { range: '60–79',  label: 'Good',      color: 'bg-primaryGlow' },
          { range: '40–59',  label: 'Average',   color: 'bg-amber-500' },
          { range: '0–39',   label: 'Needs Attention', color: 'bg-red-500' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span>{item.range}: {item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ResourceHealthScore;
