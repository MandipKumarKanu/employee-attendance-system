import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

const accentColors = {
  brand: {
    border: 'border-l-brand-500',
    iconBg: 'bg-brand-100',
    iconColor: 'text-brand-600',
  },
  success: {
    border: 'border-l-success-500',
    iconBg: 'bg-success-100',
    iconColor: 'text-success-600',
  },
  warning: {
    border: 'border-l-warning-500',
    iconBg: 'bg-warning-100',
    iconColor: 'text-warning-600',
  },
  info: {
    border: 'border-l-info-500',
    iconBg: 'bg-info-100',
    iconColor: 'text-info-600',
  },
  danger: {
    border: 'border-l-danger-500',
    iconBg: 'bg-danger-100',
    iconColor: 'text-danger-600',
  },
};

export default function StatCard({ title, value, icon: Icon, accent = 'brand', trend, trendLabel, className }) {
  const colors = accentColors[accent] || accentColors.brand;

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-surface-100 shadow-card p-5',
        'border-l-4',
        colors.border,
        'hover:shadow-card-hover transition-all duration-250',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-2xl font-display font-bold text-surface-900">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-success-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-danger-500" />
              )}
              <span
                className={clsx(
                  'text-xs font-medium',
                  trend >= 0 ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-surface-400">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              colors.iconBg
            )}
          >
            <Icon className={clsx('w-5 h-5', colors.iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
}
