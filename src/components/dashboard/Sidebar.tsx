import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Bot, 
  FileText, 
  Bell, 
  Trophy, 
  Settings,
  Leaf
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BarChart3, label: 'Resource Tracking', path: '/dashboard/resources' },
  { icon: TrendingUp, label: 'Predictions', path: '/dashboard/predictions' },
  { icon: Bot, label: 'AI Assistant', path: '/dashboard/assistant' },
  { icon: FileText, label: 'Reports', path: '/dashboard/reports' },
  { icon: Bell, label: 'Alerts', path: '/dashboard/alerts' },
  { icon: Trophy, label: 'Leaderboard', path: '/dashboard/leaderboard' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <aside className={`
      w-64 flex-shrink-0 flex flex-col h-full bg-[#050816]/95 border-r border-white/[0.05] z-50 transition-transform duration-300 ease-in-out
      fixed inset-y-0 left-0 md:relative md:translate-x-0 md:flex
      ${isOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,229,255,0.15)]' : '-translate-x-full'}
    `}>
      
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primaryGlow/10 text-primaryGlow shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg text-white tracking-tight">GreenCampus</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) => `
              relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group
              ${isActive ? 'text-white bg-white/[0.04]' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primaryGlow/[0.08] to-transparent border border-primaryGlow/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primaryGlow drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'group-hover:text-gray-200'}`} />
                <span className="text-sm font-medium relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/[0.05]">
        <NavLink
          to="/dashboard/settings"
          onClick={onClose}
          className={({ isActive }) => `
            relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group
            ${isActive ? 'text-white bg-white/[0.04]' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primaryGlow/[0.08] to-transparent border border-primaryGlow/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Settings className={`w-5 h-5 relative z-10 ${isActive ? 'text-primaryGlow drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'group-hover:text-gray-200'}`} />
              <span className="text-sm font-medium relative z-10">Settings</span>
            </>
          )}
        </NavLink>
      </div>

    </aside>
  );
};

export default Sidebar;
