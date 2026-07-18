"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/**
 * Premium animated brand mark: the MendLab logo centered on a soft, light
 * panel, framed by slow radiating rings and a gentle float. Purely decorative —
 * respects the user's reduced-motion preference by rendering statically.
 */
export function BrandMark({ alt }: { alt: string }) {
  const reduce = useReducedMotion();

  const logo = (
    <Image
      src="/logo/logo.png"
      alt={alt}
      width={520}
      height={280}
      priority={false}
      className="relative h-auto w-56 sm:w-64 lg:w-72"
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
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-white via-background to-primary/5">
      {/* Radiating rings */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full border border-primary/15"
          style={{ width: 220, height: 220 }}
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: [0.6, 1.9], opacity: [0, 0.5, 0] }}
          viewport={{ once: false, margin: "-60px" }}
          transition={{
            duration: 5,
            times: [0, 0.4, 1],
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 1.6,
          }}
        />
      ))}

      {/* Soft brand glow behind the mark */}
      <motion.span
        className="pointer-events-none absolute h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Logo: reveals in, then breathes with a gentle float */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {logo}
        </motion.div>
      </motion.div>
    </div>
  );
}
