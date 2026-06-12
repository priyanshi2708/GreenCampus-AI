import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Sparkles } from 'lucide-react';

const AIAssistant = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="ai-assistant">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentPurple/10 border border-accentPurple/20 text-accentPurple w-fit mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Meet GreenBot AI</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Your Chief <br/>Sustainability Officer
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              Ask questions in plain English and get instant answers powered by your campus data. From generating compliance reports to finding energy leaks, the AI assistant does the heavy lifting.
            </p>
            <ul className="space-y-4">
              {["Generate monthly ESG reports automatically", "Identify anomalies in water consumption", "Recommend HVAC optimization schedules"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-accentPurple"></div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-lg relative"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-accentPurple/20 blur-[100px] rounded-full" />
            
            <div className="relative glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="ml-4 text-xs font-medium text-gray-400">GreenBot Assistant</span>
              </div>
              
              {/* Chat Area */}
              <div className="p-6 space-y-6 bg-[#0a0a0c]/80 backdrop-blur-md">
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-sm text-gray-300">
                    Why did our energy usage spike in the Science Building yesterday at 2 PM?
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accentPurple/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-accentPurple" />
                  </div>
                  <div className="bg-accentPurple/10 border border-accentPurple/20 rounded-2xl rounded-tr-none p-4 text-sm text-white">
                    <p className="mb-2">I analyzed the data for the Science Building:</p>
                    <p className="mb-2 text-gray-300">The HVAC system in the West Wing failed to enter 'Eco-Mode' during the scheduled low-occupancy period, resulting in a 45% increase in cooling load.</p>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1.5 bg-accentPurple/20 hover:bg-accentPurple/30 rounded text-xs transition-colors border border-accentPurple/30">View Chart</button>
                      <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors border border-white/10">Adjust Schedule</button>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
