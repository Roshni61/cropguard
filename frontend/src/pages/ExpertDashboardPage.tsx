import React, { useState } from "react";
import { Stethoscope, CheckCircle, AlertTriangle } from "lucide-react";

export const ExpertDashboardPage: React.FC = () => {
  const [cases, setCases] = useState<any[]>([
    {
      id: "case-10291",
      farmer_name: "Ramesh Kumar",
      field_name: "Tomato Field A",
      crop: "Tomato",
      ai_disease: "Early Blight (Alternaria solani)",
      ai_confidence: 0.54,
      ai_severity: "Severe",
      status: "PENDING",
      grad_cam_url: "",
      created_at: "2026-10-08 09:30"
    }
  ]);
  const [reviewNotes, setReviewNotes] = useState("");

  const handleVerify = (caseId: string, verifiedStatus: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: verifiedStatus } : c));
    alert(`Case ${caseId} marked as ${verifiedStatus} by Expert Dr. S. Lakshmi.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-amber-900 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest bg-amber-950 px-3 py-1 rounded-full">
            Agricultural Expert Portal
          </span>
          <h2 className="text-2xl font-black text-amber-50 mt-1">Human-in-the-Loop Review Queue</h2>
          <p className="text-xs text-amber-200">Review low-confidence (below 60%) or severe crop disease escalations</p>
        </div>
        <Stethoscope className="w-12 h-12 text-amber-300 stroke-[1.5]" />
      </div>

      <div className="space-y-4">
        {cases.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded uppercase">
                  {item.id} • {item.crop}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Farmer: {item.farmer_name} ({item.field_name})
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
                <p className="text-sm font-black text-slate-900">{item.ai_disease}</p>
                <div className="flex items-center gap-3 text-slate-600 font-medium">
                  <span>Confidence: <strong className="text-amber-700">{Math.round(item.ai_confidence * 100)}%</strong></span>
                  <span>Severity: <strong className="text-red-700">{item.ai_severity}</strong></span>
                </div>
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  ⚠️ Triggered human review: Low AI confidence (&lt;60%) and severe lesion symptoms.
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Expert Notes & Verification:</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter expert diagnosis confirmation, pathogen details, or dosage correction..."
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            {item.status === "PENDING" && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleVerify(item.id, "VERIFIED")}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify AI Diagnosis</span>
                </button>
                <button
                  onClick={() => handleVerify(item.id, "CORRECTED")}
                  className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Correct Diagnosis</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
