import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(function Input(
  { label, error, icon, className, type = 'text', ...props },
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
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-800',
            'placeholder:text-surface-400',
            'transition-all duration-200',
            'hover:border-surface-300',
            'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            error && 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger-500">{error}</p>
      )}
    </div>
  );
});

export default Input;
