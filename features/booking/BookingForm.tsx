"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  bookableOptions,
  getServiceCopy,
  type BookableOption,
} from "@/lib/services";
import { cn, formatPrice } from "@/lib/utils";
import { submitToSheet } from "@/lib/submit";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  FieldError,
  Label,
  TextArea,
  TextInput,
} from "@/components/ui/FormFields";

type Status = "idle" | "submitting" | "success" | "error";

interface FormState {
  option: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyForm: FormState = {
  option: "",
  date: "",
  time: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
};

export function BookingForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.booking;
  const isRtl = locale === "ar";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string>("");

  const optionLabel = useMemo(() => {
    return (opt: BookableOption) => {
      const name = getServiceCopy(dict, opt.serviceId).name;
      if (opt.tierId) {
        const price = opt.priceEGP
          ? ` — ${formatPrice(opt.priceEGP, locale)} ${dict.common.egp}`
          : "";
        return `${name} · ${dict.services.tiers[opt.tierId]}${price}`;
      }
      return name;
    };
  }, [dict, locale]);

  const steps = [t.steps.service, t.steps.schedule, t.steps.details];
  const today = new Date().toISOString().split("T")[0];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateStep(current: number): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (current === 0 && !form.option) next.option = t.errors.service;
    if (current === 1) {
      if (!form.date) next.date = t.errors.date;
      if (!form.time) next.time = t.errors.time;
    }
    if (current === 2) {
      if (!form.name.trim()) next.name = t.errors.name;
      if (!/^[\d\s+()-]{7,}$/.test(form.phone)) next.phone = t.errors.phone;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        next.email = t.errors.email;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(2)) return;
    setStatus("submitting");
    setSubmitError("");

    const selected = bookableOptions.find((o) => o.value === form.option);
    const serviceName = selected
      ? optionLabel(selected)
      : form.option;

    const result = await submitToSheet("booking", {
      service: serviceName,
      serviceValue: form.option,
      date: form.date,
      time: form.time,
      name: form.name,
      phone: form.phone,
      email: form.email,
      notes: form.notes,
      locale,
    });

    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setSubmitError(
        result.reason === "not-configured"
          ? t.errors.notConfigured
          : t.errors.submit,
      );
    }
  }

  function reset() {
    setForm(emptyForm);
    setErrors({});
    setStep(0);
    setStatus("idle");
    setSubmitError("");
  }

  if (status === "success") {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-accent">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-text-dark">
          {t.success.title}
        </h2>
        <p className="mt-3 leading-relaxed text-text-dark/70">
          {t.success.body}
        </p>
        <div className="mt-7">
          <Button onClick={reset} variant="outline">
            {t.success.again}
          </Button>
        </div>
      </Card>
    );
  }

  const ArrowFwd = isRtl ? ArrowLeft : ArrowRight;
  const ArrowBwd = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <ol className="mb-8 flex items-center gap-2">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                i < step
                  ? "bg-accent text-white"
                  : i === step
                    ? "bg-primary-dark text-white"
                    : "bg-primary-100 text-text-dark/50",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-sm font-medium sm:block",
                i === step ? "text-text-dark" : "text-text-dark/50",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 ? (
              <span className="mx-1 hidden h-px flex-1 bg-primary-100 sm:block" />
            ) : null}
          </li>
        ))}
      </ol>

      <p className="mb-4 text-sm text-text-dark/60 sm:hidden">
        {t.stepLabel} {step + 1} {t.of} {steps.length}
      </p>

      <Card>
        <form onSubmit={handleSubmit} noValidate>
          {/* Step 1: Service */}
          {step === 0 ? (
            <fieldset>
              <legend className="mb-4 text-lg font-semibold text-text-dark">
                {t.selectServicePrompt}
              </legend>
              <div className="grid gap-2.5">
                {bookableOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                      form.option === opt.value
                        ? "border-accent bg-primary-50/60 ring-1 ring-accent"
                        : "border-primary-100 hover:border-primary-200",
                    )}
                  >
                    <span className="font-medium text-text-dark">
                      {optionLabel(opt)}
                    </span>
                    <input
                      type="radio"
                      name="option"
                      value={opt.value}
                      checked={form.option === opt.value}
                      onChange={(e) => update("option", e.target.value)}
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                  </label>
                ))}
              </div>
              <FieldError message={errors.option} />
            </fieldset>
          ) : null}

          {/* Step 2: Schedule */}
          {step === 1 ? (
            <fieldset>
              <legend className="mb-4 text-lg font-semibold text-text-dark">
                {t.schedulePrompt}
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="date">{t.fields.date}</Label>
                  <TextInput
                    id="date"
                    type="date"
                    min={today}
                    value={form.date}
                    error={!!errors.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                  <FieldError message={errors.date} />
                </div>
                <div>
                  <Label htmlFor="time">{t.fields.time}</Label>
                  <TextInput
                    id="time"
                    type="time"
                    value={form.time}
                    error={!!errors.time}
                    onChange={(e) => update("time", e.target.value)}
                  />
                  <FieldError message={errors.time} />
                </div>
              </div>
            </fieldset>
          ) : null}

          {/* Step 3: Details */}
          {step === 2 ? (
            <fieldset>
              <legend className="mb-4 text-lg font-semibold text-text-dark">
                {t.detailsPrompt}
              </legend>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">{t.fields.name}</Label>
                  <TextInput
                    id="name"
                    autoComplete="name"
                    value={form.name}
                    error={!!errors.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                  <FieldError message={errors.name} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">{t.fields.phone}</Label>
                    <TextInput
                      id="phone"
                      type="tel"
                      dir="ltr"
                      autoComplete="tel"
                      value={form.phone}
                      error={!!errors.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                    <FieldError message={errors.phone} />
                  </div>
                  <div>
                    <Label htmlFor="email">{t.fields.email}</Label>
                    <TextInput
                      id="email"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      value={form.email}
                      error={!!errors.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                    <FieldError message={errors.email} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes" optional>
                    {t.fields.notes}
                  </Label>
                  <TextArea
                    id="notes"
                    placeholder={t.fields.notesPlaceholder}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </div>
              </div>

              {submitError ? (
                <p
                  className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  role="alert"
                >
                  {submitError}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          {/* Navigation */}
          <div className="mt-7 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={goBack}>
                <ArrowBwd className="h-4 w-4" />
                {t.back}
              </Button>
            ) : (
              <span />
            )}

            {step < steps.length - 1 ? (
              <Button type="button" onClick={goNext}>
                {t.next}
                <ArrowFwd className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? t.submitting : t.submit}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
