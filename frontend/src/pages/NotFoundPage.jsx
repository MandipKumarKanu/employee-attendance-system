import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="text-8xl font-display font-bold text-brand-500 mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-surface-800 mb-2">
          Page not found
        </h1>
        <p className="text-surface-400 mb-8 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button leftIcon={<Home className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
