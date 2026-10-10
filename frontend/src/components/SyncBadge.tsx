import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, CloudUpload } from "lucide-react";
import { getOfflineScans } from "../offline/db";
import { syncOfflineScansWithServer } from "../services/api";

type State = "online" | "offline" | "pending" | "syncing" | "synced" | "failed";

const META: Record<State, { label: string; cls: string; Icon: React.ElementType }> = {
  online: { label: "Online", cls: "bg-lime/40 text-forest border-lime", Icon: Wifi },
  offline: { label: "Offline", cls: "bg-amber-100 text-amber-900 border-amber-300", Icon: WifiOff },
  pending: { label: "Sync pending", cls: "bg-amber-100 text-amber-900 border-amber-300", Icon: CloudUpload },
  syncing: { label: "Syncing", cls: "bg-white text-forest border-line", Icon: RefreshCw },
  synced: { label: "Sync complete", cls: "bg-lime/40 text-forest border-lime", Icon: CheckCircle2 },
  failed: { label: "Sync failed", cls: "bg-red-50 text-red-800 border-red-300", Icon: AlertCircle },
};

export const SyncBadge: React.FC = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"synced" | "failed" | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  const count = useCallback(async () => {
    const items = await getOfflineScans();
    setPending(items.filter(i => i.sync_status === "SAVED_OFFLINE").length);
  }, []);

  useEffect(() => {
    count();
    const id = setInterval(count, 4000);
    const up = () => setOnline(true), down = () => setOnline(false);
    window.addEventListener("online", up); window.addEventListener("offline", down);
    return () => { clearInterval(id); window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, [count]);

  const sync = async () => {
    if (!online || busy) return;
    setBusy(true); setResult(null);
    try { await syncOfflineScansWithServer(); setResult("synced"); setLastSync(new Date()); }
    catch { setResult("failed"); }
    await count(); setBusy(false);
    setTimeout(() => setResult(null), 4000);
  };

  const state: State = busy ? "syncing" : result ?? (!online ? "offline" : pending > 0 ? "pending" : "online");
  const { label, cls, Icon } = META[state];

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} className={`flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors duration-300 ${cls}`}>
        <Icon className={`h-3.5 w-3.5 ${state === "syncing" ? "animate-spin" : ""}`} aria-hidden />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={state} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} role="status">
            {label}{pending > 0 && state !== "synced" ? ` · ${pending}` : ""}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-line bg-white p-4 text-sm shadow-[var(--shadow-soft)]">
            <p className="font-semibold text-forest">Works without a network</p>
            <ul className="mt-2 space-y-1 text-ink-2">
              <li>✓ Saved scan history</li>
              <li>✓ Queueing new scans for later sync</li>
              <li>✓ Previously cached guidance</li>
              <li>✗ Image analysis, weather, live alerts (need the server; no on-device model is bundled)</li>
            </ul>
            <p className="mt-3 text-xs text-ink-2">Last sync: {lastSync ? lastSync.toLocaleTimeString() : "none this session"}</p>
            <button onClick={sync} disabled={!online || busy || pending === 0} className="mt-3 min-h-10 w-full rounded-xl bg-forest font-semibold text-lime disabled:opacity-40">
              {pending ? `Sync ${pending} saved scan${pending > 1 ? "s" : ""}` : "Nothing to sync"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
