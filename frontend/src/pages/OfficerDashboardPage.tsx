import React, { useState, useEffect } from "react";
import { Users, Sprout, Activity, Download, Radio, MapPin, TrendingUp, AlertTriangle, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { fetchOfficerStats, broadcastOfficerAlertAPI } from "../services/api";

export const OfficerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Broadcast Alert Form (Blank initial state - no prefilled text or fake weather)
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOfficerStats("Coimbatore");
      if (data) {
        setStats(data);
      } else {
        setStats(null);
      }
    } catch {
      setError("Unable to load officer metrics. Please verify network connection.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastFeedback(null);
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmBroadcast = async () => {
    setShowConfirmModal(false);
    setBroadcasting(true);
    setBroadcastFeedback(null);

    try {
      await broadcastOfficerAlertAPI({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        district: "Coimbatore",
        crop: "Tomato",
        disease: "General Advisory"
      });
      setBroadcastFeedback({
        type: "success",
        message: "Alert broadcast successfully issued to farmers in Coimbatore District."
      });
      setBroadcastTitle("");
      setBroadcastMessage("");
    } catch (err: any) {
      setBroadcastFeedback({
        type: "error",
        message: err.message || "Failed to broadcast alert. Please try again."
      });
    } finally {
      setBroadcasting(false);
    }
  };

  const handleExportCSV = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
    window.open(`${apiBase}/officer/export-report.csv`, "_blank");
  };

  const hasLocationData = Boolean(stats?.heatmap_points && stats.heatmap_points.length > 0);
  const hasTrendData = Boolean(stats?.disease_trends && stats.disease_trends.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* HEADER - Neutral branding without governmental claims */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold text-blue-300 uppercase tracking-widest bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
            District Overview
          </span>
          <h2 className="text-2xl font-black text-blue-50 mt-1">District Officer Command Dashboard</h2>
          <p className="text-xs text-blue-200">Coimbatore District Agricultural Monitoring & Outbreak Response</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-blue-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div role="alert" className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadStats} className="underline font-bold text-amber-800 hover:text-amber-950 cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* OVERVIEW STATS - Real data only or honest empty states. No fake "money saved" or "accuracy". */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Stat 1: Registered Farmers */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Users className={`w-4 h-4 ${stats?.total_farmers !== undefined ? "text-blue-600" : "text-slate-400"}`} />
            <span>Registered Farmers</span>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mt-2" />
          ) : stats?.total_farmers !== undefined && stats?.total_farmers !== null ? (
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_farmers}</div>
          ) : (
            <div className="text-sm font-semibold text-slate-400 mt-2">No data yet</div>
          )}
        </div>

        {/* Stat 2: Fields Monitored */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Sprout className={`w-4 h-4 ${stats?.total_fields !== undefined ? "text-emerald-600" : "text-slate-400"}`} />
            <span>Fields Monitored</span>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mt-2" />
          ) : stats?.total_fields !== undefined && stats?.total_fields !== null ? (
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_fields}</div>
          ) : (
            <div className="text-sm font-semibold text-slate-400 mt-2">No data yet</div>
          )}
        </div>

        {/* Stat 3: Total AI Scans */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Activity className={`w-4 h-4 ${stats?.total_scans !== undefined ? "text-purple-600" : "text-slate-400"}`} />
            <span>Total AI Scans</span>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mt-2" />
          ) : stats?.total_scans !== undefined && stats?.total_scans !== null ? (
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_scans}</div>
          ) : (
            <div className="text-sm font-semibold text-slate-400 mt-2">No data yet</div>
          )}
        </div>

        {/* Stat 4: Active Outbreak Clusters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <AlertTriangle className={`w-4 h-4 ${stats?.active_outbreaks ? "text-amber-600" : "text-slate-400"}`} />
            <span>Active Outbreaks</span>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mt-2" />
          ) : stats?.active_outbreaks !== undefined && stats?.active_outbreaks !== null ? (
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.active_outbreaks}</div>
          ) : (
            <div className="text-sm font-semibold text-slate-400 mt-2">No data yet</div>
          )}
        </div>
      </div>

      {/* GEOSPATIAL DISEASE HEATMAP & TRENDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aggregated Disease Heatmap */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-base text-slate-900">District Outbreak Heatmap</h3>
            </div>
            {hasLocationData && (
              <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                {stats.heatmap_points.length} Hotspots
              </span>
            )}
          </div>

          {loading ? (
            <div className="aspect-video rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center">
              <span className="text-xs text-slate-400">Loading geospatial points...</span>
            </div>
          ) : !hasLocationData ? (
            <div className="aspect-video rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">No Location Data Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Geospatial disease clusters will automatically appear here once localized crop scans are recorded with GPS coordinates.
              </p>
            </div>
          ) : (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 p-4 flex flex-col justify-between">
              <div className="relative z-10 flex justify-between items-start text-xs text-white">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md font-mono text-[11px]">
                  📍 Coimbatore Agri Zone
                </span>
              </div>

              <div className="relative z-10 space-y-1.5 bg-black/75 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-xs text-slate-200 max-h-36 overflow-y-auto">
                {stats.heatmap_points.map((pt: any) => (
                  <div key={pt.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-300 font-medium">📍 {pt.location || `${pt.lat}, ${pt.lng}`}</span>
                    <span className="text-red-400 font-bold">{pt.disease}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Weekly Disease Trend Chart */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Weekly Disease Detection Trends</h3>
          </div>

          {loading ? (
            <div className="h-48 w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center">
              <span className="text-xs text-slate-400">Loading trend charts...</span>
            </div>
          ) : !hasTrendData ? (
            <div className="h-48 rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <TrendingUp className="w-5 h-5 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">No Trend Data Available Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Incidence progressions will be plotted here once sequential weekly diagnostic records are logged.
              </p>
            </div>
          ) : (
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.disease_trends} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="week" 
                    stroke="#64748b" 
                    fontSize={11}
                    label={{ value: "Timeline", position: "insideBottom", offset: -10, fontSize: 10, fill: "#64748b" }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11}
                    label={{ value: "Cases", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="Early Blight" stroke="#ef4444" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="Late Blight" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="Bacterial Spot" stroke="#8b5cf6" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* OFFICER BROADCAST ALERT SYSTEM */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Radio className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-base text-slate-900">Broadcast Disease Outbreak Warning to Farmers</h3>
        </div>

        {/* Feedback message */}
        {broadcastFeedback && (
          <div
            role="alert"
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              broadcastFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            {broadcastFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{broadcastFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleOpenConfirm} className="space-y-3 text-xs">
          <div>
            <label htmlFor="broadcast-title" className="block font-bold text-slate-700 uppercase mb-1">
              Alert Title:
            </label>
            <input
              id="broadcast-title"
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g., Early Blight Advisory for Coimbatore District"
              required
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-500 text-slate-900"
            />
          </div>
          <div>
            <label htmlFor="broadcast-message" className="block font-bold text-slate-700 uppercase mb-1">
              Alert Message:
            </label>
            <textarea
              id="broadcast-message"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter advisory details, affected zones, and recommended precautions..."
              required
              className="w-full h-24 p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-500 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={broadcasting || !broadcastTitle.trim() || !broadcastMessage.trim()}
            className="py-3 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {broadcasting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Radio className="w-4 h-4" />
            )}
            <span>Review & Broadcast Alert</span>
          </button>
        </form>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-black text-slate-900 text-base">Confirm Outbreak Broadcast</h3>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to broadcast this advisory? All registered farmers in <strong>Coimbatore District</strong> will receive this notification.
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p className="font-bold text-slate-800">Title: {broadcastTitle}</p>
              <p className="text-slate-600 line-clamp-3">{broadcastMessage}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBroadcast}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Confirm & Send Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
