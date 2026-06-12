import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const departments = [
  { name: "College of Engineering", score: 94, trend: "up", change: "+2.4%" },
  { name: "School of Business", score: 88, trend: "up", change: "+1.1%" },
  { name: "Student Union", score: 82, trend: "neutral", change: "0.0%" },
  { name: "Arts & Sciences", score: 76, trend: "down", change: "-1.5%" },
  { name: "Athletics Complex", score: 65, trend: "down", change: "-4.2%" },
];

const Leaderboard = () => {
  return (
    <section className="py-24 relative" id="leaderboard">
      <div className="container mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Campus Leaderboard
            </h2>
            <p className="text-gray-400 max-w-xl">
              Gamify sustainability across your university. Track which departments are leading the charge towards net-zero.
            </p>
          </div>
          <button className="px-6 py-3 rounded-lg glass-panel text-white font-medium hover:bg-white/5 transition-colors whitespace-nowrap">
            View Full Rankings
          </button>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-7">Department</div>
            <div className="col-span-3 md:col-span-2 text-right">Score</div>
            <div className="col-span-2 text-right">Trend</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {departments.map((dept, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-1 flex justify-center">
                  {index === 0 ? (
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                      <Trophy className="w-4 h-4" />
                    </div>
                  ) : (
                    <span className="text-gray-500 font-mono text-sm">{index + 1}</span>
                  )}
                </div>
                <div className="col-span-6 md:col-span-7 font-medium text-gray-200">
                  {dept.name}
                </div>
                <div className="col-span-3 md:col-span-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden hidden md:block">
                      <div 
                        className={`h-full rounded-full ${index === 0 ? 'bg-accentGreen' : index > 3 ? 'bg-red-500' : 'bg-accentCyan'}`} 
                        style={{ width: `${dept.score}%` }} 
                      />
                    </div>
                    <span className="font-mono text-white">{dept.score}</span>
                  </div>
                </div>
                <div className="col-span-2 flex justify-end">
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                    dept.trend === 'up' ? 'text-accentGreen bg-accentGreen/10' : 
                    dept.trend === 'down' ? 'text-red-400 bg-red-400/10' : 
                    'text-gray-400 bg-gray-400/10'
                  }`}>
                    {dept.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                    {dept.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                    {dept.trend === 'neutral' && <Minus className="w-3 h-3" />}
                    {dept.change}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Leaderboard;
