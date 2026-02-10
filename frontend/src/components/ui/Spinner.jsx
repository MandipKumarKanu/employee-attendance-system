import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2
      className={clsx('animate-spin text-brand-500', sizes[size], className)}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-sm text-surface-400">Loading...</p>
      </div>
    </div>
  );
}
