import React, { useState } from "react";
import { TrendingUp, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "../i18n/I18nContext";

export const FieldsPage: React.FC = () => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [activeField, setActiveField] = useState("fld-01");

  return (
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="max-w-3xl mx-auto space-y-6 pb-16"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">{t("myFields")}</h2>
          <p className="text-xs text-ink-2">Green Valley Organics • Coimbatore</p>
        </div>
        <button 
          type="button"
          className="min-h-[48px] px-4 py-2 bg-forest hover:bg-forest-hover text-cream rounded-2xl text-xs font-bold flex items-center gap-2 shadow-[var(--shadow-soft)] border border-lime/30 transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-lime" />
          <span>Add New Field</span>
        </button>
      </div>

      {/* FIELD SELECTOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveField("fld-01")}
          className={`p-5 sm:p-6 rounded-3xl border-2 cursor-pointer transition shadow-[var(--shadow-soft)] ${
            activeField === "fld-01" 
              ? "bg-white border-forest ring-2 ring-lime/40" 
              : "bg-paper border-line hover:border-forest/40"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-forest bg-forest/10 px-3 py-1 rounded-xl">
              Tomato Field A (North)
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-lg">
              Score: 82%
            </span>
          </div>
          <div className="text-xs text-ink-2 space-y-1 font-medium">
            <p>Area: 2.4 acres • Variety: Arka Rakshak</p>
            <p>Crop Stage: <strong className="text-forest">Fruiting Stage</strong></p>
            <p>Soil: Red Loam • Drip Irrigation</p>
          </div>
        </div>

        <div
          onClick={() => setActiveField("fld-02")}
          className={`p-5 sm:p-6 rounded-3xl border-2 cursor-pointer transition shadow-[var(--shadow-soft)] ${
            activeField === "fld-02" 
              ? "bg-white border-forest ring-2 ring-lime/40" 
              : "bg-paper border-line hover:border-forest/40"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-forest bg-forest/10 px-3 py-1 rounded-xl">
              Tomato Field B (South)
            </span>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
              Score: 94%
            </span>
          </div>
          <div className="text-xs text-ink-2 space-y-1 font-medium">
            <p>Area: 2.1 acres • Variety: Pusa Ruby</p>
            <p>Crop Stage: <strong className="text-forest">Vegetative Stage</strong></p>
            <p>Soil: Black Cotton • Drip Irrigation</p>
          </div>
        </div>
      </div>

      {/* CROP HEALTH TIMELINE & FOLLOW-UP COMPARISON */}
      <div className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest" />
            <h3 className="font-bold text-base text-forest">Crop Health Timeline & Scan Follow-ups</h3>
          </div>
          <span className="text-xs font-black text-forest bg-lime px-3 py-1 rounded-xl shadow-xs">
            ↗ Trend: Improving
          </span>
        </div>

        {/* Scan History Items */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
          {/* Scan 1: Today */}
          <div className="relative flex items-start justify-between bg-paper p-4 rounded-2xl border border-line gap-3">
            <div className="absolute -left-[27px] top-4 w-4 h-4 rounded-full bg-forest border-2 border-white shadow-xs" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-forest">Early Blight (Alternaria solani)</span>
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg">
                  Moderate Severity
                </span>
              </div>
              <p className="text-xs text-ink-2 mt-1 font-medium">
                Scanned Today at 09:15 AM • Confidence: 94% • Weather Spray Warning Issued
              </p>
            </div>
            <span className="text-xs font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-xl shrink-0">
              Follow-up Scheduled
            </span>
          </div>

          {/* Scan 2: 7 days ago */}
          <div className="relative flex items-start justify-between bg-paper p-4 rounded-2xl border border-line gap-3">
            <div className="absolute -left-[27px] top-4 w-4 h-4 rounded-full bg-leaf-light border-2 border-forest" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-forest">Septoria Leaf Spot</span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  Mild Severity
                </span>
              </div>
              <p className="text-xs text-ink-2 mt-1 font-medium">
                Scanned 7 Days Ago • Applied Neem Extract 5% • Resolved
              </p>
            </div>
            <span className="text-xs font-bold text-ink-2 bg-line px-2.5 py-1 rounded-xl shrink-0">
              Completed
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
