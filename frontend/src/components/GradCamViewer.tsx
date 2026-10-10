import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Eye, Layers } from "lucide-react";

interface Props {
  originalImageUrl: string;
  gradCamUrl?: string;
  diseaseName: string;
  alternatives?: { disease: string; confidence: number }[];
  symptoms?: string[];
  contradicting?: string[];
  missing?: string[];
}

const ease = [0.22, 1, 0.36, 1] as const;

export const GradCamViewer: React.FC<Props> = ({
  originalImageUrl, gradCamUrl, diseaseName, alternatives = [], symptoms, contradicting, missing,
}) => {
  const [heat, setHeat] = useState(!!gradCamUrl);
  const [open, setOpen] = useState<string | null>("symptoms");

  const sections = [
    { id: "symptoms", title: "Visible symptoms", items: symptoms ?? ["Symptom list not returned by the service for this scan."] },
    { id: "why", title: `Why ${diseaseName} is suspected`, items: ["Lesion pattern and leaf discoloration match this condition's usual appearance.", "This is a hypothesis, not a confirmed diagnosis."] },
    { id: "against", title: "Evidence that argues against it", items: contradicting ?? ["None reported by the service."] },
    { id: "missing", title: "What we still don't know", items: missing ?? ["Underside of leaf, spread across plant, and recent weather are not captured in one photo."] },
    { id: "alt", title: "Other possibilities", items: alternatives.length ? alternatives.map(a => `${a.disease} (${Math.round(a.confidence * 100)}%)`) : ["No alternatives returned."] },
  ];

  return (
    <section className="overflow-hidden rounded-3xl bg-forest text-white shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between p-4">
        <h3 className="flex items-center gap-2 text-base font-bold"><Layers className="h-5 w-5 text-lime" aria-hidden /> Why CropGuard thinks this</h3>
        {gradCamUrl && (
          <button onClick={() => setHeat(h => !h)} className="flex min-h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-semibold transition hover:bg-white/20">
            <Eye className="h-3.5 w-3.5" aria-hidden /> {heat ? "Show original" : "Show attention map"}
          </button>
        )}
      </div>

      <div className="relative mx-4 aspect-video overflow-hidden rounded-2xl bg-black/40 grid-texture">
        <img src={heat && gradCamUrl ? gradCamUrl : originalImageUrl} alt="Leaf evidence" className="h-full w-full object-contain" />
        <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[11px] text-lime">
          {heat && gradCamUrl ? "Model attention map (from service)" : "Original capture"}
        </span>
      </div>

      <div className="space-y-2 p-4">
        {sections.map((s, i) => {
          const isOpen = open === s.id;
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease, delay: 0.12 * i }} className="rounded-xl bg-white/5">
              <button onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen} className="flex min-h-11 w-full items-center justify-between px-3 text-left text-sm font-semibold">
                {s.title}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease }} className="space-y-1 overflow-hidden px-3 pb-3 text-sm text-white/80">
                    {s.items.map(it => <li key={it} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime" />{it}</li>)}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
