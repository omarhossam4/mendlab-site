import { FlaskConical, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LocalizedProps } from "@/types";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

// One icon per "Why Choose MendLab" highlight, in dictionary order.
const icons: LucideIcon[] = [FlaskConical, Sparkles, ShieldCheck, Trophy];

export function WhySection({ dict }: LocalizedProps) {
  const t = dict.home.why;

  return (
    <Section className="bg-primary-50/40">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item, i) => {
          const Icon = icons[i % icons.length];
          return (
            <Reveal key={item.title} delay={i * 0.08}>
              <Card hover className="h-full">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold text-text-dark">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dark/70">
                  {item.body}
                </p>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
