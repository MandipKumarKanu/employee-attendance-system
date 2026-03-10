import { clsx } from "clsx";
import { motion } from "framer-motion";

export default function Card({
  children,
  className,
  hoverable = false,
  padding = true,
  ...props
}) {
  const Component = hoverable ? motion.div : "div";
  const hoverProps = hoverable
    ? {
        whileHover: { y: -2, boxShadow: "var(--shadow-md)" },
        transition: { duration: 0.2, ease: "easeOut" },
      }
    : {};

  return (
    <Component
      className={clsx(
        "ui-panel rounded-xl relative overflow-hidden",
        "transition-all duration-300",
        hoverable && "cursor-pointer group",
        padding && "p-6",
        className,
      )}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}

Card.Header = function CardHeader({ children, className }) {
  return (
    <div className={clsx("mb-4 flex items-center justify-between", className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className }) {
  return (
    <h3
      className={clsx(
        "text-[15px] font-semibold text-surface-900 tracking-tight",
        className,
      )}
    >
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className }) {
  return (
    <p
      className={clsx(
        "text-[13px] text-surface-500 font-medium mt-1.5 leading-relaxed",
        className,
      )}
    >
      {children}
    </p>
  );
};
