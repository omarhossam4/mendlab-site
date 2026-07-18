"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/**
 * About-page brand mark. Deliberately simpler than the home BrandMark: a single
 * slowly-rotating conic sweep behind a clean fade-in of the logo. Decorative —
 * respects reduced-motion by rendering the logo statically.
 */
export function AboutBrandMark({ alt }: { alt: string }) {
  const reduce = useReducedMotion();

  const logo = (
    <Image
      src="/logo/logo.png"
      alt={alt}
      width={520}
      height={280}
      className="relative h-auto w-52 sm:w-60 lg:w-64"
    />
  );

  if (reduce) {
    return (
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-primary/10 bg-background">
        {logo}
      </div>
    );
  }

  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-primary/10 bg-background">
      {/* Slow rotating conic sweep */}
      <motion.span
        className="pointer-events-none absolute h-[130%] w-[130%] rounded-full opacity-60"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(9,86,96,0.12) 60deg, transparent 140deg, transparent 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* Static faint guide ring */}
      <span className="pointer-events-none absolute h-52 w-52 rounded-full border border-primary/10" />

      {/* Logo fades and settles in */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {logo}
      </motion.div>
    </div>
  );
}
