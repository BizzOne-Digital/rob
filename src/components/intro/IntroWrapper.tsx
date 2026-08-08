"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7f5f8] via-[#faf8f4] to-[#edf4fc]/70"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55 } }}
          aria-hidden={status !== "playing"}
        >
          {status === "playing" ? (
            <>
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
                    initial={{ opacity: 0, scale: 0.88, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-8"
                  >
                    <Image
                      src="/images/brand/rw-designs-canada-logo-clean.png"
                      alt={BRAND.name}
                      width={220}
                      height={220}
                      className="mx-auto h-36 w-36 object-contain md:h-44 md:w-44"
                      priority
                      quality={100}
                    />
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
