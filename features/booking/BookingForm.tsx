"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { services, getServiceCopy } from "@/lib/services";
import { cn, formatPrice } from "@/lib/utils";
import {
  formatDayLong,
  formatDayParts,
  formatSlotLabel,
  getBookableDays,
  getSlots,
  isSlotInPast,
} from "@/lib/slots";
import { submitToSheet } from "@/lib/submit";
import { Button } from "@/components/ui/Button";
import {
  FieldError,
  Label,
  TextArea,
  TextInput,
} from "@/components/ui/FormFields";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Client-only snapshot of the bookable days. The list is cached so the snapshot
 * stays referentially stable (useSyncExternalStore requires that), and the
 * server snapshot is empty so nothing date-dependent is prerendered.
 */
const NO_DAYS: string[] = [];
let cachedDays: string[] | null = null;

function subscribeNever() {
  return () => {};
}
function getDaysSnapshot(): string[] {
  if (!cachedDays) cachedDays = getBookableDays();
  return cachedDays;
}
function getNoDays(): string[] {
  return NO_DAYS;
}

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

  // Booked slots per day, keyed by ISO date. A missing key means "not fetched
  // yet", which is what drives the loading state — so both are derived, never
  // set synchronously inside an effect.
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const booked = form.date ? (availability[form.date] ?? []) : [];
  const loadingSlots = Boolean(form.date) && availability[form.date] === undefined;

  // Bookable days depend on "now". useSyncExternalStore keeps the server
  // snapshot empty so the prerendered HTML never bakes in the build date (which
  // would both go stale and cause a hydration mismatch).
  const days = useSyncExternalStore(subscribeNever, getDaysSnapshot, getNoDays);

  const steps = [t.steps.service, t.steps.schedule, t.steps.details];
  const slots = useMemo(() => getSlots(), []);

  // Fetch availability for a day the first time it's selected. Fails open: on
  // any error the day resolves to "nothing booked" so booking is never blocked.
  useEffect(() => {
    const date = form.date;
    if (!date || availability[date] !== undefined) return;

    let cancelled = false;
    const record = (slotsTaken: string[]) => {
      if (!cancelled) setAvailability((a) => ({ ...a, [date]: slotsTaken }));
    };

    fetch(`/api/availability?date=${date}`)
      .then((r) => r.json())
      .then((data) => record(Array.isArray(data?.booked) ? data.booked : []))
      .catch(() => record([]));

    return () => {
      cancelled = true;
    };
  }, [form.date, availability]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === form.serviceId),
    [form.serviceId],
  );
  const selectionLabel = selectedService
    ? getServiceCopy(dict, selectedService.id).name
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
      else if (booked.includes(form.time)) next.time = t.errors.slotTaken;
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

    // Field names match the Apps Script's doPost contract exactly
    // (date, slotId, customerName, phone, service). Extra fields are ignored
    // by the script until columns exist for them.
    const result = await submitToSheet("booking", {
      date: form.date,
      slotId: form.time,
      customerName: form.name,
      phone: form.phone,
      service: selectionLabel,
      price: selectedService ? `${selectedService.priceEGP} EGP` : "",
      email: form.email,
      notes: form.notes,
      locale,
    });

    if (result.ok) {
      setStatus("success");
      return;
    }

    setStatus("error");
    if (result.reason === "slot-taken") {
      // Someone won the race. Send them back to pick another time and
      // re-check availability for that day.
      setAvailability((a) => {
        const next = { ...a };
        delete next[form.date];
        return next;
      });
      setForm((f) => ({ ...f, time: "" }));
      setErrors({ time: t.errors.slotTaken });
      setStep(1);
      return;
    }
    setSubmitError(
      result.reason === "not-configured"
        ? t.errors.notConfigured
        : t.errors.submit,
    );
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
          {/* Step 1: Service — the six services from the price list */}
          {step === 0 ? (
            <div>
              <h2 className="mb-5 text-lg font-semibold text-text-dark sm:text-xl">
                {t.selectServicePrompt}
              </h2>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {services.map((service) => {
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
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-text-dark">
                          {copy.name}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(service.priceEGP, locale)}{" "}
                            <span className="text-xs font-medium text-text-dark/60">
                              {dict.common.egp}
                            </span>
                          </span>
                          {active ? (
                            <Check className="h-4 w-4 text-accent" />
                          ) : null}
                        </span>
                      </span>
                      <span className="mt-1.5 block text-xs leading-relaxed text-text-dark/60">
                        {copy.short}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.serviceId} />
            </div>
          ) : null}

          {/* Step 2: Schedule — pick a day, then a one-hour slot */}
          {step === 1 ? (
            <div>
              <h2 className="mb-5 text-lg font-semibold text-text-dark sm:text-xl">
                {t.schedulePrompt}
              </h2>

              {/* Day picker: today + the next 7 days */}
              <p className="mb-2 text-sm font-medium text-text-dark">
                {t.fields.date}
                <span className="text-accent"> *</span>
              </p>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                {days.map((day) => {
                  const parts = formatDayParts(day, locale);
                  const active = form.date === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => update("date", day)}
                      aria-pressed={active}
                      className={cn(
                        "flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition-all",
                        active
                          ? "border-accent bg-primary-50/60 ring-1 ring-accent"
                          : "border-primary-100 hover:border-primary-200 hover:bg-primary-50/30",
                      )}
                    >
                      <span className="text-xs font-medium text-text-dark/60">
                        {parts.weekday}
                      </span>
                      <span className="text-lg font-bold leading-tight text-text-dark">
                        {parts.day}
                      </span>
                      <span className="text-xs text-text-dark/60">
                        {parts.month}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.date} />

              {/* Slot picker */}
              <div className="mt-6">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text-dark">
                    {t.fields.time}
                    <span className="text-accent"> *</span>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-dark/60">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full border border-primary-200 bg-surface" />
                      {t.slots.available}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      {t.slots.booked}
                    </span>
                  </div>
                </div>

                {!form.date ? (
                  <p className="rounded-xl bg-primary-50/50 px-4 py-3 text-sm text-text-dark/60">
                    {t.slots.pickDayFirst}
                  </p>
                ) : loadingSlots ? (
                  <p className="flex items-center gap-2 rounded-xl bg-primary-50/50 px-4 py-3 text-sm text-text-dark/60">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.slots.loading}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((slot) => {
                      const isBooked = booked.includes(slot);
                      const isPast = isSlotInPast(form.date, slot);
                      const disabled = isBooked || isPast;
                      const active = form.time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={disabled}
                          aria-disabled={disabled}
                          title={
                            isBooked
                              ? t.slots.bookedTitle
                              : isPast
                                ? t.slots.pastTitle
                                : undefined
                          }
                          onClick={() => update("time", slot)}
                          className={cn(
                            "rounded-xl border px-2 py-2.5 text-sm font-medium transition-all",
                            isBooked
                              ? "cursor-not-allowed border-red-200 bg-red-50 text-red-600 line-through"
                              : isPast
                                ? "cursor-not-allowed border-primary-100 bg-primary-50/40 text-text-dark/30"
                                : active
                                  ? "border-accent bg-primary-50/60 text-primary ring-1 ring-accent"
                                  : "border-primary-100 text-text-dark hover:border-primary-200 hover:bg-primary-50/30",
                          )}
                        >
                          {formatSlotLabel(slot, locale)}
                        </button>
                      );
                    })}
                  </div>
                )}
                <FieldError message={errors.time} />
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
  if (date)
    rows.push({ label: dict.booking.fields.date, value: formatDayLong(date, locale) });
  if (time)
    rows.push({
      label: dict.booking.fields.time,
      value: formatSlotLabel(time, locale),
    });

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
