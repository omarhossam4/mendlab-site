import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { LocalizedProps } from "@/types";
import { cn, localeHref } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Hero({ locale, dict }: LocalizedProps) {
  const isRtl = locale === "ar";
  const t = dict.home.hero;

  return (
    <section className="relative overflow-hidden bg-primary-dark text-white">
      {/* Full-bleed background photo */}
      <Image
        src="/images/hero-2.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Brand gradient overlays for legibility over the photo */}
      <div
        className={cn(
          "absolute inset-0 from-primary-dark via-primary-dark/85 to-primary-dark/30 lg:to-transparent",
          isRtl ? "bg-gradient-to-l" : "bg-gradient-to-r",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-transparent to-transparent" />
      <div className="hex-pattern absolute inset-0 opacity-20" />

      <Container className="relative">
        <div className="flex min-h-[36rem] max-w-2xl flex-col justify-center py-20 sm:min-h-[42rem] lg:min-h-[86vh]">
          <Reveal>
            {/* Eyebrow with decorative rule */}
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-accent" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/90 sm:text-sm">
                {t.eyebrow}
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85 sm:text-xl">
              {t.subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                href={localeHref(locale, "/booking")}
                variant="primary"
                size="lg"
                className="w-full bg-white text-primary-dark hover:bg-white/90 sm:w-auto"
              >
                {t.primaryCta}
                <ArrowRight className={cn("h-5 w-5", isRtl && "rotate-180")} />
              </Button>
              <Button
                href={localeHref(locale, "/services")}
                variant="ghost"
                size="lg"
                className="w-full border border-white/40 bg-white/5 text-white hover:bg-white/15 sm:w-auto"
              >
                {t.secondaryCta}
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
