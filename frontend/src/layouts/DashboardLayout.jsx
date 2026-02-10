import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/navigation/Sidebar';
import Topbar from '../components/navigation/Topbar';
import MobileNav from '../components/navigation/MobileNav';
import useUIStore from '../stores/uiStore';
import { clsx } from 'clsx';

export default function DashboardLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile nav */}
      <MobileNav />

      {/* Main content */}
      <div
        className={clsx(
          'transition-all duration-300',
          sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-0'
        )}
      >
        <Topbar />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
