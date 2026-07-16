"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  services,
  serviceCategories,
  getServiceCopy,
  getServiceFullName,
} from "@/lib/services";
import { cn, formatPrice } from "@/lib/utils";
import { submitToSheet } from "@/lib/submit";
import { Button } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import {
  FieldError,
  Label,
  TextArea,
  TextInput,
} from "@/components/ui/FormFields";

type Status = "idle" | "submitting" | "success" | "error";

interface FormState {
  serviceId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyForm: FormState = {
  serviceId: "",
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

  const steps = [t.steps.service, t.steps.schedule, t.steps.details];
  const today = new Date().toISOString().split("T")[0];

  const selectedService = useMemo(
    () => services.find((s) => s.id === form.serviceId),
    [form.serviceId],
  );
  const selectionLabel = selectedService
    ? getServiceFullName(dict, selectedService)
    : "";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateStep(current: number): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (current === 0 && !form.serviceId) next.serviceId = t.errors.service;
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

    const result = await submitToSheet("booking", {
      service: selectionLabel,
      serviceValue: form.serviceId,
      price: selectedService ? `${selectedService.priceEGP} EGP` : "",
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
      <div className="mx-auto max-w-xl rounded-3xl border border-primary-100 bg-surface p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-accent">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-text-dark">
          {t.success.title}
        </h2>
        <p className="mt-3 leading-relaxed text-text-dark/70">{t.success.body}</p>
        <div className="mt-6 rounded-2xl bg-primary-50/60 p-4 text-start text-sm">
          <SummaryRows
            dict={dict}
            locale={locale}
            selectionLabel={selectionLabel}
            price={selectedService?.priceEGP}
            date={form.date}
            time={form.time}
          />
        </div>
        <div className="mt-7">
          <Button onClick={reset} variant="outline">
            {t.success.again}
          </Button>
        </div>
      </div>
    );
  }

  const ArrowFwd = isRtl ? ArrowLeft : ArrowRight;
  const ArrowBwd = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step indicator */}
      <ol className="mb-8 flex items-center">
        {steps.map((label, i) => (
          <li
            key={label}
            className={cn("flex items-center", i < steps.length - 1 && "flex-1")}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  i < step
                    ? "bg-accent text-white"
                    : i === step
                      ? "bg-primary-dark text-white ring-4 ring-primary-100"
                      : "bg-primary-100 text-text-dark/50",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-semibold sm:block",
                  i === step ? "text-text-dark" : "text-text-dark/50",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <span
                className={cn(
                  "mx-2 h-0.5 flex-1 rounded-full sm:mx-4",
                  i < step ? "bg-accent" : "bg-primary-100",
                )}
              />
            ) : null}
          </li>
        ))}
      </ol>

      <p className="mb-4 text-sm font-medium text-text-dark/60 sm:hidden">
        {t.stepLabel} {step + 1} {t.of} {steps.length} — {steps[step]}
      </p>

      <div className="rounded-3xl border border-primary-100 bg-surface p-5 shadow-[var(--shadow-card)] sm:p-8">
        <form onSubmit={handleSubmit} noValidate>
          {/* Step 1: Service — the six price-list sessions, grouped by category */}
          {step === 0 ? (
            <div>
              <h2 className="mb-5 text-lg font-semibold text-text-dark sm:text-xl">
                {t.selectServicePrompt}
              </h2>

              <div className="space-y-6">
                {serviceCategories.map((category) => (
                  <fieldset key={category}>
                    <legend className="mb-3 text-sm font-bold uppercase tracking-wider text-accent">
                      {dict.services.categories[category].name}
                    </legend>
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {services
                        .filter((s) => s.category === category)
                        .map((service) => {
                          const copy = getServiceCopy(dict, service.id);
                          const active = form.serviceId === service.id;
                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => update("serviceId", service.id)}
                              aria-pressed={active}
                              className={cn(
                                "rounded-2xl border p-4 text-start transition-all",
                                active
                                  ? "border-accent bg-primary-50/60 ring-1 ring-accent"
                                  : "border-primary-100 hover:border-primary-200 hover:bg-primary-50/30",
                              )}
                            >
                              <span className="flex items-center justify-between gap-2">
                                <span
                                  className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                                    active
                                      ? "bg-primary text-white"
                                      : "bg-primary-50 text-primary",
                                  )}
                                >
                                  <ServiceIcon
                                    name={service.icon}
                                    className="h-4 w-4"
                                  />
                                </span>
                                {active ? (
                                  <Check className="h-4 w-4 text-accent" />
                                ) : null}
                              </span>
                              <span className="mt-3 block font-semibold text-text-dark">
                                {copy.name}
                              </span>
                              <span className="mt-1 block text-lg font-bold text-primary">
                                {formatPrice(service.priceEGP, locale)}{" "}
                                <span className="text-xs font-medium text-text-dark/60">
                                  {dict.common.egp}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </fieldset>
                ))}
              </div>
              <FieldError message={errors.serviceId} />
              <p className="mt-4 text-xs text-text-dark/55">
                {dict.services.priceNote}
              </p>
            </div>
          ) : null}

          {/* Step 2: Schedule */}
          {step === 1 ? (
            <div>
              <h2 className="mb-5 text-lg font-semibold text-text-dark sm:text-xl">
                {t.schedulePrompt}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="date">{t.fields.date}</Label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-text-dark/40 ltr:left-3.5 rtl:right-3.5" />
                    <TextInput
                      id="date"
                      type="date"
                      min={today}
                      value={form.date}
                      error={!!errors.date}
                      onChange={(e) => update("date", e.target.value)}
                      className="ltr:pl-10 rtl:pr-10"
                    />
                  </div>
                  <FieldError message={errors.date} />
                </div>
                <div>
                  <Label htmlFor="time">{t.fields.time}</Label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-text-dark/40 ltr:left-3.5 rtl:right-3.5" />
                    <TextInput
                      id="time"
                      type="time"
                      value={form.time}
                      error={!!errors.time}
                      onChange={(e) => update("time", e.target.value)}
                      className="ltr:pl-10 rtl:pr-10"
                    />
                  </div>
                  <FieldError message={errors.time} />
                </div>
              </div>

              {selectionLabel ? (
                <div className="mt-6 rounded-2xl bg-primary-50/50 p-4 text-sm">
                  <SummaryRows
                    dict={dict}
                    locale={locale}
                    selectionLabel={selectionLabel}
                    price={selectedService?.priceEGP}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Step 3: Details */}
          {step === 2 ? (
            <div>
              <h2 className="mb-5 text-lg font-semibold text-text-dark sm:text-xl">
                {t.detailsPrompt}
              </h2>
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
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      error={!!errors.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={isRtl ? "text-right" : undefined}
                    />
                    <FieldError message={errors.phone} />
                  </div>
                  <div>
                    <Label htmlFor="email">{t.fields.email}</Label>
                    <TextInput
                      id="email"
                      type="email"
                      dir="ltr"
                      inputMode="email"
                      autoComplete="email"
                      value={form.email}
                      error={!!errors.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={isRtl ? "text-right" : undefined}
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

              {/* Review summary */}
              <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
                  {t.summary}
                </p>
                <SummaryRows
                  dict={dict}
                  locale={locale}
                  selectionLabel={selectionLabel}
                  price={selectedService?.priceEGP}
                  date={form.date}
                  time={form.time}
                />
              </div>

              {submitError ? (
                <p
                  className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  role="alert"
                >
                  {submitError}
                </p>
              ) : null}
            </div>
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
      </div>
    </div>
  );
}

/** Compact key/value summary of the current selection. */
function SummaryRows({
  dict,
  locale,
  selectionLabel,
  price,
  date,
  time,
}: {
  dict: Dictionary;
  locale: Locale;
  selectionLabel: string;
  price?: number;
  date?: string;
  time?: string;
}) {
  const rows: { label: string; value: string }[] = [];
  if (selectionLabel)
    rows.push({ label: dict.booking.steps.service, value: selectionLabel });
  if (price)
    rows.push({
      label: dict.services.pricingLabel,
      value: `${formatPrice(price, locale)} ${dict.common.egp}`,
    });
  if (date) rows.push({ label: dict.booking.fields.date, value: date });
  if (time) rows.push({ label: dict.booking.fields.time, value: time });

  return (
    <dl className="divide-y divide-primary-100">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 py-1.5"
        >
          <dt className="text-text-dark/60">{row.label}</dt>
          <dd className="text-end font-semibold text-text-dark">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
