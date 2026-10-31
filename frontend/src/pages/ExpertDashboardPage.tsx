import React, { useState, useEffect } from "react";
import { 
  Stethoscope, CheckCircle, AlertTriangle, CheckCircle2, 
  AlertCircle, Loader2, MapPin, Eye, Calendar
} from "lucide-react";
import { fetchExpertCases, reviewExpertCaseAPI } from "../services/api";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { useTranslation } from "../i18n/I18nContext";

export const ExpertDashboardPage: React.FC = () => {
  const { language } = useTranslation();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "VERIFIED" | "CORRECTED">("ALL");
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

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
        expert_name: "Dr. S. Lakshmi (TNAU Plant Pathologist)"
      });
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: verifiedStatus, expert_notes: notes[caseId] || c.expert_notes } : c));
      setFeedback({
        type: "success",
        message: `Case ${caseId} marked as ${verifiedStatus} by Pathologist.`
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

  const filteredCases = cases.filter(c => {
    if (statusFilter === "ALL") return true;
    return c.status === statusFilter;
  });

  const pendingCount = cases.filter(c => c.status === "PENDING").length;
  const verifiedCount = cases.filter(c => c.status === "VERIFIED").length;
  const correctedCount = cases.filter(c => c.status === "CORRECTED").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-forest farm-gradient-fallback text-white rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-lift)] border border-forest-2 flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 text-lime rounded-full text-xs font-semibold backdrop-blur-xs border border-lime/30">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Pathology Verification Queue</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Agricultural Expert Review Portal
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            Human-in-the-loop review for low AI confidence (&lt;60%) diagnoses and high-risk pathogen alerts across Tamil Nadu.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] text-white/70 block uppercase">Pending</span>
            <span className="text-xl font-black text-amber-300">{pendingCount}</span>
          </div>
          <div className="bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] text-white/70 block uppercase">Verified</span>
            <span className="text-xl font-black text-emerald-300">{verifiedCount}</span>
          </div>
          <div className="bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] text-white/70 block uppercase">Corrected</span>
            <span className="text-xl font-black text-teal-300">{correctedCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Feedback Notification */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 transition animate-in fade-in ${
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
          <span className="font-medium">{feedback.message}</span>
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

      {/* 3. Filter Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-forest text-white shadow-xs font-black"
              : "bg-paper text-ink-2 hover:text-ink"
          }`}
        >
          <span>All Cases ({cases.length})</span>
        </button>

        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            statusFilter === "PENDING"
              ? "bg-amber-500 text-amber-950 shadow-xs font-black"
              : "bg-paper text-ink-2 hover:text-ink"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
          <span>Pending Review ({pendingCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter("VERIFIED")}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            statusFilter === "VERIFIED"
              ? "bg-emerald-600 text-white shadow-xs font-black"
              : "bg-paper text-ink-2 hover:text-ink"
          }`}
        >
          <span>Verified ({verifiedCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter("CORRECTED")}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            statusFilter === "CORRECTED"
              ? "bg-teal-700 text-white shadow-xs font-black"
              : "bg-paper text-ink-2 hover:text-ink"
          }`}
        >
          <span>Corrected ({correctedCount})</span>
        </button>
      </div>

      {/* 4. Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 shadow-sm border border-line space-y-4 animate-pulse">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-32 bg-slate-100 rounded-2xl" />
                <div className="h-32 bg-slate-100 rounded-2xl md:col-span-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        /* Meaningful Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-line shadow-[var(--shadow-soft)] space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-forest">Review Queue is Clear</h3>
          <p className="text-xs text-ink-2 max-w-sm mx-auto leading-relaxed">
            There are currently no cases matching filter "{statusFilter}". Any diagnostic scans with AI confidence below 60% or severe foliar necrosis are queued here for pathology verification.
          </p>
        </div>
      ) : (
        /* 5. Comprehensive Case Review Cards */
        <div className="space-y-4">
          {filteredCases.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4 hover:border-forest/40 transition-colors"
            >
              {/* Card Top: Case Identifier & Status Badge */}
              <div className="flex items-center justify-between border-b border-line pb-3 flex-wrap gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black font-mono text-forest bg-forest/10 px-2.5 py-0.5 rounded-full uppercase">
                      {item.id} • {item.crop}
                    </span>
                    <span className="text-[11px] text-ink-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.created_at || "Recent"}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-black text-forest mt-1">
                    {item.farmer_name || "Grower Escalation"}
                    <span className="text-xs font-normal text-ink-2 ml-1.5">
                      ({item.field_name || "Unassigned Field"})
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                    item.status === "PENDING"
                      ? "bg-amber-100 text-amber-900 border border-amber-200 animate-pulse"
                      : item.status === "VERIFIED"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                      : "bg-teal-100 text-teal-900 border border-teal-200"
                  }`}>
                    {item.status === "PENDING" ? "⏳ Pending Review" : item.status === "VERIFIED" ? "✓ Verified" : "✎ Corrected"}
                  </span>
                </div>
              </div>

              {/* Card Body: Real Image + Diagnosis Details + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Real Crop Photograph with Fallback */}
                <div className="md:col-span-1 space-y-2">
                  <div 
                    onClick={() => setPreviewImage({ url: item.image_url, title: `${item.crop} - ${item.ai_disease}` })}
                    className="cursor-pointer group relative rounded-2xl overflow-hidden shadow-xs border border-line"
                  >
                    <ImageWithFallback
                      src={item.image_url}
                      alt={`${item.crop} specimen leaf showing ${item.ai_disease}`}
                      aspectRatioClass="aspect-video"
                      language={language}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Zoom Specimen</span>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="p-2.5 bg-paper rounded-xl border border-line text-xs flex items-center gap-2 text-ink-2">
                    <MapPin className="w-3.5 h-3.5 text-forest-2 shrink-0" />
                    <span className="truncate font-medium">{item.location || "Coimbatore, Tamil Nadu"}</span>
                  </div>
                </div>

                {/* AI Suspected Disease & Metrics */}
                <div className="md:col-span-2 space-y-3">
                  <div className="p-4 bg-paper rounded-2xl border border-line space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-forest uppercase tracking-wider text-[10px]">
                        AI Suspected Pathogen / Disease:
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.ai_severity === "Severe" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.ai_severity || "Moderate"} Severity
                      </span>
                    </div>

                    <p className="text-base font-black text-forest">{item.ai_disease || "Early Blight"}</p>

                    {/* Confidence Gauge */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-semibold text-ink-2">
                        <span>Model Confidence:</span>
                        <strong className={item.ai_confidence < 0.6 ? "text-amber-700" : "text-emerald-700"}>
                          {Math.round((item.ai_confidence || 0.58) * 100)}%
                        </strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-line overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.ai_confidence < 0.6 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.round((item.ai_confidence || 0.58) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Flag Reason */}
                    <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{item.flag_reason || "Escalated for human verification: Confidence below safety threshold (<60%)."}</span>
                    </div>
                  </div>

                  {/* Expert Verification Notes */}
                  <div className="space-y-1.5">
                    <label htmlFor={`notes-${item.id}`} className="block text-xs font-bold text-forest uppercase tracking-wider">
                      Pathologist Clinical Notes & Guidance:
                    </label>
                    <textarea
                      id={`notes-${item.id}`}
                      value={notes[item.id] !== undefined ? notes[item.id] : item.expert_notes || ""}
                      onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                      placeholder="Enter verified diagnostic determination, pathogen confirmation, or dosage adjustment..."
                      disabled={item.status !== "PENDING"}
                      className="w-full h-20 p-3 bg-paper border border-line rounded-xl text-xs text-ink outline-none focus:border-forest font-medium disabled:opacity-60 transition"
                    />
                  </div>

                  {/* Actions for Pending Cases */}
                  {item.status === "PENDING" && (
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => handleVerify(item.id, "VERIFIED", item.ai_disease || "Early Blight")}
                        disabled={actionLoading === item.id}
                        className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-lime" />
                        )}
                        <span>Confirm AI Diagnosis</span>
                      </button>

                      <button
                        onClick={() => handleVerify(item.id, "CORRECTED", "Alternaria solani (Early Blight confirmed with secondary Cercospora)")}
                        disabled={actionLoading === item.id}
                        className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        <span>Submit Corrected Advisory</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Full-Size Specimen Preview */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-forest">{previewImage.title}</h4>
              <button 
                onClick={() => setPreviewImage(null)}
                className="text-xs bg-paper px-2.5 py-1 rounded-full font-bold text-ink-2 hover:bg-line cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <img 
              src={previewImage.url} 
              alt={previewImage.title}
              className="w-full max-h-[70vh] object-contain rounded-2xl bg-black"
            />
            <p className="text-[11px] text-ink-3 text-center">
              TNAU Plant Pathology Reference Specimen • High Resolution Macro Inspection
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
