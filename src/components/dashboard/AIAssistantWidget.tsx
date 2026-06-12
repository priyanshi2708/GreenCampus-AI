import { Bot, User, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const AIAssistantWidget = () => {
  return (
    <div className="bg-card border border-white/[0.05] rounded-3xl overflow-hidden h-[400px] flex flex-col relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accentPurple/20 blur-[50px] pointer-events-none" />

      <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-3 relative z-10">
        <div className="w-8 h-8 rounded-xl bg-accentPurple/20 flex items-center justify-center text-accentPurple">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-white text-sm font-semibold">GreenBot AI</h3>
          <span className="text-xs text-secondaryGlow flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondaryGlow"></span>
            Online
          </span>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-white/10 shrink-0 flex items-center justify-center mt-1">
            <User className="w-3 h-3 text-white" />
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none text-sm text-gray-200">
            Why is Building B consuming more electricity?
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-accentPurple/20 shrink-0 flex items-center justify-center mt-1">
            <Bot className="w-3 h-3 text-accentPurple" />
          </div>
          <div className="bg-accentPurple/10 border border-accentPurple/20 p-3 rounded-2xl rounded-tl-none text-sm text-white">
            <p>Building B consumed 32% more energy than average due to extended AC usage and lab equipment activity outside of normal hours.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-accentPurple/20 shrink-0 flex items-center justify-center mt-1">
            <Bot className="w-3 h-3 text-accentPurple" />
          </div>
          <div className="bg-accentPurple/5 p-3 rounded-2xl rounded-tl-none">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-accentPurple rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-accentPurple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-accentPurple rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-white/[0.05] relative z-10 bg-[#050816]/50">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask GreenBot..." 
            className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-accentPurple/50"
            disabled
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-accentPurple transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantWidget;
