import { clsx } from 'clsx';

export default function Avatar({ name, src, size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const colors = [
    'bg-brand-100 text-brand-700',
    'bg-info-100 text-info-700',
    'bg-success-100 text-success-700',
    'bg-warning-100 text-warning-700',
    'bg-danger-100 text-danger-700',
  ];

  const colorIndex = name
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={clsx('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-semibold',
        sizes[size],
        colors[colorIndex],
        className
      )}
    >
      {initials}
    </div>
  );
}
