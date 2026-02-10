import { clsx } from 'clsx';

export default function Skeleton({ className, variant = 'text' }) {
  const variants = {
    text: 'h-4 rounded',
    card: 'h-32 rounded-xl',
    avatar: 'h-10 w-10 rounded-full',
    'table-row': 'h-12 rounded-lg',
    button: 'h-9 w-24 rounded-lg',
  };

  return (
    <div
      className={clsx(
        'animate-pulse bg-gradient-to-r from-surface-100 via-surface-200 to-surface-100 bg-[length:200%_100%]',
        variants[variant],
        className
      )}
    />
  );
}
