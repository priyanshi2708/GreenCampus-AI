import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  toggleSidebar?: () => void;
}

const Topbar = ({ toggleSidebar }: TopbarProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/api/alerts');
      if (res.data && res.data.success) {
        const unread = res.data.data.filter((a: any) => !a.isRead).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error('Failed to fetch alerts count in topbar:', e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <header className="h-20 flex-shrink-0 flex items-center justify-between px-6 lg:px-8 border-b border-white/[0.05] bg-[#050816]/50 backdrop-blur-md sticky top-0 z-10">
      
      {/* Left: Search & Mobile Menu toggle */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] md:hidden transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search resources, buildings, alerts..." 
            className="w-full bg-white/[0.03] border border-white/[0.05] text-sm text-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primaryGlow/50 transition-colors"
          />
        </div>
      </div>

      {/* Center: Campus Selector */}
      <div className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.02] px-3 py-1.5 rounded-lg transition-colors">
        <span className="text-sm font-medium text-gray-300">Main Campus</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        
        {/* AI Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondaryGlow/10 border border-secondaryGlow/20">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondaryGlow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondaryGlow"></span>
          </div>
          <span className="text-xs font-semibold text-secondaryGlow uppercase tracking-wider">AI Active</span>
        </div>

        {/* Notifications */}
        <Link 
          to="/dashboard/alerts"
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border border-[#050816] shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Avatar and Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-accentPurple to-primaryGlow flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(139,92,246,0.3)] select-none border border-white/10"
          >
            <span className="text-xs font-bold text-white">
              {user?.adminName ? user.adminName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
            </span>
          </div>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                {/* Invisible backdrop to capture clicks outside */}
                <div 
                  className="fixed inset-0 z-45"
                  onClick={() => setDropdownOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-[#050816]/95 border border-white/[0.08] backdrop-blur-md shadow-2xl p-1.5 z-50 space-y-0.5"
                >
                  <div className="px-3 py-2 border-b border-white/5 mb-1 select-none">
                    <p className="text-white text-xs font-bold">{user?.adminName || 'Admin Account'}</p>
                    <p className="text-[9px] text-gray-500 font-medium">{user?.email || 'admin@university.edu'}</p>
                  </div>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
                  >
                    <User className="w-3.5 h-3.5" />
                    My Profile
                  </Link>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-xs font-bold text-left border-t border-white/5 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border border-white/[0.08] max-w-sm w-full bg-[#050816] relative z-10 text-center space-y-6 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-black text-base">Confirm Logout</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Are you sure you want to logout? All local cache will be cleared.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-650 text-white transition-all text-xs font-black shadow-md shadow-red-500/10"
                >
                  Logout
                </button>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </header>
  );
};

export default Topbar;
