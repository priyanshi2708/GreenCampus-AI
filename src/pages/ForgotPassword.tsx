import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { RealisticEarth } from '../components/RealisticEarth';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [devPreviewUrl, setDevPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('A valid email address is required.', 'error');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      if (res.data && res.data.success) {
        setEmailAddress(email);
        setEmailSent(true);
        showToast('Password reset link sent to your email.', 'success');
        if (res.data.previewUrl) {
          setDevPreviewUrl(res.data.previewUrl);
          console.log(`[Dev Option] Reset Link Ethereal Preview: ${res.data.previewUrl}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to send reset link. Try again.';
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

      {/* ── RIGHT PANEL: Forgot Password Form ── */}
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
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 leading-tight">Recover Password</h1>
            <p className="text-gray-400 text-sm">We'll help you securely reset your administrator account password.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.form 
                  key="forgot-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5" 
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        placeholder="admin@university.edu"
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
                        Send Reset Link
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="forgot-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-primaryGlow/10 border border-primaryGlow/30 text-primaryGlow flex items-center justify-center mx-auto text-xl">
                    📧
                  </div>
                  <h3 className="text-white font-bold text-lg">Check Your Email</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    We have sent a secure password reset link to <span className="text-white font-semibold">{emailAddress}</span>.
                  </p>

                  {devPreviewUrl && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left mt-4">
                      <div className="text-[10px] text-primaryGlow uppercase font-bold tracking-widest mb-1.5">Developer Sandbox Email</div>
                      <p className="text-[11px] text-gray-500 leading-relaxed mb-2">
                        You can view the simulated password reset mail inbox using Ethereal client:
                      </p>
                      <a
                        href={devPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primaryGlow hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        Open Ethereal Mailbox →
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="text-center">
            <Link 
              to="/login" 
              className="text-xs text-gray-500 hover:text-white transition-colors inline-flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default ForgotPassword;
