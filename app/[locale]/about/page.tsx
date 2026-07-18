import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Heart, ShieldCheck, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { AboutBrandMark } from "@/features/about/AboutBrandMark";

const valueIcons: LucideIcon[] = [BadgeCheck, ShieldCheck, Heart, Target];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.about.title, description: dict.about.intro };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.about;

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} subtitle={t.intro} />

      {/* Story + Mission */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <AboutBrandMark alt={dict.meta.siteName} />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-text-dark sm:text-3xl">
                  {t.story.title}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-text-dark/70">
                  {t.story.body}
                </p>
              </div>
              <div className="rounded-2xl border-s-4 border-accent bg-primary-50/50 p-6">
                <h2 className="text-xl font-bold text-primary-dark">
                  {t.mission.title}
                </h2>
                <p className="mt-3 leading-relaxed text-text-dark/75">
                  {t.mission.body}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section className="bg-primary-50/40">
        <SectionHeading title={t.values.title} />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.values.items.map((value, i) => {
            const Icon = valueIcons[i % valueIcons.length];
            return (
              <Reveal key={value.title} delay={i * 0.08}>
                <Card hover className="h-full text-center">
                  <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold text-text-dark">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-dark/70">
                    {value.body}
                  </p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Leadership */}
      <Section>
        <Container>
          <SectionHeading title={t.leadership.title} />
          <Reveal>
            <Card className="mx-auto mt-12 max-w-3xl p-8 text-center sm:p-10">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white">
                {t.leadership.name.trim().charAt(0)}
              </span>
              <h3 className="mt-5 text-2xl font-bold text-text-dark">
                {t.leadership.name}
              </h3>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-accent">
                {t.leadership.role}
              </p>
              <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-text-dark/75">
                {t.leadership.bio}
              </p>
            </Card>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
