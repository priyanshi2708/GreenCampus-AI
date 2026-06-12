import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ShieldAlert, CheckCircle, RefreshCw, X, Bell, Moon, Eye, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [resetting, setResetting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await axios.post('/api/admin/seed-demo-data');
      if (res.data && res.data.success) {
        showToast('Demo dataset loaded successfully! Evergreen State University is active.', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showToast('Error seeding demo records.', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to seed data.', 'error');
    } finally {
      setSeeding(false);
    }
  };
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReports: true,
    systemStatus: false
  });

  const handleResetData = async () => {
    if (resetInput !== 'RESET') return;
    setResetting(true);
    try {
      const res = await axios.delete('/api/admin/reset-demo-data');
      if (res.data && res.data.success) {
        showToast('All demo records cleared successfully.', 'success');
        setShowResetModal(false);
        setResetInput('');
      } else {
        showToast('Error resetting demo records.', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to clear data.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const getUserRoleLabel = (role: string | undefined) => {
    if (role === 'admin') return 'System Administrator';
    if (role === 'manager') return 'Sustainability Manager';
    if (role === 'viewer') return 'Viewer';
    return 'System Administrator';
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-8 h-8 text-primaryGlow" />
          Settings Page
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage application configurations and administrative actions.</p>
      </div>

      {/* ── SECTIONS ── */}
      <div className="space-y-6">

        {/* 1. General Profile Mock Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.04] bg-[#050816]/30 space-y-4">
          <h3 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-primaryGlow" />
            General Profile Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Admin Name</label>
              <input
                disabled
                type="text"
                value={user?.adminName || 'Campus Admin'}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-gray-400 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">College Name</label>
              <input
                disabled
                type="text"
                value={user?.collegeName || 'Stanford University'}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-gray-400 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">User Role</label>
              <input
                disabled
                type="text"
                value={getUserRoleLabel(user?.role)}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-gray-400 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Email Address</label>
              <input
                disabled
                type="text"
                value={user?.email || 'admin@university.edu'}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-gray-400 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 2. Notification Preferences Mock Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.04] bg-[#050816]/30 space-y-4">
          <h3 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-accentPurple" />
            System Notifications
          </h3>
          
          <div className="space-y-3">
            {[
              { id: 'emailAlerts', label: 'Real-Time Anomaly Email Alerts', desc: 'Receive instant notifications when resource spikes exceed 15% thresholds.' },
              { id: 'weeklyReports', label: 'Weekly Summary PDF Generation Digest', desc: 'Receive automated department score summaries every Sunday.' },
              { id: 'systemStatus', label: 'Background System Logs Updates', desc: 'Send diagnostics status information directly to administrative consoles.' },
            ].map((pref) => (
              <div key={pref.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                <div>
                  <h4 className="text-white text-xs font-bold">{pref.label}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{pref.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={(notifications as any)[pref.id]}
                  onChange={(e) => setNotifications(prev => ({ ...prev, [pref.id]: e.target.checked }))}
                  className="rounded border-white/20 accent-primaryGlow w-4 h-4 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 2.5 SANDBOX & PRESENTATION MODE */}
        <div className="border border-primaryGlow/20 bg-primaryGlow/[0.02] p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primaryGlow" />
            <h3 className="text-primaryGlow text-sm font-black uppercase tracking-wider">Sandbox & Presentation Mode</h3>
          </div>
          
          <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">
            Prepare your campus instantly for a presentation or demonstration. This option populates 7 buildings, 30 days of daily consumption history, pre-calculated ML predictions, active alerts, and leaderboard profiles for a comprehensive walkthrough.
          </p>

          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-5 py-2.5 rounded-xl bg-primaryGlow text-background font-extrabold text-xs transition-all shadow-md shadow-primaryGlow/10 hover:bg-primaryGlow/90 disabled:opacity-50 flex items-center gap-2"
          >
            {seeding ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Seeding Dataset...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Seed Presentation Demo Data
              </>
            )}
          </button>
        </div>

        {/* 3. DANGER ZONE */}
        <div className="border border-red-500/20 bg-red-500/[0.02] p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="text-red-500 text-sm font-black uppercase tracking-wider">Danger Zone Section</h3>
          </div>
          
          <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">
            Resetting the database permanently wipes all dynamic calculations, logs, and user participation counts. Core schemas and building entities are preserved.
          </p>

          <button
            onClick={() => setShowResetModal(true)}
            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs transition-all shadow-md shadow-red-500/10"
          >
            Reset All Demo Data
          </button>
        </div>

      </div>

      {/* ── RESET CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!resetting) setShowResetModal(false); }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border border-red-500/30 max-w-md w-full bg-[#050816] relative z-10 space-y-5 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm">Danger: Clear All Demo Data</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                    This action will permanently delete all demo resource data, reports, predictions, alerts and leaderboard records.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">
                  Type <strong className="text-red-400 font-black font-mono">RESET</strong> to continue
                </label>
                <input
                  type="text"
                  placeholder="RESET"
                  value={resetInput}
                  disabled={resetting}
                  onChange={(e) => setResetInput(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-xs placeholder-gray-700 font-black font-mono focus:border-red-500/50 focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={resetting}
                  onClick={() => { setShowResetModal(false); setResetInput(''); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  disabled={resetInput !== 'RESET' || resetting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-950 disabled:text-red-700 text-white transition-all text-xs font-black flex items-center justify-center gap-1.5 shadow-md disabled:shadow-none"
                >
                  {resetting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Reset All Demo Data'
                  )}
                </button>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SettingsPage;
