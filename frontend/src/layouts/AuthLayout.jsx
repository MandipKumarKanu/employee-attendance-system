import { Outlet } from 'react-router';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-900">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/90 via-brand-500/70 to-brand-800/90" />

        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border border-white/20" />
          <div className="absolute top-40 left-40 w-96 h-96 rounded-full border border-white/10" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border border-white/15" />
          <div className="absolute bottom-40 right-40 w-80 h-80 rounded-full border border-white/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-xl font-display font-bold text-white">NP</span>
              </div>
              <span className="text-xl font-display font-bold text-white">NepaTronix</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl font-display font-bold text-white leading-tight mb-4">
              NepaTronix<br />Attendance<br />
            </h1>
            <p className="text-lg text-white/70 max-w-md">
              Track attendance, manage leaves, and streamline your workforce operations with ease.
            </p>
          </motion.div>

          <p className="text-sm text-white/40">
            Secure, reliable, and efficient
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-surface-50">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
