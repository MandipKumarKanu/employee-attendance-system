import { clsx } from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  accent = "brand",
  trend,
  trendLabel,
  className,
}) {
  const dotColors = {
    brand: "bg-brand-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    info: "bg-info-500",
    danger: "bg-danger-500",
  };

  const selectedDotColor = dotColors[accent] || dotColors.brand;

  return (
    <div
      className={clsx(
        "ui-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-card-hover transition-all duration-300",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={clsx("w-2 h-2 rounded-full", selectedDotColor)} />
          <p className="text-[13px] font-medium text-surface-500">{title}</p>
        </div>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-surface-100 text-surface-500 group-hover:bg-surface-900 group-hover:text-white transition-colors duration-300">
            <Icon className="w-[15px] h-[15px]" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-3">
          <p className="text-[32px] font-semibold text-surface-900 tracking-tight leading-none">
            {value}
          </p>

          {trend !== undefined && (
            <div
              className={clsx(
                "flex items-center gap-1 text-[12px] font-medium",
                trend >= 0 ? "text-success-600" : "text-danger-600",
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        {trendLabel && (
          <p className="text-[12px] text-surface-400 mt-2">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}
