import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Droplets, Trash2, Wind } from 'lucide-react';
import type { ForecastCardData } from './types';

interface Props {
  data: ForecastCardData[];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 100, h = 32;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-pred-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
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
        fill={`url(#sg-pred-${color})`}
      />
    </svg>
  );
}

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

const METRIC_STYLES = {
  electricity: {
    icon: Zap,
    color: '#00E5FF',
    glowClass: 'shadow-[0_0_30px_rgba(0,229,255,0.15)]',
    borderClass: 'border-primaryGlow/20',
    iconBg: 'bg-primaryGlow/10',
    iconColor: 'text-primaryGlow',
  },
  water: {
    icon: Droplets,
    color: '#3b82f6',
    glowClass: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    borderClass: 'border-accentBlue/20',
    iconBg: 'bg-accentBlue/10',
    iconColor: 'text-accentBlue',
  },
  waste: {
    icon: Trash2,
    color: '#8B5CF6',
    glowClass: 'shadow-[0_0_30px_rgba(139,92,246,0.15)]',
    borderClass: 'border-accentPurple/20',
    iconBg: 'bg-accentPurple/10',
    iconColor: 'text-accentPurple',
  },
  carbon: {
    icon: Wind,
    color: '#4ADE80',
    glowClass: 'shadow-[0_0_30px_rgba(74,222,128,0.15)]',
    borderClass: 'border-secondaryGlow/20',
    iconBg: 'bg-secondaryGlow/10',
    iconColor: 'text-secondaryGlow',
  },
};

function ForecastCard({ card, index }: { card: ForecastCardData; index: number }) {
  const style = METRIC_STYLES[card.type];
  const Icon = style.icon;
  const isIncrease = card.pctChange > 0;
  
  const animatedPredicted = useCounter(card.predictedValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative group glass-panel rounded-2xl p-5 overflow-hidden cursor-default ${style.glowClass}`}
    >
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.06] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.12]"
        style={{ background: style.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`p-2.5 rounded-xl ${style.iconBg} border ${style.borderClass}`}>
          <Icon className={`w-5 h-5 ${style.iconColor} ${card.type === 'electricity' ? 'animate-pulse' : ''}`} />
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isIncrease ? 'bg-red-500/10 text-red-400' : 'bg-secondaryGlow/10 text-secondaryGlow'
          }`}>
            {isIncrease ? '▲' : '▼'} {Math.abs(card.pctChange).toFixed(1)}%
          </span>
          <span className="text-[10px] text-gray-500 mt-1">{card.confidence}% Conf.</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mb-2">
        <h4 className="text-gray-400 text-xs font-medium mb-0.5">{card.title}</h4>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-white tracking-tight">
            {animatedPredicted.toLocaleString('en-US', { maximumFractionDigits: 1 })}
          </span>
          <span className="text-xs text-gray-500">{card.unit}</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">
          Current: {card.currentValue.toLocaleString('en-US', { maximumFractionDigits: 1 })} {card.unit}
        </p>
      </div>

      {/* Sparkline */}
      <div className="relative z-10 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
        <Sparkline data={card.trend} color={style.color} />
      </div>
    </motion.div>
  );
}

const PredictionCards = ({ data }: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {data.map((card, i) => (
        <ForecastCard key={card.type} card={card} index={i} />
      ))}
    </div>
  );
};

export default PredictionCards;
