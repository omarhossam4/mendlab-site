import type { LocalizedProps } from "@/types";
import { Section } from "@/components/ui/Section";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";

export function MissionSection({ dict }: LocalizedProps) {
  const t = dict.home.mission;

  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <ImagePlaceholder
            src="/images/mission-image.jpg"
            alt={t.title}
            icon="activity"
            className="aspect-[4/3] rounded-3xl"
          />
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
