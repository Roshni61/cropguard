import React, { useState, useEffect } from "react";
import { Stethoscope, CheckCircle, AlertTriangle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { fetchExpertCases, reviewExpertCaseAPI } from "../services/api";

export const ExpertDashboardPage: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpertCases();
      setCases(data || []);
    } catch {
      setError("Unable to retrieve escalated cases. Please verify your connection.");
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleVerify = async (caseId: string, verifiedStatus: string, defaultDiagnosis: string) => {
    setActionLoading(caseId);
    setFeedback(null);
    try {
      await reviewExpertCaseAPI({
        case_id: caseId,
        status: verifiedStatus,
        expert_diagnosis: defaultDiagnosis,
        expert_notes: notes[caseId] || "",
        expert_name: "Agricultural Pathology Specialist"
      });
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: verifiedStatus } : c));
      setFeedback({
        type: "success",
        message: `Case ${caseId} marked as ${verifiedStatus}.`
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to record expert decision. Please try again."
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-amber-900 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest bg-amber-950 px-3 py-1 rounded-full border border-amber-800">
            Agricultural Expert Portal
          </span>
          <h2 className="text-2xl font-black text-amber-50 mt-1">Human-in-the-Loop Review Queue</h2>
          <p className="text-xs text-amber-200">Review real low-confidence (below 60%) or severe crop disease escalations</p>
        </div>
        <Stethoscope className="w-12 h-12 text-amber-300 stroke-[1.5]" />
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div role="alert" className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadCases} className="underline font-bold text-amber-800 hover:text-amber-950 cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4 animate-pulse">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-28 bg-slate-100 rounded-2xl" />
                <div className="h-28 bg-slate-100 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : cases.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Queue is Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            There are currently no escalated crop scans requiring expert review. Any diagnoses with low AI confidence (&lt;60%) will appear here.
          </p>
        </div>
      ) : (
        /* Case List */
        <div className="space-y-4">
          {cases.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded uppercase">
                    {item.id} • {item.crop || "Crop"}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {item.farmer_name ? `Farmer: ${item.farmer_name}` : "Farmer escalation"} {item.field_name ? `(${item.field_name})` : ""}
                  </h3>
                </div>
                <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                  item.status === "PENDING" ? "bg-amber-100 text-amber-900 animate-pulse" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="font-bold text-slate-700 uppercase">AI Diagnosis Engine Prediction:</p>
                  <p className="text-sm font-black text-slate-900">{item.ai_disease || "Unspecified condition"}</p>
                  <div className="flex items-center gap-3 text-slate-600 font-medium">
                    {item.ai_confidence !== undefined && (
                      <span>Confidence: <strong className="text-amber-700">{Math.round(item.ai_confidence * 100)}%</strong></span>
                    )}
                    {item.ai_severity && (
                      <span>Severity: <strong className="text-red-700">{item.ai_severity}</strong></span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    ⚠️ Triggered review: Low AI confidence (&lt;60%) or complex lesion manifestation.
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`notes-${item.id}`} className="block text-xs font-bold text-slate-700 uppercase">
                    Expert Notes & Verification:
                  </label>
                  <textarea
                    id={`notes-${item.id}`}
                    value={notes[item.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                    placeholder="Enter expert diagnosis confirmation, pathogen details, or dosage correction..."
                    disabled={item.status !== "PENDING"}
                    className="w-full h-24 p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500 font-medium disabled:opacity-60"
                  />
                </div>
              </div>

              {item.status === "PENDING" && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleVerify(item.id, "VERIFIED", item.ai_disease || "Verified Diagnosis")}
                    disabled={actionLoading === item.id}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    {actionLoading === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>Verify AI Diagnosis</span>
                  </button>
                  <button
                    onClick={() => handleVerify(item.id, "CORRECTED", item.ai_disease || "Corrected Diagnosis")}
                    disabled={actionLoading === item.id}
                    className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    {actionLoading === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span>Correct Diagnosis</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
