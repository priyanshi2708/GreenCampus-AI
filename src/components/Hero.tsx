import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RealisticEarth } from './RealisticEarth';

/* ─── Stat Counter Item ───────────────────────────────────────────── */
const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="text-3xl font-black text-white mb-1 tracking-tight">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

/* ─── Hero Section Component ──────────────────────────────────────── */
const Hero = () => {
  return (
    <section className="relative min-h-screen pt-28 pb-16 flex items-center overflow-hidden dot-grid">
      
      {/* Hero Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[30%] -left-[15%] w-[70%] h-[70%] rounded-full bg-accentBlue/[0.07] blur-[130px]" />
        <div className="absolute top-[10%] -right-[15%] w-[60%] h-[60%] rounded-full bg-accentPurple/[0.07] blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-primaryGlow/[0.05] blur-[140px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          
          {/* ── Left: Headline, Subtext & CTAs ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-7 max-w-2xl"
          >
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primaryGlow/10 border border-primaryGlow/20 text-primaryGlow w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primaryGlow opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primaryGlow" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest">v2.0 Now Live</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-[4.25rem] font-black tracking-tight text-white leading-[1.05]">
              AI-Powered<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGlow via-accentBlue to-accentPurple text-glow">
                Sustainability
              </span>
              <br />Intelligence
            </h1>

            {/* Subtext */}
            <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
              The operating system for a greener campus. Monitor energy, water, waste, and carbon in real-time — powered by AI that actually explains itself.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-background font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.12)] group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-7 py-3.5 rounded-xl glass-panel text-white font-semibold text-sm hover:border-white/20 transition-all"
              >
                Book Demo
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-10 pt-6 border-t border-white/[0.06]">
              <StatItem value="45%" label="Avg Energy Saved" />
              <StatItem value="500+" label="Campuses Active" />
              <StatItem value="1.2M" label="Gallons Preserved" />
            </div>
          </motion.div>

          {/* ── Right: 3D Globe with floating cards ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[550px] xl:h-[640px] w-full"
          >
            {/* Glow ring behind the Earth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primaryGlow/10 blur-[80px] pointer-events-none" />

            {/* Floating indicator cards (Overlaying the 3D element) */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-10 right-4 z-20 glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border-white/10 shadow-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-primaryGlow/15 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primaryGlow" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Real-time AI</div>
                <div className="text-sm font-bold text-white">98.2% Optimal</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute bottom-24 left-2 z-20 glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border-white/10 shadow-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-secondaryGlow/15 flex items-center justify-center">
                <Wind className="w-4 h-4 text-secondaryGlow" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Carbon Cut</div>
                <div className="text-sm font-bold text-secondaryGlow">-24.7% This Month</div>
              </div>
            </motion.div>

            {/* 3D Realistic Earth Canvas Component */}
            <RealisticEarth showIndicators={true} cameraPosition={[0, 0, 9]} fov={42} />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
