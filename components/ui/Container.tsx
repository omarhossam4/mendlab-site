import { cn } from "@/lib/utils";

/** Centered, max-width content wrapper with responsive gutters. */
export function Container({
  className,
  children,
  as: Component = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return (
    <Component className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </Component>
  );
}
