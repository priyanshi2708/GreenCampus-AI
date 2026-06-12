import React from 'react';
import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3 glass-panel rounded-2xl">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accentGreen/20 text-accentGreen shadow-[0_0_12px_rgba(16,185,129,0.25)] group-hover:shadow-[0_0_18px_rgba(16,185,129,0.4)] transition-shadow">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">GreenCampus AI</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-400">
          <a href="#features"    className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#demo"        className="hover:text-white transition-colors duration-200">Demo</a>
          <a href="#leaderboard" className="hover:text-white transition-colors duration-200">Leaderboard</a>
          <Link to="/dashboard"  className="hover:text-white transition-colors duration-200">Dashboard</Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-background bg-white rounded-lg hover:bg-gray-100 active:scale-95 transition-all shadow-[0_0_16px_rgba(255,255,255,0.08)]"
          >
            Get Started
          </Link>
        </div>

      </div>
    </motion.nav>
  );
};

export default Navbar;
