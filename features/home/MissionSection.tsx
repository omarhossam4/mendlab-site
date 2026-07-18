import type { LocalizedProps } from "@/types";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { BrandMark } from "@/features/home/BrandMark";

export function MissionSection({ dict }: LocalizedProps) {
  const t = dict.home.mission;

  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Animated brand mark */}
        <Reveal>
          <BrandMark alt={dict.meta.siteName} />
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
