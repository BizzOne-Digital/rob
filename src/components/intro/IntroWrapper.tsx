"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BRAND } from "@/lib/constants";
import { Sparkle } from "@/components/ui/Sparkle";

const STORAGE_KEY = "rw-intro-seen";

export function IntroWrapper({
  enabled = true,
  durationMs = 3500,
}: {
  enabled?: boolean | null;
  durationMs?: number | null;
}) {
  const reduce = useReducedMotion();
  const duration = durationMs ?? 3500;
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 17) % 100}%`,
        top: `${(i * 29) % 100}%`,
        delay: (i % 7) * 0.12,
        size: 4 + (i % 5),
      })),
    [],
  );

  useEffect(() => {
    if (!enabled || reduce) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, [enabled, reduce]);

  useEffect(() => {
    if (!visible) return;
    const timers = [
      window.setTimeout(() => setPhase(1), 400),
      window.setTimeout(() => setPhase(2), 1100),
      window.setTimeout(() => setPhase(3), 1900),
      window.setTimeout(() => setPhase(4), 2600),
      window.setTimeout(() => finish(), duration),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, duration]);

  const finish = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br from-icy-blue via-warm-ivory to-dusty-lavender/40"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55 } }}
        >
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full bg-muted-mauve/40"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
              }}
              animate={{ y: [0, -18, 0], opacity: [0.2, 0.8, 0.25] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          <button
            type="button"
            onClick={finish}
            className="absolute right-5 top-5 z-10 rounded-full border border-charcoal/10 bg-white/50 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-charcoal/70 backdrop-blur"
          >
            Skip
          </button>

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <AnimatePresence mode="wait">
              {phase >= 1 && phase < 3 ? (
                <motion.p
                  key="script"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-script text-4xl text-muted-mauve md:text-5xl"
                >
                  Beautifully handmade
                </motion.p>
              ) : null}
            </AnimatePresence>

            {phase >= 2 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 flex items-center gap-3"
              >
                <span className="font-serif text-5xl tracking-[0.2em] text-charcoal md:text-6xl">
                  RW
                </span>
                <Sparkle className="h-3 w-3" />
              </motion.div>
            ) : null}

            {phase >= 3 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Image
                  src="/images/brand/rw-designs-canada-logo.png"
                  alt={BRAND.name}
                  width={220}
                  height={72}
                  className="mx-auto h-16 w-auto object-contain md:h-20"
                  priority
                />
              </motion.div>
            ) : null}

            {phase >= 4 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 max-w-md font-serif text-2xl text-charcoal/80 md:text-3xl"
              >
                {BRAND.headline}
              </motion.p>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
