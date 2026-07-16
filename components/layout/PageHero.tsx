import { Container } from "@/components/ui/Container";

/** Compact page header used at the top of inner pages. */
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
    <section className="relative overflow-hidden bg-primary-dark text-white">
      <div className="hex-pattern absolute inset-0 opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent opacity-95" />
      <Container className="relative py-16 sm:py-20">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/80">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              {subtitle}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
