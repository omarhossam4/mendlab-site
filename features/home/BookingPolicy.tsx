"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LocalizedProps } from "@/types";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

/**
 * Collapsible booking-policy panel at the foot of the home page. It stays
 * closed until the visitor opens it — or until they arrive via the
 * `#booking-policy` link on the booking form's acceptance checkbox, in which
 * case it opens and scrolls itself into view.
 */
export function BookingPolicy({ dict }: LocalizedProps) {
  const t = dict.home.policy;
  const points = dict.booking.policy.points;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // One-time sync from an external system (the URL hash), which only exists
    // after the client mounts — the server always renders the panel closed.
    if (window.location.hash === "#booking-policy") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  return (
    <section id="booking-policy" ref={ref} className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl rounded-3xl border border-primary-100 bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="booking-policy-list"
            className="flex w-full items-center justify-between gap-4 text-start"
          >
            <span>
              <span className="block text-sm font-semibold uppercase tracking-wider text-accent">
                {t.eyebrow}
              </span>
              <span className="mt-1 block text-xl font-bold text-text-dark sm:text-2xl">
                {t.title}
              </span>
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-text-dark/60">
              <span className="hidden sm:inline">{open ? t.hide : t.show}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform",
                  open && "rotate-180",
                )}
              />
            </span>
          </button>

          {open ? (
            <ul
              id="booking-policy-list"
              className="mt-5 space-y-3 border-t border-primary-100 pt-5 text-sm leading-relaxed text-text-dark/70 sm:text-base"
            >
              {points.map((point) => (
                <li key={point} className="flex gap-2.5">
                  <span aria-hidden className="mt-1 text-accent">
                    •
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
