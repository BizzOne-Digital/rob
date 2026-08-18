"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BRAND } from "@/lib/constants";

const STORAGE_KEY = "rw-intro-seen";

function readIntroSeen() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function IntroWrapper({
  enabled = true,
  durationMs = 3500,
}: {
  enabled?: boolean | null;
  durationMs?: number | null;
}) {
  const reduce = useReducedMotion();
  const active = enabled !== false;
  const duration = Math.max(durationMs ?? 3500, 2800);

  // pending: solid cover so site never flashes before we know
  // playing: logo/text animation
  // done: reveal site
  const [status, setStatus] = useState<"pending" | "playing" | "done">(
    active ? "pending" : "done",
  );
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

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setStatus("done");
  }, []);

  useEffect(() => {
    const next: "playing" | "done" =
      !active || reduce || readIntroSeen() ? "done" : "playing";
    const id = window.setTimeout(() => setStatus(next), 0);
    return () => window.clearTimeout(id);
  }, [active, reduce]);

  useEffect(() => {
    if (status !== "playing") return;
    const timers = [
      window.setTimeout(() => setPhase(1), 180),
      window.setTimeout(() => setPhase(2), 650),
      window.setTimeout(() => setPhase(3), 1150),
      window.setTimeout(() => setPhase(4), 1850),
      window.setTimeout(() => finish(), duration),
    ];
    return () => timers.forEach(clearTimeout);
  }, [status, duration, finish]);

  useEffect(() => {
    if (status === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [status]);

  const showCover = status === "pending" || status === "playing";

  return (
    <AnimatePresence>
      {showCover ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#eef1ea] via-[#f7f3ee] to-[#d5ddd0]/70"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55 } }}
          aria-hidden={status !== "playing"}
        >
          {status === "playing" ? (
            <>
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  className="absolute rounded-full bg-taupe/35"
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
                className="absolute right-4 top-4 z-10 min-h-11 rounded-full border border-charcoal/10 bg-white/50 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-charcoal/70 backdrop-blur sm:right-5 sm:top-5"
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
                      className="font-script text-3xl text-taupe sm:text-4xl md:text-5xl"
                    >
                      Beautifully handmade
                    </motion.p>
                  ) : null}
                </AnimatePresence>

                {phase >= 2 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-8 rounded-2xl bg-white/35 px-4 py-5 sm:px-10 sm:py-8"
                  >
                    <BrandLogo href={false} size="lg" />
                  </motion.div>
                ) : null}

                {phase >= 3 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 max-w-md font-serif text-2xl text-charcoal/80 md:text-3xl"
                  >
                    {BRAND.headline}
                  </motion.p>
                ) : null}
              </div>
            </>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
