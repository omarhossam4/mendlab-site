"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { submitToSheet } from "@/lib/submit";
import { Button } from "@/components/ui/Button";
import {
  FieldError,
  Label,
  TextArea,
  TextInput,
} from "@/components/ui/FormFields";

type Status = "idle" | "submitting" | "success" | "error";

interface ContactState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const empty: ContactState = { name: "", email: "", phone: "", message: "" };

export function ContactForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.contact.form;
  const [form, setForm] = useState<ContactState>(empty);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactState, string>>
  >({});
  const [status, setStatus] = useState<Status>("idle");

  function update<K extends keyof ContactState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ContactState, string>> = {};
    if (!form.name.trim()) next.name = t.errName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t.errEmail;
    if (!form.message.trim()) next.message = t.errMessage;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    const result = await submitToSheet("contact", { ...form, locale });
    setStatus(result.ok ? "success" : "error");
    if (result.ok) setForm(empty);
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
        <p className="mt-4 font-medium text-text-dark">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-email">{t.email}</Label>
          <TextInput
            id="c-email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={form.email}
            error={!!errors.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label htmlFor="c-phone" optional>
            {t.phone}
          </Label>
          <TextInput
            id="c-phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
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

      {status === "error" ? (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {t.error}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? t.submitting : t.submit}
        </Button>
      </div>
    </form>
  );
}
