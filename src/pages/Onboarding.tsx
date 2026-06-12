import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Brain, Leaf, MapPin, Layers, Users, Zap, Check, ChevronRight, Droplet, Recycle, Wind } from 'lucide-react';

const steps = [
  { id: 1, label: 'Campus Information', icon: MapPin },
  { id: 2, label: 'Buildings', icon: Building2 },
  { id: 3, label: 'Departments', icon: Layers },
  { id: 4, label: 'Student Count', icon: Users },
  { id: 5, label: 'Resource Data', icon: Zap },
  { id: 6, label: 'Generate AI Sustainability Score', icon: Brain },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Simulate progress indicator during step 6
  useEffect(() => {
    if (step === 6 && !revealed) {
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setRevealed(true);
            }, 500);
            return 100;
          }
          return prev + 2.5; // increments to full in ~4 seconds
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step, revealed]);

  // Animate score number when revealed
  useEffect(() => {
    if (revealed) {
      let currentScore = 0;
      const targetScore = 84;
      const duration = 1200; // ms
      const stepTime = Math.abs(Math.floor(duration / targetScore));
      
      const timer = setInterval(() => {
        currentScore += 1;
        setScore(currentScore);
        if (currentScore >= targetScore) {
          clearInterval(timer);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [revealed]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-[50%] h-[50%] rounded-full bg-primaryGlow/[0.06] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-accentPurple/[0.06] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10">

        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accentGreen/20 text-accentGreen shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">GreenCampus AI</span>
        </div>

        {/* Wizard Step Stepper */}
        <div className="hidden sm:flex items-center justify-between mb-12 px-4">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                  step > s.id ? 'bg-secondaryGlow text-background border-secondaryGlow shadow-[0_0_16px_rgba(74,222,128,0.4)]' :
                  step === s.id ? 'bg-primaryGlow text-background border-primaryGlow shadow-[0_0_20px_rgba(0,229,255,0.4)] font-black scale-105' :
                  'bg-white/[0.02] text-gray-500 border-white/[0.08]'
                }`}>
                  {step > s.id ? <Check className="w-4 h-4 stroke-[3px]" /> : s.id}
                </div>
                <span className={`absolute top-11 text-[9px] font-semibold whitespace-nowrap uppercase tracking-wider transition-colors ${
                  step === s.id ? 'text-primaryGlow font-bold' : step > s.id ? 'text-secondaryGlow' : 'text-gray-600'
                }`}>{s.id === 6 ? 'AI Score' : s.label.split(' ')[0]}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-[2px] mx-4 transition-colors duration-500 ${step > s.id ? 'bg-secondaryGlow/50' : 'bg-white/[0.08]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Wizard Main Card */}
        <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 border-white/[0.06] shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">

            {/* Step 1: Campus Information */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Campus Information</h2>
                  <p className="text-gray-400 text-sm">Let's start with the basic details of your university campus.</p>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">University Name</label>
                    <input type="text" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="Stanford University" placeholder="e.g., Stanford University" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">City</label>
                      <input type="text" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="Stanford" placeholder="e.g., Stanford" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Country</label>
                      <input type="text" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="USA" placeholder="e.g., USA" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Campus Area (Acres)</label>
                    <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="8180" placeholder="e.g., 150" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Buildings */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Campus Buildings</h2>
                  <p className="text-gray-400 text-sm">Tell us about the physical infrastructure and smart utilities on campus.</p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Total Buildings</label>
                      <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="145" placeholder="e.g., 45" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Oldest Building (years)</label>
                      <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="75" placeholder="e.g., 60" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Total Floor Area (sq. ft.)</label>
                    <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="4200000" placeholder="e.g., 2500000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Current Smart Systems</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Smart Meters', 'Solar Panels', 'BMS Integration', 'EV Chargers', 'LED Lighting'].map((tag) => (
                        <button key={tag} type="button" className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:border-primaryGlow/40 hover:text-primaryGlow transition-colors duration-200">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Departments */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Departments</h2>
                  <p className="text-gray-400 text-sm">Specify the academic departments layout for usage profiling.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Total Academic Departments</label>
                    <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="24" placeholder="e.g., 18" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">High-Consumption Departments</label>
                    <p className="text-[11px] text-gray-500 leading-none">Select departments with active lab spaces or heavy machinery</p>
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {['School of Engineering', 'Medicine & Labs', 'Chemistry', 'Physics Lab', 'Arts & Design', 'Computer Science', 'Materials Science'].map((dept) => (
                        <button key={dept} type="button" className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:border-primaryGlow/40 hover:text-primaryGlow transition-colors duration-200">
                          {dept}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Student Count */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Student Count & Population</h2>
                  <p className="text-gray-400 text-sm">Calibration population metrics to calculate per-capita sustainability standards.</p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Total Enrolled Students</label>
                      <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="16500" placeholder="e.g., 15000" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">On-Campus Residents</label>
                      <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="7200" placeholder="e.g., 5000" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Faculty & Admin Staff Count</label>
                    <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="2800" placeholder="e.g., 1200" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Resource Data */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Resource Data & Consumption</h2>
                  <p className="text-gray-400 text-sm">Provide monthly estimates to train our machine learning prediction models.</p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Avg Monthly Energy ($)</label>
                      <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="145000" placeholder="e.g., 80000" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Water Usage (Gal/mo)</label>
                      <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="850000" placeholder="e.g., 500000" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Waste Generated (Tons/mo)</label>
                    <input type="number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all" defaultValue="62" placeholder="e.g., 30" />
                  </div>

                  <button type="button" className="w-full p-4 bg-primaryGlow/[0.04] border border-primaryGlow/10 hover:border-primaryGlow/30 hover:bg-primaryGlow/[0.08] rounded-2xl flex items-center gap-3.5 transition-all duration-200 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-primaryGlow/10 flex items-center justify-center text-primaryGlow">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-sm font-semibold text-white">Connect Campus Smart Meters</div>
                      <div className="text-xs text-gray-400 mt-0.5">Automated synchronization via IoT API Integration.</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primaryGlow group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Generate AI Sustainability Score */}
            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="py-4">
                
                {!revealed ? (
                  /* ── AI PROCESSING STATE ── */
                  <div className="text-center flex flex-col items-center">
                    
                    {/* Glowing Brain Radar Core */}
                    <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-2 border-t-primaryGlow border-r-transparent border-b-transparent border-l-transparent"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-3 rounded-full border-2 border-t-transparent border-r-accentPurple border-b-transparent border-l-transparent"
                      />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-6 rounded-full border border-t-transparent border-r-transparent border-b-secondaryGlow border-l-transparent"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-12 h-12 text-white animate-pulse" />
                      </div>
                      <div className="absolute -inset-4 rounded-full bg-primaryGlow/5 blur-xl pointer-events-none" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Generating Sustainability Intelligence...</h2>
                    <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
                      Our neural model is cross-referencing your resource logs, building utility baselines, and scoring campus metrics against 500+ active institutions.
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primaryGlow to-secondaryGlow" 
                        animate={{ width: `${processingProgress}%` }}
                        transition={{ ease: 'easeOut' }}
                      />
                    </div>

                    {/* Sequential Log messages */}
                    <div className="flex flex-col gap-2.5 max-w-xs text-left">
                      {[
                        { label: 'Ingesting utility meter logs...', activeProgress: 20 },
                        { label: 'Executing energy efficiency comparisons...', activeProgress: 50 },
                        { label: 'Synthesizing recommendations...', activeProgress: 80 },
                      ].map((log) => (
                        <div
                          key={log.label}
                          className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                            processingProgress >= log.activeProgress ? 'opacity-100 text-gray-300' : 'opacity-25 text-gray-500'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${processingProgress >= log.activeProgress ? 'bg-secondaryGlow' : 'bg-gray-500'}`} />
                          {log.label}
                        </div>
                      ))}
                    </div>

                  </div>
                ) : (
                  /* ── REVEAL STATE (Campus Score, Insights, Recommendations) ── */
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-secondaryGlow/10 border border-secondaryGlow/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(74,222,128,0.25)]">
                        <Check className="w-8 h-8 text-secondaryGlow stroke-[3px]" />
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tight mb-1.5">Intelligence Report Ready</h2>
                      <p className="text-gray-400 text-sm max-w-md mx-auto">We've constructed your campus's initial AI sustainability score and recommendations profile.</p>
                    </div>

                    {/* Results Overview */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-6 sm:p-8 space-y-6">
                      
                      {/* Main Campus Score */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campus Score</div>
                          <div className="text-sm font-bold text-white mt-0.5">Initial Sustainability Rating</div>
                        </div>
                        <div className="flex items-baseline gap-1 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                          <span className="text-4xl font-black text-primaryGlow tracking-tight">{score}</span>
                          <span className="text-xs font-semibold text-gray-500">/ 100</span>
                        </div>
                      </div>

                      {/* Resource Insights */}
                      <div className="space-y-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource Insights</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { label: 'Energy Efficiency', val: '88/100', percent: 88, color: 'bg-primaryGlow', icon: Zap },
                            { label: 'Water Efficiency', val: '72/100', percent: 72, color: 'bg-blue-400', icon: Droplet },
                            { label: 'Carbon Avoidance', val: '92/100', percent: 92, color: 'bg-emerald-400', icon: Wind },
                          ].map((item) => (
                            <div key={item.label} className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <item.icon className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-white">{item.val}</span>
                              </div>
                              <div>
                                <div className="text-[10px] text-gray-400 font-medium leading-none mb-1.5">{item.label}</div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.percent}%` }}
                                    transition={{ duration: 1.2, delay: 0.3 }}
                                    className={`h-full rounded-full ${item.color}`}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="pt-2 space-y-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Recommendations</div>
                        <div className="space-y-2.5">
                          {[
                            { icon: '⚡', text: 'Convert lighting arrays in Blocks C & D to LED for an immediate 12% energy reduction.' },
                            { icon: '💧', text: '3 anomalies detected in library cooling tower water supply lines. Flagged for inspection.' },
                            { icon: '♻', text: 'Expanding local organics composting program could reduce overall waste tonnage by 18.4%.' }
                          ].map((rec, i) => (
                            <div key={i} className="flex gap-3 text-sm text-gray-300 bg-white/[0.01] hover:bg-white/[0.03] p-3 rounded-xl border border-white/[0.04] transition-colors">
                              <span className="text-base select-none leading-none mt-0.5">{rec.icon}</span>
                              <span className="leading-relaxed text-xs">{rec.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Finish CTA */}
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-white text-background font-bold rounded-xl py-4 hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-[0_0_32px_rgba(255,255,255,0.12)]"
                    >
                      Enter Dashboard
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

              </motion.div>
            )}

          </AnimatePresence>

          {/* Stepper Footer Controls */}
          {step < 6 && (
            <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors px-3 py-2 rounded-lg"
              >
                Back
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-500">Step {step} of 5</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-white text-background font-bold text-xs rounded-xl px-6 py-3 hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-1.5 group"
                >
                  {step === 5 ? 'Generate AI Score' : 'Continue'}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Onboarding;
