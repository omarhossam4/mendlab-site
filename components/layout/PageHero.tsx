import { Container } from "@/components/ui/Container";

/** Compact page header used at the top of inner pages (white, brand accent). */
export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-primary-100 bg-background">
      {/* Slim brand accent bar + subtle motif keep it on-brand without heavy color */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-dark via-accent to-primary" />
      <div className="hex-pattern absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-24 end-[-6rem] h-72 w-72 rounded-full bg-primary-100/40 blur-3xl" />

      <Container className="relative py-16 sm:py-20">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold leading-tight text-text-dark sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-lg leading-relaxed text-text-dark/70">
              {subtitle}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
