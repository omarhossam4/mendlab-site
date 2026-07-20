"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { contactDetails } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Label, TextArea, TextInput, FieldError } from "@/components/ui/FormFields";

/** WhatsApp brand glyph. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}

interface ContactState {
  name: string;
  message: string;
}

const empty: ContactState = { name: "", message: "" };

export function ContactForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.contact.form;
  const isRtl = locale === "ar";
  const [form, setForm] = useState<ContactState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactState, string>>>({});

  function update<K extends keyof ContactState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<keyof ContactState, string>> = {};
    if (!form.name.trim()) next.name = t.errName;
    if (!form.message.trim()) next.message = t.errMessage;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const text = `${dict.meta.siteName} — ${form.name.trim()}\n\n${form.message.trim()}`;
    const url = `${contactDetails.whatsappUrl}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
      {/* Premium branded header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-accent px-7 py-8 text-white">
        <div className="hex-pattern absolute inset-0 opacity-20" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <WhatsAppGlyph className="h-6 w-6 text-white" />
          </span>
          <div>
            <h2 className="text-xl font-bold leading-tight">{t.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/80">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4 p-7">
        <div>
          <Label htmlFor="c-name">{t.name}</Label>
          <TextInput
            id="c-name"
            autoComplete="name"
            value={form.name}
            error={!!errors.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="c-message">{t.message}</Label>
          <TextArea
            id="c-message"
            placeholder={t.messagePlaceholder}
            value={form.message}
            error={!!errors.message}
            onChange={(e) => update("message", e.target.value)}
          />
          <FieldError message={errors.message} />
        </div>

        <button
          type="submit"
          className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <WhatsAppGlyph className="h-5 w-5" />
          {t.whatsappCta}
          <ArrowRight
            className={cn(
              "h-4 w-4 transition-transform group-hover:translate-x-0.5",
              isRtl && "rotate-180 group-hover:-translate-x-0.5",
            )}
          />
        </button>
        <p className="text-center text-xs text-text-dark/50">{t.whatsappHint}</p>
      </form>
    </div>
  );
}
