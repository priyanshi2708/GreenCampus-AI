import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User, Building2, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const perks = [
  'AI-powered energy & water analytics',
  'Real-time campus sustainability score',
  'Automated ESG reporting in one click',
  '500+ universities already onboard',
];

const Register = () => {
  const navigate = useNavigate();
  const { register, token } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (token && !registrationSuccess) {
      navigate('/dashboard');
    }
  }, [token, registrationSuccess, navigate]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const collegeName = formData.get('collegeName') as string;
    const adminName = formData.get('adminName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!collegeName || !collegeName.trim()) {
      showToast('College Name is required.', 'error');
      setLoading(false);
      return;
    }

    if (!adminName || !adminName.trim()) {
      showToast('Admin Name is required.', 'error');
      setLoading(false);
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('A valid email is required.', 'error');
      setLoading(false);
      return;
    }

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
      setRegistrationSuccess(true);
      await register(collegeName, adminName, email, password, confirmPassword);
      showToast('Account created successfully! Welcome to GreenCampus.', 'success');
      navigate('/onboarding');
    } catch (err: any) {
      setRegistrationSuccess(false);
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden font-sans">

      {/* ── LEFT PANEL: Perks & Social Proof ── */}
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

        {/* Headings */}
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          Start your campus's<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGlow to-secondaryGlow">
            green transformation.
          </span>
        </h2>
        <p className="text-gray-400 text-base mb-8 leading-relaxed max-w-md">
          Join 500+ universities using GreenCampus AI to monitor resources, reduce carbon footprints, and achieve net-zero goals.
        </p>

        {/* Perk list */}
        <ul className="space-y-4 max-w-md">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-gray-300 text-sm font-medium">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondaryGlow/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-secondaryGlow" />
              </div>
              {perk}
            </li>
          ))}
        </ul>

        {/* Stats Row */}
        <div className="mt-14 pt-8 border-t border-white/[0.06] grid grid-cols-3 gap-6 max-w-md">
          {[
            { label: 'Avg Energy Saved', value: '28%' },
            { label: 'Campuses Active', value: '500+' },
            { label: 'CO₂ Avoided', value: '12K Tons' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-black text-white mb-0.5 tracking-tight">{s.value}</div>
              <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Register Form (Glassmorphism + Premium Animations) ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-primaryGlow/[0.05] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-accentPurple/[0.05] blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] relative z-10 flex flex-col gap-6"
        >
          {/* Mobile-only Branding */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accentGreen/20 text-accentGreen">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">GreenCampus AI</span>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1.5 leading-tight">Create your account</h1>
            <p className="text-gray-400 text-sm">Register your institution to begin your onboarding wizard.</p>
          </div>

          {/* Premium Glassmorphic Card */}
          <div className="glass-panel p-8 rounded-3xl border-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <form className="space-y-4" onSubmit={handleRegister}>

              {/* College Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">College Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="collegeName"
                    placeholder="Harvard University"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Admin Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Admin Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="adminName"
                    placeholder="Jane Doe"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</label>
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

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
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
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Confirm Password</label>
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
              </div>

              <p className="text-[11px] text-gray-500 pt-1 leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-gray-300 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-gray-300 hover:underline">Privacy Policy</a>.
              </p>

              {/* Continue button */}
              <button
                type="submit"
                className="w-full bg-white text-background font-bold rounded-xl py-3.5 hover:bg-gray-100 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group shadow-[0_0_24px_rgba(255,255,255,0.08)] mt-2"
              >
                Continue to Onboarding
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </form>
          </div>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-bold hover:text-primaryGlow transition-colors">Sign in here</Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
};

export default Register;
