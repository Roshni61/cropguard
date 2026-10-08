import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, Clock } from "lucide-react";
import { getOfflineScans } from "../offline/db";
import { syncOfflineScansWithServer } from "../services/api";

export const SyncBadge: React.FC = () => {
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkCount = async () => {
    const items = await getOfflineScans();
    const pending = items.filter(i => i.sync_status === "SAVED_OFFLINE");
    setOfflineCount(pending.length);
  };

  useEffect(() => {
    checkCount();
    const interval = setInterval(checkCount, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncOfflineScansWithServer();
    await checkCount();
    setIsSyncing(false);
  };

  return (
    <button
      onClick={handleSync}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition ${
        isSyncing
          ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
          : offlineCount > 0
          ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
      }`}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : offlineCount > 0 ? (
        <>
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>🟡 {offlineCount} Saved Offline (Tap to Sync)</span>
        </>
      ) : (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>🟢 Synced</span>
        </>
      )}
    </button>
  );
};
