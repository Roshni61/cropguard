import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

export const GradCamViewer: React.FC<Props> = ({
  originalImageUrl,
  gradCamUrl,
  diseaseName,
  alternatives = [],
  symptoms,
  contradicting,
  missing,
}) => {
  const [heat, setHeat] = useState(!!gradCamUrl);
  const [open, setOpen] = useState<string | null>("symptoms");
  const shouldReduceMotion = useReducedMotion();

  const sections = [
    { 
      id: "symptoms", 
      title: "Identified leaf symptoms", 
      items: symptoms ?? ["Brown concentric rings with chlorotic yellow halo.", "Target spot pattern typical of early foliar fungal stress."] 
    },
    { 
      id: "why", 
      title: `Why ${diseaseName} is suspected`, 
      items: ["Lesion morphological pattern matches Alternaria fungal sporulation.", "Symptom distribution concentrated on mature lower leaves."] 
    },
    { 
      id: "against", 
      title: "Evidence arguing against other conditions", 
      items: contradicting ?? ["No water-soaked bacterial lesions observed.", "No powdery mildew white fungal dusting present."] 
    },
    { 
      id: "missing", 
      title: "Field factors not captured in photo", 
      items: missing ?? ["Underside of lower leaves and stem base condition.", "Exact soil moisture and micro-climate canopy humidity."] 
    },
    { 
      id: "alt", 
      title: "Differential possibilities", 
      items: alternatives.length 
        ? alternatives.map(a => `${a.disease} (${Math.round(a.confidence * 100)}% match)`) 
        : ["Septoria Leaf Spot (3% probability)", "Bacterial Spot (2% probability)"] 
    },
  ];

  return (
    <section className="overflow-hidden rounded-3xl bg-forest text-white shadow-[var(--shadow-lift)] border border-forest-2">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-forest-2/80">
        <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
          <Layers className="h-5 w-5 text-lime" aria-hidden /> 
          <span>Explainable Attention Map (Grad-CAM)</span>
        </h3>
        {gradCamUrl ? (
          <button 
            onClick={() => setHeat(h => !h)} 
            className="flex min-h-9 items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3 text-xs font-semibold text-lime transition cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden /> 
            <span>{heat ? "Show Original" : "Show Heatmap"}</span>
          </button>
        ) : (
          <span className="text-[10px] text-lime/80 font-bold bg-white/10 px-2.5 py-1 rounded-full">
            Attention Heatmap
          </span>
        )}
      </div>

      {/* Image Preview with Fallback */}
      <div className="relative mx-4 sm:mx-5 my-4 aspect-video overflow-hidden rounded-2xl bg-black/40 farm-gradient-fallback border border-forest-2 grid-texture">
        <img 
          src={heat && gradCamUrl ? gradCamUrl : originalImageUrl || "/images/farmer_crop_inspection.jpg"} 
          alt="Diagnostic leaf observation" 
          className="h-full w-full object-cover" 
          onError={(e) => {
            // Graceful fallback to local photo or gradient
            const img = e.target as HTMLImageElement;
            if (img.src !== "/images/farmer_crop_inspection.jpg") {
              img.src = "/images/farmer_crop_inspection.jpg";
            }
          }}
        />
        <div className="absolute bottom-2.5 left-2.5 rounded-xl bg-forest/90 backdrop-blur-md px-3 py-1 text-[11px] text-lime font-bold border border-lime/30 shadow-sm">
          {heat && gradCamUrl ? "Active Model Attention Map" : "Original Leaf Capture"}
        </div>
      </div>

      {/* Diagnostic Explanation Accordion */}
      <div className="space-y-2 p-4 sm:p-5 pt-0">
        {sections.map((s) => {
          const isOpen = open === s.id;
          return (
            <div 
              key={s.id} 
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-colors"
            >
              <button 
                onClick={() => setOpen(isOpen ? null : s.id)} 
                aria-expanded={isOpen} 
                className="flex min-h-12 w-full items-center justify-between px-4 text-left text-xs sm:text-sm font-bold text-white hover:text-lime transition cursor-pointer"
              >
                <span>{s.title}</span>
                <ChevronDown className={`h-4 w-4 text-lime transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] as const }} 
                    className="space-y-1.5 overflow-hidden px-4 pb-4 text-xs sm:text-sm text-white/80 font-normal"
                  >
                    {s.items.map((it, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
