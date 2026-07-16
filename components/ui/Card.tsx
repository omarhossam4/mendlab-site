import { cn } from "@/lib/utils";

/** Soft, rounded surface card with a subtle brand shadow. */
export function Card({
  className,
  children,
  hover = false,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary-100/60 bg-surface p-6 shadow-[var(--shadow-card)]",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
