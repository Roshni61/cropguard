import React, { useState, useEffect } from "react";
import { Radio, AlertCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "../i18n/I18nContext";
import { fetchOfficerAlerts } from "../services/api";

interface AlertsPageProps {
  riskData: any;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ riskData }) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
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
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="max-w-2xl mx-auto space-y-6 pb-16"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">{t("nearbyAlerts")}</h2>
          <p className="text-xs text-ink-2">Geospatial Outbreak Intelligence • {riskData?.district || "Coimbatore"} District</p>
        </div>
        <span className="px-3 py-1 bg-orange-100 text-orange-900 text-xs font-bold rounded-full border border-orange-200 flex items-center gap-1.5 shadow-xs">
          <Radio className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
          <span>Live Outbreak Network</span>
        </span>
      </div>

      {/* RISK PREDICTOR WIDGET */}
      {riskData && (
        <div className="bg-forest farm-gradient-fallback text-white rounded-3xl p-6 sm:p-7 shadow-[var(--shadow-lift)] border border-forest-2 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-lime/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-lime border border-white/10">
              Outbreak Risk Score: {riskData.risk_score_percent}%
            </span>
            <span className="text-xs font-black bg-amber-400 text-amber-950 px-2.5 py-1 rounded-lg uppercase shadow-xs">
              {riskData.risk_level || "EVALUATING"} RISK
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {riskData.crop || "Crop"} Disease Advisory — {riskData.district || "District"}
          </h3>

          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
            {riskData.advisory}
          </p>

          {riskData.contributing_factors && riskData.contributing_factors.length > 0 && (
            <div className="pt-3 border-t border-white/20 text-xs space-y-1.5">
              <p className="font-bold text-lime uppercase text-[11px] tracking-wider">Contributing Risk Factors:</p>
              {riskData.contributing_factors.map((f: string, i: number) => (
                <p key={i} className="text-white/85 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
                  <span>{f}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BROADCASTED OFFICER ALERTS */}
      <div className="space-y-3">
        <h3 className="font-black text-xs text-forest uppercase tracking-wider">Official Advisory Broadcasts</h3>

        {error && (
          <div role="alert" className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between text-orange-950 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              type="button"
              onClick={loadAlerts} 
              className="min-h-[44px] px-3 font-bold text-orange-900 underline hover:text-orange-950 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-5 shadow-sm border border-line space-y-2 skeleton-shimmer">
                <div className="h-4 w-32 bg-paper rounded" />
                <div className="h-3 w-48 bg-paper rounded" />
                <div className="h-10 w-full bg-paper rounded" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          /* Honest Empty State when no real broadcasts exist */
          <div className="bg-white rounded-3xl p-8 border border-dashed border-line text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-paper border border-line flex items-center justify-center mx-auto text-forest">
              <Radio className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="font-black text-sm text-forest">No Active Outbreak Advisories</h4>
            <p className="text-xs text-ink-2 max-w-sm mx-auto leading-relaxed">
              When regional agriculture officers issue advisories, verified notifications will be broadcasted here in real time.
            </p>
          </div>
        ) : (
          /* Real Alerts */
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-900 bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-xl">
                    ⚠️ {alert.title}
                  </span>
                  {alert.created_at && (
                    <span className="text-[10px] text-ink-3 font-bold">{alert.created_at}</span>
                  )}
                </div>
                {alert.sender_name && (
                  <p className="text-xs font-bold text-forest">
                    {alert.sender_name}:
                  </p>
                )}
                <p className="text-xs text-ink-2 leading-relaxed font-normal">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
