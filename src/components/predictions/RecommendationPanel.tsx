import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import type { ResourceType } from './types';

interface Recommendation {
  id: string;
  type: ResourceType;
  title: string;
  impact: string;
  status: 'critical' | 'warning' | 'info';
  causes: string[];
  actions: string[];
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    type: 'electricity',
    title: 'Electricity Forecast Alert',
    impact: 'Expected to increase by 12% next month',
    status: 'critical',
    causes: ['Summer AC loads peaking', 'Increased computer lab usage hours', 'Inefficient server cooling cycles'],
    actions: ['Optimize smart AC scheduling algorithms', 'Upgrade to intelligent LED controllers', 'Aggregate server cluster utilization'],
  },
  {
    id: 'rec-2',
    type: 'water',
    title: 'Water Demand Forecast',
    impact: 'Expected to decrease by 4.2% next month',
    status: 'info',
    causes: ['Improved rain harvesting storage', 'Reduced athletic facility schedule'],
    actions: ['Perform routine valve check to reduce leaks', 'Maximize irrigation using recycled water'],
  },
  {
    id: 'rec-3',
    type: 'waste',
    title: 'Waste Production Spike',
    impact: 'Expected surge in plastic waste (approx. +8%)',
    status: 'warning',
    causes: ['Upcoming orientation event activities', 'Canteen pre-packaged product sales increases'],
    actions: ['Mandate reusable utensils during events', 'Deploy additional smart recycling bins around campus plazas'],
  },
];

const STATUS_STYLE = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  info: {
    icon: CheckCircle,
    color: 'text-primaryGlow',
    bg: 'bg-primaryGlow/10',
    border: 'border-primaryGlow/20',
  },
};

const RecommendationPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-primaryGlow" />
          <h3 className="text-white font-semibold">AI Recommendation Panel</h3>
        </div>

        <div className="space-y-4">
          {RECOMMENDATIONS.map((rec) => {
            const style = STATUS_STYLE[rec.status];
            const Icon = style.icon;

            return (
              <div
                key={rec.id}
                className="bg-[#050816] rounded-2xl p-4 border border-white/[0.04] space-y-3 hover:border-white/[0.08] transition-all"
              >
                {/* Title & Status */}
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-xs font-bold">{rec.title}</h4>
                  <div className={`p-1.5 rounded-lg ${style.bg} ${style.border} border`}>
                    <Icon className={`w-3.5 h-3.5 ${style.color}`} />
                  </div>
                </div>

                {/* Impact Statement */}
                <p className={`text-xs font-semibold ${style.color}`}>{rec.impact}</p>

                {/* Causes */}
                <div className="space-y-1">
                  <h5 className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Potential Causes</h5>
                  <ul className="list-inside list-disc text-xs text-gray-400 space-y-0.5">
                    {rec.causes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="space-y-1 pt-1">
                  <h5 className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Suggested Actions</h5>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {rec.actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <ArrowRight className="w-3 h-3 text-secondaryGlow mt-0.5 flex-shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/[0.04] text-center">
        <button className="text-xs text-primaryGlow font-semibold hover:text-white transition-colors">
          View Detailed Mitigation Report →
        </button>
      </div>
    </motion.div>
  );
};

export default RecommendationPanel;
