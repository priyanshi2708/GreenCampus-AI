import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Droplet, Trash2 } from 'lucide-react';

const Demo = () => {
  const [electricity, setElectricity] = useState(70);
  const [water, setWater] = useState(60);
  const [waste, setWaste] = useState(50);

  // Simple mock formula for sustainability score
  const score = Math.round(100 - ((electricity + water + waste) / 3));

  // Circular progress math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = '#10b981'; // Green
  if (score < 40) scoreColor = '#ef4444'; // Red
  else if (score < 70) scoreColor = '#f59e0b'; // Yellow

  return (
    <section className="py-24 relative" id="demo">
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Interactive Sustainability
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See how real-time adjustments impact your campus sustainability score instantly.
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Sliders */}
            <div className="flex flex-col gap-8">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 flex items-center gap-2"><Zap className="w-4 h-4 text-accentCyan"/> Electricity</span>
                  <span className="text-white font-mono">{electricity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={electricity} 
                  onChange={(e) => setElectricity(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accentCyan"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 flex items-center gap-2"><Droplet className="w-4 h-4 text-accentBlue"/> Water Usage</span>
                  <span className="text-white font-mono">{water}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={water} 
                  onChange={(e) => setWater(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accentBlue"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 flex items-center gap-2"><Trash2 className="w-4 h-4 text-accentPurple"/> Waste Generation</span>
                  <span className="text-white font-mono">{waste}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={waste} 
                  onChange={(e) => setWaste(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accentPurple"
                />
              </div>
            </div>

            {/* Score Display */}
            <div className="flex justify-center items-center">
              <div className="relative flex items-center justify-center w-64 h-64">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle
                    className="text-white/10"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                  />
                  <motion.circle
                    stroke={scoreColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                    initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-bold text-white mb-1" style={{ color: scoreColor }}>{score}</span>
                  <span className="text-sm text-gray-400 uppercase tracking-widest">Score</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
