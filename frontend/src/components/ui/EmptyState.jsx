import { clsx } from 'clsx';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-surface-300" />
        </div>
      )}
      <h3 className="text-base font-semibold text-surface-600 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-surface-400 text-center max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
