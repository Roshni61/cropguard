import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, CloudUpload } from "lucide-react";
import { getOfflineScans } from "../offline/db";
import { syncOfflineScansWithServer } from "../services/api";

type State = "online" | "offline" | "pending" | "syncing" | "synced" | "failed";

const META: Record<State, { label: string; cls: string; Icon: React.ElementType }> = {
  online: { label: "Online", cls: "bg-lime/15 text-lime border-lime/30", Icon: Wifi },
  offline: { label: "Offline", cls: "bg-amber-400/20 text-amber-200 border-amber-400/40", Icon: WifiOff },
  pending: { label: "Sync pending", cls: "bg-amber-400/25 text-amber-200 border-amber-400/40", Icon: CloudUpload },
  syncing: { label: "Syncing", cls: "bg-white/20 text-white border-white/30", Icon: RefreshCw },
  synced: { label: "Sync complete", cls: "bg-lime/20 text-lime border-lime/40", Icon: CheckCircle2 },
  failed: { label: "Sync failed", cls: "bg-red-400/25 text-red-200 border-red-400/40", Icon: AlertCircle },
};

export const SyncBadge: React.FC = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"synced" | "failed" | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const count = useCallback(async () => {
    try {
      const items = await getOfflineScans();
      setPending(items.filter(i => i.sync_status === "SAVED_OFFLINE").length);
    } catch {
      // offline db fallback
    }
  }, []);

  useEffect(() => {
    // Initial load
    count();
    const id = setInterval(count, 4000);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, [count]);

  const sync = async () => {
    if (!online || busy) return;
    setBusy(true);
    setResult(null);
    try {
      await syncOfflineScansWithServer();
      setResult("synced");
      setLastSync(new Date());
    } catch {
      setResult("failed");
    }
    await count();
    setBusy(false);
    setTimeout(() => setResult(null), 4000);
  };

  const state: State = busy 
    ? "syncing" 
    : result ?? (!online ? "offline" : pending > 0 ? "pending" : "online");
  const { label, cls, Icon } = META[state];

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(o => !o)} 
        aria-expanded={open} 
        aria-label={`Network status: ${label}`}
        className={`flex min-h-8 sm:min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-all duration-200 hover:scale-102 cursor-pointer ${cls}`}
      >
        <Icon className={`h-3.5 w-3.5 shrink-0 ${state === "syncing" ? "animate-spin" : ""}`} aria-hidden />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span 
            key={state} 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3 }} 
            transition={{ duration: 0.16 }} 
            role="status"
          >
            {label}{pending > 0 && state !== "synced" ? ` · ${pending}` : ""}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }} 
            transition={{ duration: 0.2 }} 
            className="absolute right-0 z-50 mt-2.5 w-80 rounded-3xl border border-line bg-white p-5 text-sm text-ink shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-line mb-3">
              <span className="font-black text-forest text-sm">Offline Field Architecture</span>
              <span className="text-[10px] bg-forest/10 text-forest px-2 py-0.5 rounded-full font-bold">
                IndexedDB Local
              </span>
            </div>

            <ul className="space-y-1.5 text-xs text-ink-2">
              <li className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <span>✓</span> <span>All local leaf scans stored on device</span>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <span>✓</span> <span>Automated server sync on reconnect</span>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <span>✓</span> <span>Cached weather & agronomic guidance</span>
              </li>
              <li className="flex items-center gap-1.5 text-ink-3">
                <span>•</span> <span>Live cloud model inference requires connection</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs text-ink-3">
              <span>Last session sync:</span>
              <span className="font-semibold text-ink-2">
                {lastSync ? lastSync.toLocaleTimeString() : "Pending sync"}
              </span>
            </div>

            <button 
              onClick={sync} 
              disabled={!online || busy || pending === 0} 
              className="mt-3 min-h-10 w-full rounded-full bg-forest hover:bg-forest-hover font-bold text-cream text-xs disabled:opacity-40 shadow-sm transition cursor-pointer"
            >
              {pending ? `Sync ${pending} Pending Scan${pending > 1 ? "s" : ""}` : "All Scans Up to Date"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
