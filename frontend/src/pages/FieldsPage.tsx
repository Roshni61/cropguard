import React, { useState } from "react";
import { TrendingUp, Plus } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";

export const FieldsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeField, setActiveField] = useState("fld-01");

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t("myFields")}</h2>
          <p className="text-xs text-slate-500">Green Valley Organics • Coimbatore</p>
        </div>
        <button className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" />
          <span>Add Field</span>
        </button>
      </div>

      {/* FIELD SELECTOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveField("fld-01")}
          className={`p-5 rounded-3xl border cursor-pointer transition shadow-sm ${
            activeField === "fld-01" ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
              Tomato Field A (North)
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
              Score: 82%
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1 font-medium">
            <p>Area: 2.4 acres • Variety: Arka Rakshak</p>
            <p>Crop Stage: <strong className="text-slate-800">Fruiting Stage</strong></p>
            <p>Soil: Red Loam • Drip Irrigation</p>
          </div>
        </div>

        <div
          onClick={() => setActiveField("fld-02")}
          className={`p-5 rounded-3xl border cursor-pointer transition shadow-sm ${
            activeField === "fld-02" ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
              Tomato Field B (South)
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Score: 94%
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1 font-medium">
            <p>Area: 2.1 acres • Variety: Pusa Ruby</p>
            <p>Crop Stage: <strong className="text-slate-800">Vegetative Stage</strong></p>
            <p>Soil: Black Cotton • Drip Irrigation</p>
          </div>
        </div>
      </div>

      {/* CROP HEALTH TIMELINE & FOLLOW-UP COMPARISON (REQUIREMENT 34 & 35) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Crop Health Timeline & Scan Follow-ups</h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            ↗ Trend: Improving
          </span>
        </div>

        {/* Scan History Items */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
          {/* Scan 1: Today */}
          <div className="relative flex items-start justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="absolute -left-[27px] top-4 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Early Blight (Alternaria solani)</span>
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  Moderate Severity
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Scanned Today at 09:15 AM • Confidence: 94% • Weather Spray Warning Issued
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
              Follow-up Scheduled
            </span>
          </div>

          {/* Scan 2: 7 days ago */}
          <div className="relative flex items-start justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="absolute -left-[27px] top-4 w-4 h-4 rounded-full bg-emerald-300 border-2 border-white" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Septoria Leaf Spot</span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                  Mild Severity
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Scanned 7 Days Ago • Applied Neem Extract 5% • Resolved
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-lg">
              Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
