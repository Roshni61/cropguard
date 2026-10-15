import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Loader2, ScanLine } from "lucide-react";

export const SCAN_STAGES = [
  "Image received",
  "Checking image quality",
  "Looking for symptoms",
  "Comparing candidate conditions",
  "Assessing uncertainty",
  "Preparing guidance",
];

// Focus points are decorative markers of "where the scan is looking", not model output.
const POINTS = [
  { x: 28, y: 34 }, { x: 62, y: 28 }, { x: 48, y: 58 }, { x: 70, y: 66 }, { x: 34, y: 72 },
];

interface Props { src: string | null; stage: number; active: boolean; }

export const LeafScanner: React.FC<Props> = ({ src, stage, active }) => {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-forest grid-texture shadow-[var(--shadow-soft)] ring-1 ring-line">
        {src ? (
          <img src={src} alt="Uploaded leaf" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-lime/80">
            <ScanLine className="h-10 w-10" aria-hidden />
            <span className="text-xs">Demo sample — no image preview</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-6 rounded-2xl border border-lime/40" />
        {active && (
          <>
            <motion.div
              aria-hidden
              className="absolute left-0 right-0 h-0.5 bg-lime shadow-[0_0_24px_6px_rgba(197,240,120,.55)]"
              initial={{ top: "0%" }}
              animate={{ top: reduce ? "50%" : ["0%", "100%", "0%"] }}
              transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
            />
            {POINTS.map((p, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-lime"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={stage >= 2 + Math.floor(i / 2) ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              />
            ))}
          </>
        )}
      </div>

      <ol className="space-y-2" aria-live="polite" aria-label="Analysis progress">
        {SCAN_STAGES.map((label, i) => {
          const done = active ? i < stage : false;
          const current = active && i === stage;
          return (
            <motion.li
              key={label}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                current ? "border-forest-2 bg-white text-ink" : done ? "border-line bg-white/60 text-ink-2" : "border-transparent text-ink-2/60"
              }`}
              animate={{ x: current ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest text-lime">
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <motion.span key="d" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}><Check className="h-3 w-3" /></motion.span>
                  ) : current ? (
                    <Loader2 key="c" className="h-3 w-3 animate-spin" />
                  ) : (
                    <span key="p" className="h-1.5 w-1.5 rounded-full bg-lime/40" />
                  )}
                </AnimatePresence>
              </span>
              {label}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
};
