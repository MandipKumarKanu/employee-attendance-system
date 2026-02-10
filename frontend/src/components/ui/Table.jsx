import { clsx } from 'clsx';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function Table({ columns, data, sortBy, sortOrder, onSort, isLoading, className }) {
  return (
    <div className={clsx('w-full overflow-x-auto rounded-xl border border-surface-100', className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-surface-50 border-b border-surface-100">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                className={clsx(
                  'px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider',
                  col.sortable && 'cursor-pointer hover:text-surface-600 select-none',
                  col.className
                )}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    sortOrder === 'asc'
                      ? <ChevronUp className="w-3.5 h-3.5" />
                      : <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-surface-100 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-surface-400">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || i}
                className="hover:bg-surface-50/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={clsx('px-4 py-3 text-sm text-surface-700', col.cellClassName)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
