import React from "react";
import { TrendingUp, Landmark, ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export const MarketSchemesPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="max-w-4xl mx-auto space-y-6 pb-16"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">Market Prices & Govt Schemes</h2>
          <p className="text-xs text-ink-2">Live APMC Mandi Rates & Financial Subsidies</p>
        </div>
      </div>

      {/* MARKET PRICES MODULE */}
      <div className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <TrendingUp className="w-5 h-5 text-forest" />
          <h3 className="font-bold text-base text-forest">Tomato Market Rates (Coimbatore District)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-paper rounded-2xl border border-line">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
              <span>Coimbatore MGR Wholesale Market</span>
              <span className="text-forest bg-lime px-2.5 py-0.5 rounded-full font-black text-[11px]">+5.2% 📈</span>
            </div>
            <div className="text-3xl font-black text-forest mt-2">
              ₹34.50 <span className="text-xs font-normal text-ink-2">/ kg</span>
            </div>
            <p className="text-[11px] text-ink-3 mt-1 font-medium">
              Min: ₹30.00 • Max: ₹38.00 • Updated Today
            </p>
          </div>

          <div className="p-5 bg-paper rounded-2xl border border-line">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
              <span>Pollachi Uzhavar Sandhai</span>
              <span className="text-forest bg-lime px-2.5 py-0.5 rounded-full font-black text-[11px]">+3.8% 📈</span>
            </div>
            <div className="text-3xl font-black text-forest mt-2">
              ₹36.00 <span className="text-xs font-normal text-ink-2">/ kg</span>
            </div>
            <p className="text-[11px] text-ink-3 mt-1 font-medium">
              Min: ₹32.00 • Max: ₹40.00 • Updated Today
            </p>
          </div>
        </div>
      </div>

      {/* GOVERNMENT SCHEMES MODULE */}
      <div className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <Landmark className="w-5 h-5 text-forest" />
          <h3 className="font-bold text-base text-forest">Government Agricultural Schemes & Subsidies</h3>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-paper rounded-2xl border border-line space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black text-forest bg-lime/40 border border-lime px-2.5 py-0.5 rounded-lg">
                Up to 90% Premium Subsidy
              </span>
              <a
                href="https://pmfby.gov.in"
                target="_blank"
                rel="noreferrer"
                className="min-h-[44px] px-3 text-xs font-bold text-forest hover:underline flex items-center gap-1.5"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <h4 className="font-black text-sm text-forest">
              Pradhan Mantri Fasal Bima Yojana (PMFBY) — Crop Insurance
            </h4>
            <p className="text-xs text-ink-2 leading-relaxed font-medium">
              Comprehensive yield insurance covering localized natural calamities, post-harvest losses, and disease outbreaks for horticultural crops.
            </p>
          </div>

          <div className="p-5 bg-paper rounded-2xl border border-line space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black text-emerald-950 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                100% Drip Irrigation Subsidy
              </span>
              <a
                href="https://tnhorticulture.tn.gov.in"
                target="_blank"
                rel="noreferrer"
                className="min-h-[44px] px-3 text-xs font-bold text-forest hover:underline flex items-center gap-1.5"
              >
                <span>TNHorticulture Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <h4 className="font-black text-sm text-forest">
              National Horticulture Mission (NHM) Micro-Irrigation Subsidy
            </h4>
            <p className="text-xs text-ink-2 leading-relaxed font-medium">
              Financial assistance for installing drip irrigation systems to reduce leaf surface wetness and prevent fungal outbreaks.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
