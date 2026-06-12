import { TrendingDown, TrendingUp, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface PredictionsProps {
  resourcesCount?: number;
}

const forecasts = [
  { label: 'Next Month Energy', value: '-2.4%', trend: 'down', color: 'text-secondaryGlow' },
  { label: 'Next Month Water', value: '+1.1%', trend: 'up', color: 'text-red-400' },
  { label: 'Expected Savings', value: '₹45k', trend: 'up', color: 'text-secondaryGlow' },
];

const Predictions = ({ resourcesCount = 0 }: PredictionsProps) => {
  return (
    <div className="bg-card border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between min-h-[260px]">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BarChart className="w-5 h-5 text-accentBlue" />
          <h3 className="text-white font-semibold">Predictions</h3>
          {resourcesCount >= 3 && (
            <span className="ml-auto text-xs font-medium bg-white/10 px-2 py-1 rounded text-gray-300">94% Confidence</span>
          )}
        </div>

        {resourcesCount < 3 ? (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <p className="text-gray-400 text-sm">
              Requires at least 3 resource logs to activate ML forecasts.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {forecasts.map((f, i) => (
              <motion.div 
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex items-center justify-between"
              >
                <span className="text-gray-400 text-sm">{f.label}</span>
                <div className={`flex items-center gap-1 font-semibold ${f.color}`}>
                  {f.value}
                  {f.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                </div>
              </motion.div>
            ))}
            
            <div className="pt-4 border-t border-white/[0.05]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Carbon Target Progress</span>
                <span className="text-white font-medium">68%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accentBlue to-primaryGlow w-[68%]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions;
