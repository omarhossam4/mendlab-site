import { cn } from "@/lib/utils";
import { Container } from "./Container";

/**
 * Vertical page section with consistent rhythm. Set `contained={false}` to
 * manage the inner width yourself (e.g. full-bleed backgrounds).
 */
export function Section({
  id,
  className,
  containerClassName,
  children,
  contained = true,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  contained?: boolean;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      {contained ? (
        <Container className={containerClassName}>{children}</Container>
      ) : (
        children
      )}
    </section>
  );
}

/** Standard section heading block: eyebrow + title + optional subtitle. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-start",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold leading-tight text-text-dark sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-lg leading-relaxed text-text-dark/70">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
