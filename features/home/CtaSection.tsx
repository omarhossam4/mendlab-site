import { ArrowRight } from "lucide-react";
import type { LocalizedProps } from "@/types";
import { cn, localeHref } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CtaSection({ locale, dict }: LocalizedProps) {
  const t = dict.home.cta;
  const isRtl = locale === "ar";

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary-dark px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <div className="hex-pattern absolute inset-0 opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent opacity-90" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                {t.title}
              </h2>
              <p className="mt-4 text-lg text-white/80">{t.subtitle}</p>
              <div className="mt-8 flex justify-center">
                <Button
                  href={localeHref(locale, "/booking")}
                  variant="secondary"
                  size="lg"
                >
                  {t.button}
                  <ArrowRight className={cn("h-5 w-5", isRtl && "rotate-180")} />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
