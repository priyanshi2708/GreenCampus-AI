import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RealisticEarth } from '../components/RealisticEarth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const stats = [
  { label: 'Energy Savings', value: '45%' },
  { label: 'Water Preserved', value: '1.2M Gal' },
  { label: 'Carbon Avoided', value: '2.4K Tons' },
];

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, token } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      showToast('Session expired. Please login again.', 'warning');
      // Remove query parameter cleanly from browser history
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      showToast('Account created successfully! Please sign in.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, showToast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberElement = e.currentTarget.querySelector('#remember') as HTMLInputElement;
    const rememberMe = rememberElement ? rememberElement.checked : true;

    try {
      await login(email, password, rememberMe);
      showToast('Welcome to GreenCampus AI!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Invalid email or password.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden font-sans">
      
      {/* ── LEFT PANEL: AI Branding, Realistic 3D Earth & Stats ── */}
      <div className="hidden lg:flex flex-col w-[50%] relative bg-[#020710] border-r border-white/[0.05] overflow-hidden p-12 justify-between">
        
        {/* Ambient background glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-primaryGlow/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accentPurple/10 blur-[110px] pointer-events-none" />

        {/* Top: AI Branding / Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accentGreen/20 text-accentGreen shadow-[0_0_16px_rgba(16,185,129,0.3)]">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">GreenCampus AI</span>
        </div>

        {/* Center: Realistic 3D Earth */}
        <div className="relative w-full h-[400px] flex items-center justify-center my-auto z-10">
          <div className="w-full h-full max-w-[420px] max-h-[420px]">
            <RealisticEarth showIndicators={true} cameraPosition={[0, 0, 7.8]} fov={40} />
          </div>
        </div>

        {/* Bottom: Sustainability Stats & Testimonial Card */}
        <div className="z-10 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4 border-t border-b border-white/[0.06] py-5">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white leading-none tracking-tight">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="glass-panel p-5 rounded-2xl border-white/[0.06]">
            <p className="text-gray-300 text-sm leading-relaxed mb-3 italic">
              "GreenCampus AI cut our energy costs by 24% in the first quarter. The AI insights are genuinely actionable."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primaryGlow to-accentPurple flex items-center justify-center text-xs font-bold text-white">SJ</div>
              <div>
                <p className="text-white text-xs font-semibold">Dr. Sarah Jenkins</p>
                <p className="text-gray-500 text-[10px]">Director of Sustainability, MIT</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── RIGHT PANEL: SaaS Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-[60%] h-[50%] rounded-full bg-accentBlue/[0.05] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-accentPurple/[0.05] blur-[120px] pointer-events-none" />

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
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 leading-tight">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to monitor your campus sustainability intelligence.</p>
          </div>

          {/* Session Expired / Toast messages */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass-panel p-8 rounded-3xl border-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Error Display */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    defaultValue="admin@university.edu"
                    placeholder="admin@university.edu"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primaryGlow hover:text-primaryGlow/80 transition-colors font-medium">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    defaultValue="password123"
                    placeholder="••••••••"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  defaultChecked
                  className="rounded border-white/20 accent-primaryGlow w-4 h-4 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer select-none">Remember me for 30 days</label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-background font-bold rounded-xl py-3.5 hover:bg-gray-100 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group mt-2 shadow-[0_0_24px_rgba(255,255,255,0.08)] disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </form>
          </div>

          <p className="text-center text-gray-500 text-sm">
            New to GreenCampus?{' '}
            <Link to="/register" className="text-white font-bold hover:text-primaryGlow transition-colors">Create an account</Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;
