import { Quote, Star } from "lucide-react";
import type { LocalizedProps } from "@/types";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Client reviews.
 *
 * ⚠️ The review copy in the dictionaries is PLACEHOLDER text ("[Customer name]",
 * "[Paste a real customer review here]"). Replace it with real reviews from real
 * clients before publishing — never ship invented testimonials, they mislead
 * visitors. See `home.reviews.items` in i18n/dictionaries/{en,ar}.json.
 */
export function ReviewsSection({ dict }: LocalizedProps) {
  const t = dict.home.reviews;

  return (
    <Section className="bg-primary-50/40">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {t.items.map((review, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <Card hover className="flex h-full flex-col">
              <Quote
                className="h-7 w-7 text-primary-200"
                aria-hidden="true"
              />
              <p className="mt-4 flex-1 leading-relaxed text-text-dark/75">
                {review.text}
              </p>
              <div className="mt-5 border-t border-primary-100 pt-4">
                <div
                  className="flex gap-0.5"
                  role="img"
                  aria-label={`${review.rating} / 5`}
                >
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star
                      key={s}
                      className={
                        s < review.rating
                          ? "h-4 w-4 fill-accent text-accent"
                          : "h-4 w-4 text-primary-200"
                      }
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm font-semibold text-text-dark">
                  {review.name}
                </p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
