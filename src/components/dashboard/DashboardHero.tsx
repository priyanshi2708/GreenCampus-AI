import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const DashboardHero = () => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-white/[0.05] p-8 mt-2">
      {/* Animated Glows */}
      <div className="absolute -top-[50%] -right-[10%] w-[50%] h-[150%] rounded-full bg-primaryGlow/10 blur-[80px] pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] rounded-full bg-accentPurple/10 blur-[80px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-primaryGlow font-medium text-sm mb-2"
        >
          {today}
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2"
        >
          Good Morning, {user?.adminName || 'Admin'} <span className="inline-block animate-[wave_2s_ease-in-out_infinite] origin-[70%_70%]">👋</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-base max-w-xl"
        >
          Here's what is happening across your campus today. Resource consumption is generally stable, but we've detected an anomaly in Building B.
        </motion.p>
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: rotate( 0.0deg) }
          10% { transform: rotate(14.0deg) }
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate( 0.0deg) }
          100% { transform: rotate( 0.0deg) }
        }
      `}</style>
    </div>
  );
};

export default DashboardHero;
