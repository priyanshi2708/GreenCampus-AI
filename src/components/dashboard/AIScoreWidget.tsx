import { motion } from 'framer-motion';

const AIScoreWidget = () => {
  const score = 82;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card border border-white/[0.05] rounded-3xl p-6 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primaryGlow/10 rounded-full blur-[50px]" />

      <h3 className="text-white font-semibold mb-6">Campus Sustainability Score</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative flex items-center justify-center w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]" viewBox="0 0 160 160">
            <circle
              className="text-white/[0.03]"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="80"
              cy="80"
            />
            <motion.circle
              stroke="#00E5FF"
              strokeWidth="12"
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="80"
              cy="80"
              initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-bold text-white mb-1 tracking-tighter">{score}</span>
            <span className="text-xs text-primaryGlow uppercase tracking-widest font-semibold">Excellent</span>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Energy Efficiency</span>
            <span className="text-white font-medium">85/100</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-primaryGlow rounded-full" />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Water Efficiency</span>
            <span className="text-white font-medium">78/100</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '78%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-accentBlue rounded-full" />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Carbon Reduction</span>
            <span className="text-white font-medium">92/100</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-secondaryGlow rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIScoreWidget;
