import { Brain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIInsightsProps {
  resourcesCount?: number;
}

const insights = [
  {
    id: 1,
    text: "Building B consumed 32% more electricity than average.",
    action: "Review HVAC schedule"
  },
  {
    id: 2,
    text: "Hostel water usage increased by 14% this week.",
    action: "Check for leaks"
  }
];

const AIInsights = ({ resourcesCount = 0 }: AIInsightsProps) => {
  return (
    <div className="bg-card border border-white/[0.05] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[260px]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accentPurple to-primaryGlow" />
      
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-5 h-5 text-accentPurple" />
          <h3 className="text-white font-semibold">AI Insights</h3>
        </div>

        {resourcesCount === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <p className="text-gray-400 text-sm">
              No sustainability data available yet. Add resource entries to generate AI insights.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <motion.div 
                key={insight.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="p-4 rounded-xl bg-accentPurple/5 border border-accentPurple/10"
              >
                <p className="text-gray-300 text-sm mb-3">{insight.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-accentPurple bg-accentPurple/10 px-2 py-1 rounded">Potential savings: ₹12,000/mo</span>
                  <button className="text-xs font-semibold text-white hover:text-accentPurple flex items-center gap-1 transition-colors">
                    {insight.action} <Sparkles className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
