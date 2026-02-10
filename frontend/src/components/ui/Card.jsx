import { clsx } from 'clsx';

export default function Card({
  children,
  className,
  hoverable = false,
  padding = true,
  ...props
}) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-surface-100 shadow-card',
        'transition-all duration-250',
        hoverable && 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className }) {
  return (
    <h3 className={clsx('text-[15px] font-semibold text-surface-700', className)}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className }) {
  return (
    <p className={clsx('text-sm text-surface-400 mt-1', className)}>
      {children}
    </p>
  );
};
