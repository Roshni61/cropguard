import React, { useState, useEffect } from "react";
import { Radio, AlertCircle } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { fetchOfficerAlerts } from "../services/api";

interface AlertsPageProps {
  riskData: any;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ riskData }) => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOfficerAlerts(riskData?.district || "Coimbatore");
      setAlerts(data || []);
    } catch {
      setError("Unable to load officer broadcast notices. Please verify your connection.");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [riskData?.district]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t("nearbyAlerts")}</h2>
          <p className="text-xs text-slate-500">Geospatial Outbreak Intelligence • {riskData?.district || "Coimbatore"} District</p>
        </div>
        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full border border-red-300 flex items-center gap-1.5 animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          <span>Live Outbreak Network</span>
        </span>
      </div>

      {/* RISK PREDICTOR WIDGET */}
      {riskData && (
        <div className="bg-gradient-to-br from-amber-500 to-red-600 text-white rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full">
              Outbreak Risk Score: {riskData.risk_score_percent}%
            </span>
            <span className="text-xs font-black bg-white text-red-700 px-2.5 py-1 rounded-lg uppercase">
              {riskData.risk_level || "EVALUATING"} RISK
            </span>
          </div>
          <h3 className="text-xl font-black">
            {riskData.crop || "Crop"} Disease Advisory — {riskData.district || "District"}
          </h3>
          <p className="text-xs text-amber-100 leading-relaxed font-medium">
            {riskData.advisory}
          </p>

          {riskData.contributing_factors && riskData.contributing_factors.length > 0 && (
            <div className="pt-2 border-t border-white/20 text-xs space-y-1">
              <p className="font-bold text-amber-100 uppercase text-[10px]">Contributing Factors:</p>
              {riskData.contributing_factors.map((f: string, i: number) => (
                <p key={i} className="text-white">▪ {f}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BROADCASTED OFFICER ALERTS */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Official Advisory Broadcasts</h3>

        {error && (
          <div role="alert" className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadAlerts} className="underline font-bold text-amber-800 hover:text-amber-950 cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2 animate-pulse">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-40 bg-slate-100 rounded" />
                <div className="h-10 w-full bg-slate-50 rounded" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          /* Honest Empty State when no real broadcasts exist */
          <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-700">No Active Outbreak Advisories</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              When regional agriculture officers issue advisories, verified notifications will be broadcasted here in real time.
            </p>
          </div>
        ) : (
          /* Real Alerts */
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded">
                    ⚠️ {alert.title}
                  </span>
                  {alert.created_at && (
                    <span className="text-[10px] text-slate-400 font-bold">{alert.created_at}</span>
                  )}
                </div>
                {alert.sender_name && (
                  <p className="text-xs font-bold text-slate-900">
                    {alert.sender_name}:
                  </p>
                )}
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
