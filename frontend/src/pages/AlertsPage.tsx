import React from "react";
import { Radio } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";

interface AlertsPageProps {
  riskData: any;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ riskData }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t("nearbyAlerts")}</h2>
          <p className="text-xs text-slate-500">Geospatial Outbreak Intelligence • Coimbatore District</p>
        </div>
        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full border border-red-300 flex items-center gap-1.5 animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          <span>Live Outbreak Network</span>
        </span>
      </div>

      {/* RISK PREDICTOR WIDGET (REQUIREMENT 32) */}
      <div className="bg-gradient-to-br from-amber-500 to-red-600 text-white rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full">
            Outbreak Risk Score: {riskData.risk_score_percent}%
          </span>
          <span className="text-xs font-black bg-white text-red-700 px-2.5 py-1 rounded-lg">
            HIGH RISK
          </span>
        </div>
        <h3 className="text-xl font-black">Early Blight Risk Warning — Coimbatore District</h3>
        <p className="text-xs text-amber-100 leading-relaxed font-medium">
          {riskData.advisory}
        </p>

        <div className="pt-2 border-t border-white/20 text-xs space-y-1">
          <p className="font-bold text-amber-100 uppercase text-[10px]">Contributing Factors:</p>
          {riskData.contributing_factors?.map((f: string, i: number) => (
            <p key={i} className="text-white">▪ {f}</p>
          ))}
        </div>
      </div>

      {/* BROADCASTED OFFICER ALERTS */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Official Advisory Broadcasts</h3>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded">
              ⚠️ Early Blight Alert
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Issued Today at 08:30 AM</span>
          </div>
          <p className="text-xs font-bold text-slate-900">
            District Agriculture Officer V. Arumugam:
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Multiple Early Blight cases (17 reported) detected within an 8km radius in Pollachi-Coimbatore agricultural belt. High relative humidity (78%) favours spore spread. Tomato farmers are advised to inspect foliage today.
          </p>
        </div>
      </div>
    </div>
  );
};
