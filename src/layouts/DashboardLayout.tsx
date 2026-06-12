import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primaryGlow/20 selection:text-primaryGlow">
      
      {/* Sidebar - Fixed Left or mobile drawer */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-0 min-w-0">
        <Topbar toggleSidebar={() => setMobileMenuOpen(true)} />
        
        {/* Scrollable Dashboard Space */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
