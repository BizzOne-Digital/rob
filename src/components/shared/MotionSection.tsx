"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MotionSection({
  children,
  className,
  delay = 0,
  as = "section",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "section" | "div" | "article";
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    if (as === "div") return <div className={className}>{children}</div>;
    if (as === "article") return <article className={className}>{children}</article>;
    return <section className={className}>{children}</section>;
  }

  const props = {
    className: cn(className),
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" as const },
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const, delay },
  };

  if (as === "div") return <motion.div {...props}>{children}</motion.div>;
  if (as === "article") return <motion.article {...props}>{children}</motion.article>;
  return <motion.section {...props}>{children}</motion.section>;
}
