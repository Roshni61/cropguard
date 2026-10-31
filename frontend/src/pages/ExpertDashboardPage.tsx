import React, { useState, useEffect } from "react";
import { 
  Stethoscope, CheckCircle, AlertTriangle, CheckCircle2, 
  AlertCircle, Loader2, MapPin, Eye, Calendar, Video,
  MessageSquare, ShieldCheck, Clock, RefreshCw
} from "lucide-react";
import { 
  fetchExpertCases, 
  reviewExpertCaseAPI,
  fetchMyConsultationsAPI,
  fetchVerifiedExpertsAPI,
  adminVerifyExpertAPI,
  type ConsultationItem,
  type ExpertProfileItem
} from "../services/api";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { useTranslation } from "../i18n/I18nContext";
import { ConsultationRoomModal } from "../components/ConsultationRoomModal";

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

  // Phase 6: Tab, Consultation & Directory States
  const [activeTab, setActiveTab] = useState<"queue" | "consultations" | "directory">("queue");
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);
  const [expertDirectory, setExpertDirectory] = useState<ExpertProfileItem[]>([]);
  const [activeConsultationRoom, setActiveConsultationRoom] = useState<ConsultationItem | null>(null);

  const loadConsultations = async () => {
    setIsLoadingConsultations(true);
    try {
      const data = await fetchMyConsultationsAPI();
      setConsultations(data || []);
    } catch {
      setConsultations([]);
    } finally {
      setIsLoadingConsultations(false);
    }
  };

  const loadExpertDirectory = async () => {
    try {
      const list = await fetchVerifiedExpertsAPI({ verification_status: "ALL" });
      setExpertDirectory(list || []);
    } catch {
      setExpertDirectory([]);
    }
  };

  const handleToggleVerification = async (expId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "VERIFIED" ? "PENDING" : "VERIFIED";
    try {
      await adminVerifyExpertAPI(expId, nextStatus as any);
      setExpertDirectory(prev => prev.map(e => e.id === expId ? { ...e, verification_status: nextStatus as any } : e));
      setFeedback({
        type: "success",
        message: `Accreditation status updated to ${nextStatus}.`
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to update accreditation."
      });
    }
  };

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
    loadConsultations();
    loadExpertDirectory();
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

      {/* PHASE 6: Master Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "queue"
              ? "bg-forest text-lime shadow-xs font-black"
              : "bg-paper text-ink-2 hover:bg-cream-card hover:text-ink"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Pathology Review Queue ({cases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("consultations");
            loadConsultations();
          }}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "consultations"
              ? "bg-forest text-lime shadow-xs font-black"
              : "bg-paper text-ink-2 hover:bg-cream-card hover:text-ink"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Live Farmer Consultations ({consultations.length})</span>
          {consultations.some(c => c.status === "CONFIRMED") && (
            <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("directory");
            loadExpertDirectory();
          }}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "directory"
              ? "bg-forest text-lime shadow-xs font-black"
              : "bg-paper text-ink-2 hover:bg-cream-card hover:text-ink"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Expert Profiles & Admin Accreditation ({expertDirectory.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: PATHOLOGY REVIEW QUEUE (HUMAN-IN-THE-LOOP)    */}
      {/* ======================================================== */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {/* Sub-Filters */}
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

                      <button
                        type="button"
                        onClick={() => {
                          const linked = consultations.find(c => c.case_id === item.id || c.scan_id === item.scan_id);
                          if (linked) {
                            setActiveConsultationRoom(linked);
                          } else {
                            setActiveConsultationRoom({
                              id: `cns-${item.id}`,
                              farmer_name: item.farmer_name,
                              farmer_phone: item.farmer_phone,
                              farmer_district: "Coimbatore",
                              expert_name: "Dr. S. Lakshmi (TNAU)",
                              consultation_type: "VIDEO",
                              problem_description: item.farmer_notes || `Reviewing ${item.crop} specimen: ${item.ai_disease}`,
                              crop: item.crop,
                              shared_image_url: item.image_url,
                              farmer_consent: true,
                              scheduled_time: "Immediate Review",
                              status: "CONFIRMED",
                              room_id: `room-${item.id}`,
                              created_at: "Today"
                            });
                          }
                        }}
                        className="py-2.5 px-4 bg-forest hover:bg-forest-hover text-cream font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95 ml-auto"
                      >
                        <Video className="w-4 h-4 text-lime" />
                        <span>Live Consultation</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

      {/* ======================================================== */}
      {/* SECTION 2: LIVE FARMER CONSULTATIONS & VIDEO ROOMS      */}
      {/* ======================================================== */}
      {activeTab === "consultations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div>
              <h3 className="text-base font-black text-forest">
                Scheduled Farmer Consultations & Appointments
              </h3>
              <p className="text-xs text-ink-2">
                Real-time WebRTC audio/video consultations, persistent chats, and clinical prescription desk.
              </p>
            </div>
            <button
              type="button"
              onClick={loadConsultations}
              className="p-2 text-ink-2 hover:text-forest transition cursor-pointer"
              title="Refresh Appointments"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingConsultations ? "animate-spin" : ""}`} />
            </button>
          </div>

          {isLoadingConsultations ? (
            <div className="p-12 text-center text-xs text-ink-2 bg-white rounded-3xl border border-line">
              Loading farmer appointments...
            </div>
          ) : consultations.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-line text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-forest">No Scheduled Consultations in Queue</h4>
              <p className="text-xs text-ink-2 max-w-sm mx-auto">
                Consultation requests booked by farmers will appear here with appointment slots and one-click WebRTC room access.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl p-6 border border-line shadow-xs hover:border-forest/40 space-y-4 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-line pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-forest/10 text-forest">
                          {c.id} • {c.crop}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          c.consultation_type === "VIDEO" ? "bg-purple-100 text-purple-900" : "bg-blue-100 text-blue-900"
                        }`}>
                          {c.consultation_type === "VIDEO" ? "📹 Live Video (WebRTC)" : "💬 Real-Time Chat"}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          c.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-950"
                            : c.status === "COMPLETED"
                            ? "bg-paper text-ink-2 border border-line"
                            : "bg-amber-100 text-amber-900"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <h4 className="font-black text-base text-forest mt-1">
                        {c.farmer_name}
                        <span className="text-xs font-normal text-ink-2 ml-2">
                          ({c.farmer_district} • {c.farmer_phone})
                        </span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink-2 flex items-center gap-1.5 bg-paper px-3 py-1.5 rounded-xl border border-line">
                        <Clock className="w-3.5 h-3.5 text-forest" />
                        <span>{c.scheduled_time}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Shared Image if present */}
                    {c.shared_image_url && (
                      <div
                        onClick={() => setPreviewImage({ url: c.shared_image_url!, title: `${c.crop} - Farmer Specimen` })}
                        className="cursor-pointer rounded-2xl overflow-hidden border border-line bg-black relative group aspect-video sm:aspect-auto"
                      >
                        <img
                          src={c.shared_image_url}
                          alt="Farmer shared crop scan"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Eye className="w-4 h-4" />
                          <span>Inspect Leaf Photo</span>
                        </div>
                      </div>
                    )}

                    <div className={c.shared_image_url ? "md:col-span-2 space-y-3" : "md:col-span-3 space-y-3"}>
                      <div className="p-3.5 bg-paper rounded-2xl border border-line text-xs space-y-1.5">
                        <span className="font-bold text-forest uppercase tracking-wider text-[10px]">
                          Farmer's Problem Description:
                        </span>
                        <p className="text-ink leading-relaxed font-medium">{c.problem_description}</p>
                      </div>

                      {c.expert_assessment && (
                        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1 text-emerald-950">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800">
                            Recorded Clinical Assessment:
                          </span>
                          <p className="leading-relaxed">{c.expert_assessment}</p>
                          {c.expert_treatment_recommendation && (
                            <p className="text-[11px] pt-1 text-emerald-900 border-t border-emerald-200">
                              <strong>Prescription:</strong> {c.expert_treatment_recommendation}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="text-[11px] font-mono text-ink-3">
                          Room ID: {c.room_id}
                        </span>

                        <button
                          type="button"
                          onClick={() => setActiveConsultationRoom(c)}
                          className="px-5 py-2.5 bg-forest hover:bg-forest-hover text-cream font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          {c.consultation_type === "VIDEO" ? (
                            <Video className="w-4 h-4 text-lime" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-lime" />
                          )}
                          <span>Enter {c.consultation_type === "VIDEO" ? "Video Call Room" : "Chat Room"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: VERIFIED EXPERT DIRECTORY & ADMIN WORKFLOW    */}
      {/* ======================================================== */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div>
              <h3 className="text-base font-black text-forest">
                Official Agricultural University & Extension Specialists
              </h3>
              <p className="text-xs text-ink-2">
                Accredited plant pathologists, entomologists, and agronomists across Tamil Nadu.
              </p>
            </div>
            <span className="text-[10px] bg-forest/10 text-forest font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Admin Accreditation Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expertDirectory.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-3xl p-5 border border-line shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={exp.avatar_url || "https://images.unsplash.com/photo-1594824813571-638f0263613b?auto=format&fit=crop&w=300&q=80"}
                        alt={exp.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-line shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-sm sm:text-base text-forest">{exp.name}</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            exp.verification_status === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}>
                            {exp.verification_status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-ink">{exp.designation}</p>
                        <p className="text-[11px] text-ink-2">{exp.institution}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-paper rounded-xl border border-line text-xs space-y-1">
                    <p>🎓 <strong>Qualifications:</strong> {exp.qualifications}</p>
                    <p>⏱️ <strong>Experience:</strong> {exp.experience_years} years in field pathology & diagnostics</p>
                    <p>🗣️ <strong>Languages:</strong> {exp.languages.join(", ")}</p>
                  </div>

                  {/* Specializations */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-wider">
                      Crop & Pathogen Specializations:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exp.specializations.map((spec, sIdx) => (
                        <span key={sIdx} className="text-[10px] bg-white border border-line px-2 py-0.5 rounded-md font-medium text-ink-2">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Available Consultation Slots */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-wider">
                      Clinic Consultation Hours:
                    </span>
                    <p className="text-xs text-ink-2">{exp.available_hours} ({exp.available_days.join(", ")})</p>
                  </div>
                </div>

                {/* Admin Accreditation Workflow Controls */}
                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-[11px] text-ink-3">
                    Rating: <strong>{exp.rating} ★</strong> ({exp.consultation_count} clinics)
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleVerification(exp.id, exp.verification_status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      exp.verification_status === "VERIFIED"
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-950"
                        : "bg-emerald-100 hover:bg-emerald-200 text-emerald-950"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{exp.verification_status === "VERIFIED" ? "Revoke (Audit)" : "Approve Accreditation"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 6: Active Real-Time Video / Chat Room Modal */}
      {activeConsultationRoom && (
        <ConsultationRoomModal
          isOpen={Boolean(activeConsultationRoom)}
          onClose={() => setActiveConsultationRoom(null)}
          consultation={activeConsultationRoom}
          currentUserRole="EXPERT"
          currentUserName="Dr. S. Lakshmi (TNAU)"
          onConsultationUpdated={() => {
            loadCases();
            loadConsultations();
          }}
        />
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
