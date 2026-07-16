import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text-dark outline-none transition-colors placeholder:text-text-dark/40 focus:border-accent focus:ring-2 focus:ring-accent/20";

export function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-text-dark"
    >
      {children}
      {optional ? null : <span className="text-accent"> *</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

export function TextInput({
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        inputBase,
        error ? "border-red-400" : "border-primary-100",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        inputBase,
        "min-h-28 resize-y",
        error ? "border-red-400" : "border-primary-100",
        className,
      )}
      {...props}
    />
  );
}
