import Image from "next/image";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "./ServiceIcon";

/**
 * Branded image slot. Until real photography is supplied, it renders a premium
 * gradient panel with the brand hexagon motif and (optionally) a service icon.
 *
 * When a real photo exists at `src`, pass `hasImage` to render it via next/image
 * instead — no other markup needs to change.
 */
export function ImagePlaceholder({
  src,
  alt,
  icon,
  label,
  hasImage = false,
  className,
  priority = false,
}: {
  src?: string;
  alt: string;
  icon?: string;
  label?: string;
  hasImage?: boolean;
  className?: string;
  priority?: boolean;
}) {
  if (hasImage && src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={src} alt={alt} fill priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-accent to-primary-dark",
        className,
      )}
    >
      <div className="hex-pattern absolute inset-0 opacity-40 [--tw-invert:1]" />
      <div className="relative flex flex-col items-center gap-3 text-white/90">
        {icon ? (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <ServiceIcon name={icon} className="h-8 w-8" />
          </span>
        ) : null}
        {label ? (
          <span className="text-sm font-medium tracking-wide text-white/70">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
