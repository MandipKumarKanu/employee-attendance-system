import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  { label, error, children, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-surface-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'w-full appearance-none rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-surface-800',
            'transition-all duration-200',
            'hover:border-surface-300',
            'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            error && 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger-500">{error}</p>
      )}
    </div>
  );
});

export default Select;
