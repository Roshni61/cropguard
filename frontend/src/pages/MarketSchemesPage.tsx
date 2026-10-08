import React from "react";
import { TrendingUp, Landmark, ExternalLink } from "lucide-react";

export const MarketSchemesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Market Prices & Govt Schemes</h2>
          <p className="text-xs text-slate-500">Live APMC Mandi Rates & Financial Subsidies</p>
        </div>
      </div>

      {/* MARKET PRICES MODULE */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">Tomato Market Rates (Coimbatore District)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Coimbatore MGR Wholesale Market</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-extrabold">+5.2% 📈</span>
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-1">
              ₹34.50 <span className="text-xs font-normal text-slate-600">/ kg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Min: ₹30.00 • Max: ₹38.00 • Updated Today
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Pollachi Uzhavar Sandhai</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-extrabold">+3.8% 📈</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹36.00 <span className="text-xs font-normal text-slate-600">/ kg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Min: ₹32.00 • Max: ₹40.00 • Updated Today
            </p>
          </div>
        </div>
      </div>

      {/* GOVERNMENT SCHEMES MODULE */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Landmark className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-base text-slate-900">Government Agricultural Schemes & Subsidies</h3>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded">
                Up to 90% Premium Subsidy
              </span>
              <a
                href="https://pmfby.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <h4 className="font-black text-sm text-slate-900">
              Pradhan Mantri Fasal Bima Yojana (PMFBY) — Crop Insurance
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Comprehensive yield insurance covering localized natural calamities, post-harvest losses, and disease outbreaks for horticultural crops.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                100% Drip Irrigation Subsidy
              </span>
              <a
                href="https://tnhorticulture.tn.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>TNHorticulture Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <h4 className="font-black text-sm text-slate-900">
              National Horticulture Mission (NHM) Micro-Irrigation Subsidy
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Financial assistance for installing drip irrigation systems to reduce leaf surface wetness and prevent fungal outbreaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
