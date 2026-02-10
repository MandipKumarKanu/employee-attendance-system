import { clsx } from 'clsx';

const variants = {
  present: 'bg-success-50 text-success-600 border-success-100',
  approved: 'bg-success-50 text-success-600 border-success-100',
  absent: 'bg-danger-50 text-danger-600 border-danger-100',
  rejected: 'bg-danger-50 text-danger-600 border-danger-100',
  late: 'bg-warning-50 text-warning-600 border-warning-100',
  pending: 'bg-brand-50 text-brand-600 border-brand-100',
  'on-leave': 'bg-info-50 text-info-600 border-info-100',
  'half-day': 'bg-warning-50 text-warning-600 border-warning-100',
  cancelled: 'bg-surface-100 text-surface-500 border-surface-200',
  admin: 'bg-brand-50 text-brand-700 border-brand-100',
  manager: 'bg-info-50 text-info-700 border-info-100',
  employee: 'bg-surface-100 text-surface-600 border-surface-200',
  casual: 'bg-info-50 text-info-600 border-info-100',
  sick: 'bg-danger-50 text-danger-600 border-danger-100',
  earned: 'bg-success-50 text-success-600 border-success-100',
  unpaid: 'bg-surface-100 text-surface-500 border-surface-200',
  default: 'bg-surface-100 text-surface-600 border-surface-200',
};

const dotColors = {
  present: 'bg-success-500',
  approved: 'bg-success-500',
  absent: 'bg-danger-500',
  rejected: 'bg-danger-500',
  late: 'bg-warning-500',
  pending: 'bg-brand-500',
  'on-leave': 'bg-info-500',
  'half-day': 'bg-warning-500',
  cancelled: 'bg-surface-400',
  default: 'bg-surface-400',
};

export default function Badge({ children, variant = 'default', dot = false, className }) {
  const variantClasses = variants[variant] || variants.default;
  const dotColor = dotColors[variant] || dotColors.default;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantClasses,
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', dotColor)} />
      )}
      {children}
    </span>
  );
}
