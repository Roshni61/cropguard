import { openDB } from "idb";
import type { DBSchema } from "idb";

interface CropGuardDBSchema extends DBSchema {
  offline_scans: {
    key: string;
    value: {
      client_scan_id: string;
      field_id: string;
      field_name: string;
      disease_name: string;
      confidence: number;
      confidence_level: string;
      severity: string;
      quality_status: string;
      grad_cam_url?: string;
      weather_snapshot?: any;
      treatment_recommendations?: any;
      sync_status: "SAVED_OFFLINE" | "SYNCING" | "SYNCED";
      created_at: string;
    };
  };
}

const DB_NAME = "cropguard_offline_db";
const DB_VERSION = 1;

export const getOfflineDB = async () => {
  return openDB<CropGuardDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("offline_scans")) {
        db.createObjectStore("offline_scans", { keyPath: "client_scan_id" });
      }
    },
  });
};

export const saveScanOffline = async (scanData: any) => {
  const db = await getOfflineDB();
  const scanObj = {
    ...scanData,
    sync_status: "SAVED_OFFLINE",
    created_at: new Date().toISOString(),
  };
  await db.put("offline_scans", scanObj);
  return scanObj;
};

export const getOfflineScans = async () => {
  const db = await getOfflineDB();
  return db.getAll("offline_scans");
};

export const updateScanSyncStatus = async (client_scan_id: string, status: "SAVED_OFFLINE" | "SYNCING" | "SYNCED") => {
  const db = await getOfflineDB();
  const scan = await db.get("offline_scans", client_scan_id);
  if (scan) {
    scan.sync_status = status;
    await db.put("offline_scans", scan);
  }
};
