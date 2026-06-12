import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Leaf, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { RealisticEarth } from '../components/RealisticEarth';
import { useToast } from '../context/ToastContext';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!password || password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });

      if (res.data && res.data.success) {
        setSuccess(true);
        showToast('Password reset successful! Please sign in.', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Invalid or expired password reset token.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden font-sans">
      
      {/* ── LEFT PANEL: 3D Earth ── */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-[#020710] justify-center p-16 border-r border-white/[0.05] overflow-hidden">
        {/* Glow rings */}
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-secondaryGlow/8 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-primaryGlow/8 blur-[120px] pointer-events-none" />

        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accentGreen/20 text-accentGreen shadow-[0_0_16px_rgba(16,185,129,0.3)]">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">GreenCampus AI</span>
        </div>

        {/* Realistic Earth component */}
        <div className="flex-1 w-full relative flex items-center justify-center min-h-[350px]">
          <RealisticEarth />
        </div>
      </div>

      {/* ── RIGHT PANEL: Reset Password Form ── */}
      <div className="flex flex-col items-center justify-center px-6 py-12 md:px-12 w-full lg:w-[480px] xl:w-[540px] relative overflow-hidden bg-background">
        
        {/* Mobile Background Glows */}
        <div className="absolute -top-[20%] right-[-10%] w-[60%] h-[50%] rounded-full bg-primaryGlow/5 blur-[100px] pointer-events-none lg:hidden" />
        <div className="absolute -bottom-[20%] left-[-10%] w-[60%] h-[50%] rounded-full bg-secondaryGlow/5 blur-[100px] pointer-events-none lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] relative z-10 flex flex-col gap-8"
        >
          {/* Mobile-only Branding */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accentGreen/20 text-accentGreen">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">GreenCampus AI</span>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 leading-tight">New Password</h1>
            <p className="text-gray-400 text-sm">Create a strong, unique password for your administrator profile.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form 
                  key="reset-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5" 
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group overflow-hidden bg-primaryGlow hover:bg-primaryGlow/95 text-background font-bold text-sm py-3 px-4 rounded-xl shadow-lg hover:shadow-primaryGlow/25 transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Update Password
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="reset-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Password Updated</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your password has been successfully changed. You are being redirected to the Sign In page...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center">
            <Link 
              to="/login" 
              className="text-xs text-gray-500 hover:text-white transition-colors font-medium"
            >
              Sign In Instead
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default ResetPassword;
