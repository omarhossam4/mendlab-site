"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "./ServiceIcon";

/**
 * Branded image slot with automatic fallback.
 *
 * Drop a real photo at `src` (see /public/images) and it appears automatically —
 * no code change needed. If the file is missing (or fails to load), a premium
 * gradient panel with the brand hexagon motif renders instead, so the layout
 * always looks finished.
 */
export function ImagePlaceholder({
  src,
  alt,
  icon,
  label,
  className,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: {
  src?: string;
  alt: string;
  icon?: string;
  label?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-accent to-primary-dark",
        className,
      )}
    >
      {/* Gradient fallback / loading background */}
      <div className="hex-pattern absolute inset-0 opacity-40" />
      <div className="relative flex flex-col items-center gap-3 text-white/90">
        {icon ? (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <ServiceIcon name={icon} className="h-8 w-8" />
          </span>
        ) : null}
        {label ? (
          <span className="px-4 text-center text-sm font-medium tracking-wide text-white/70">
            {label}
          </span>
        ) : null}
      </div>

      {/* Real photo — covers the gradient once loaded; hidden on error */}
      {showImage ? (
        <Image
          src={src as string}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
