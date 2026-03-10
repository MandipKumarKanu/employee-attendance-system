import { Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";
import MobileNav from "../components/navigation/MobileNav";
import useUIStore from "../stores/uiStore";
import { clsx } from "clsx";

export default function DashboardLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden bg-surface-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block z-40 relative">
        <Sidebar />
      </div>

      {/* Mobile nav */}
      <MobileNav />

      {/* Main content */}
      <div
        className={clsx(
          "transition-all duration-300 relative z-10 flex flex-col h-screen overflow-hidden",
          sidebarOpen ? "lg:pl-[280px]" : "lg:pl-0",
        )}
      >
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.99, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
