import { Trophy, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const departments = [
  { name: 'Computer Engineering', score: 92, status: 'Leading' },
  { name: 'Mechanical Engineering', score: 87, status: 'Improving' },
  { name: 'Civil Engineering', score: 82, status: 'Stable' },
  { name: 'Architecture', score: 75, status: 'Warning' },
];

const DashboardLeaderboard = () => {
  return (
    <div className="bg-card border border-white/[0.05] rounded-3xl p-6 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-semibold">Sustainability Leaderboard</h3>
        <button className="text-xs text-primaryGlow font-medium hover:underline">View All</button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {departments.map((dept, i) => (
          <motion.div 
            key={dept.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-gray-400'
            }`}>
              {i === 0 ? <Trophy className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-200">{dept.name}</span>
                <span className="text-sm font-bold text-white">{dept.score}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${dept.score}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${i === 0 ? 'bg-primaryGlow' : i > 2 ? 'bg-red-400' : 'bg-accentBlue'}`} 
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/[0.05] flex gap-3">
        <button className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm text-gray-300 transition-colors">
          <FileText className="w-4 h-4" /> AI Report
        </button>
        <button className="flex-1 bg-primaryGlow/10 hover:bg-primaryGlow/20 border border-primaryGlow/20 rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm text-primaryGlow transition-colors font-medium">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>
    </div>
  );
};

export default DashboardLeaderboard;
