"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** One-time scroll reveal, reserved for the package cards. Never re-animates on scroll-up. */
export function Reveal({ children, index = 0, className }: { children: ReactNode; index?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: index * 0.07 }}
    >
      {children}
    </motion.div>
  );
}
