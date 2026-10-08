import React, { useState } from "react";
import { Users, Sprout, Activity, Download, Radio, MapPin, TrendingUp, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const mockTrendsData = [
  { week: "W1", EarlyBlight: 4, LateBlight: 1, BacterialSpot: 2 },
  { week: "W2", EarlyBlight: 8, LateBlight: 3, BacterialSpot: 3 },
  { week: "W3", EarlyBlight: 14, LateBlight: 2, BacterialSpot: 4 },
  { week: "W4", EarlyBlight: 17, LateBlight: 5, BacterialSpot: 3 },
];

export const OfficerDashboardPage: React.FC = () => {
  const [broadcastTitle, setBroadcastTitle] = useState("⚠️ Early Blight Outbreak Advisory");
  const [broadcastMessage, setBroadcastMessage] = useState("High humidity (78%) in Pollachi area elevates fungal risk. Inspect tomato crops today.");

  const handleBroadcast = () => {
    alert(`Alert "${broadcastTitle}" broadcasted to 120 farmers in Coimbatore District.`);
  };

  const handleExportCSV = () => {
    window.open("http://localhost:8000/api/v1/officer/export-report.csv", "_blank");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-300 uppercase tracking-widest bg-blue-950 px-3 py-1 rounded-full">
            Department of Agriculture • Govt of Tamil Nadu
          </span>
          <h2 className="text-2xl font-black text-blue-50 mt-1">District Officer Command Dashboard</h2>
          <p className="text-xs text-blue-200">Coimbatore District Agricultural Monitoring & Outbreak Response</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-blue-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* OVERVIEW STATS (REQUIREMENT 40) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Registered Farmers</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">121</div>
          <span className="text-[10px] text-emerald-600 font-bold">+12 this week</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Fields Monitored</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">187</div>
          <span className="text-[10px] text-slate-500 font-bold">450 acres</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Total AI Scans</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">413</div>
          <span className="text-[10px] text-purple-600 font-bold">94% accuracy</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Money Saved</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">₹2,45,000</div>
          <span className="text-[10px] text-emerald-600 font-bold">Estimated crop loss prevented</span>
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
            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
              4 Hotspots
            </span>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 p-4 flex flex-col justify-between">
            {/* Visual Heatmap representation */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/40 via-amber-500/20 to-slate-950 opacity-80 pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start text-xs text-white">
              <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md font-mono">
                📍 Coimbatore Agri Zone (11.0168° N, 76.9558° E)
              </span>
            </div>

            <div className="relative z-10 space-y-1 bg-black/70 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-xs text-slate-200">
              <div className="flex items-center justify-between text-red-400 font-bold">
                <span>🔴 Pollachi-Coimbatore Belt</span>
                <span>17 Cases (Early Blight)</span>
              </div>
              <div className="flex items-center justify-between text-amber-300 font-medium">
                <span>🟡 Thondamuthur Zone</span>
                <span>5 Cases (Late Blight)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Disease Trend Chart */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Weekly Disease Detection Trends</h3>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="EarlyBlight" stroke="#ef4444" strokeWidth={3} name="Early Blight" />
                <Line type="monotone" dataKey="LateBlight" stroke="#f59e0b" strokeWidth={2} name="Late Blight" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* OFFICER BROADCAST ALERT SYSTEM (REQUIREMENT 41) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Radio className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-base text-slate-900">Broadcast Disease Outbreak Warning to Farmers</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Alert Title:</label>
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Alert Message:</label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full h-20 p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-500 text-slate-900"
            />
          </div>

          <button
            onClick={handleBroadcast}
            className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Broadcast Outbreak Alert Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
