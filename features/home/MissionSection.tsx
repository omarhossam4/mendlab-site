import Image from "next/image";
import type { LocalizedProps } from "@/types";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function MissionSection({ dict }: LocalizedProps) {
  const t = dict.home.mission;

  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Branded panel — logo mark + hexagon motif, no photography needed */}
        <Reveal>
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-primary-dark">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent" />
            <div className="hex-pattern absolute inset-0 opacity-50" />
            {/* Soft brand glows */}
            <div className="pointer-events-none absolute -top-16 end-[-4rem] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-4rem] start-[-3rem] h-56 w-56 rounded-full bg-accent/40 blur-3xl" />

            <div className="relative flex flex-col items-center gap-6 px-8 text-center">
              <Image
                src="/logo/logo-white.svg"
                alt={dict.meta.siteName}
                width={293}
                height={160}
                className="h-16 w-auto sm:h-20"
              />
              <span className="h-px w-16 bg-white/30" />
              <p className="text-lg font-semibold text-white/90 sm:text-xl">
                {dict.services.tagline}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              {t.eyebrow}
            </p>
            <h2 className="text-3xl font-bold leading-tight text-text-dark sm:text-4xl">
              {t.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-text-dark/70">
              {t.body}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
