import { ArrowRight } from "lucide-react";
import type { LocalizedProps } from "@/types";
import { cn, localeHref } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";

export function Hero({ locale, dict }: LocalizedProps) {
  const isRtl = locale === "ar";
  const t = dict.home.hero;

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Soft brand accents on a mostly-white canvas */}
      <div className="hex-pattern absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-32 end-[-8rem] h-[26rem] w-[26rem] rounded-full bg-primary-100/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] start-[-6rem] h-80 w-80 rounded-full bg-primary-50 blur-3xl" />

      <Container className="relative py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="max-w-xl">
              <p className="mb-4 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                {t.eyebrow}
              </p>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-text-dark sm:text-5xl lg:text-6xl">
                {t.title}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-dark/70">
                {t.subtitle}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  href={localeHref(locale, "/booking")}
                  variant="primary"
                  size="lg"
                >
                  {t.primaryCta}
                  <ArrowRight className={cn("h-5 w-5", isRtl && "rotate-180")} />
                </Button>
                <Button
                  href={localeHref(locale, "/services")}
                  variant="outline"
                  size="lg"
                >
                  {t.secondaryCta}
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="hidden lg:block">
            <ImagePlaceholder
              src="/images/hero-image.jpg"
              alt={dict.meta.siteName}
              label={dict.meta.tagline}
              className="aspect-[4/5] rounded-3xl shadow-[var(--shadow-soft)] ring-1 ring-primary-100"
              priority
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
