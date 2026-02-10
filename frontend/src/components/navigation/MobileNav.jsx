import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import useUIStore from '../../stores/uiStore';
import Sidebar from './Sidebar';

export default function MobileNav() {
  const { mobileSidebarOpen, closeMobileSidebar } = useUIStore();

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobileSidebar}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-screen w-[260px] z-50 lg:hidden"
          >
            <Sidebar />
            <button
              onClick={closeMobileSidebar}
              className="absolute top-4 right-[-44px] p-2 rounded-lg bg-surface-800 text-white hover:bg-surface-700"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
