import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { WifiOff, Wifi, Loader2, CheckCircle2, CloudOff } from "lucide-react";
import { useEffect, useState } from "react";

export function NetworkStatusBar() {
  const { isOnline, pendingCount, isSyncing, lastSyncResult } =
    useNetworkStatus();
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show success toast temporarily
  useEffect(() => {
    if (lastSyncResult && lastSyncResult.syncedCount > 0) {
      setShowSyncSuccess(true);
      const timer = setTimeout(() => setShowSyncSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncResult]);

  // Reset dismiss when status changes
  useEffect(() => {
    setDismissed(false);
  }, [isOnline]);

  // ── Sync success toast ──
  if (showSyncSuccess && lastSyncResult) {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white"
        style={{
          background: "linear-gradient(90deg, #059669, #10b981)",
          animation: "slideDown 0.3s ease-out",
        }}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          {lastSyncResult.syncedCount} data berhasil dikirim
          {lastSyncResult.failedCount > 0 &&
            ` · ${lastSyncResult.failedCount} gagal`}
        </span>
      </div>
    );
  }

  // ── Syncing state ──
  if (isSyncing) {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white"
        style={{
          background: "linear-gradient(90deg, #1e40af, #3b82f6)",
          animation: "slideDown 0.3s ease-out",
        }}
      >
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        <span>Mengirim {pendingCount} data tersimpan...</span>
      </div>
    );
  }

  // ── Offline state ──
  if (!isOnline && !dismissed) {
    return (
      <div
        className="flex items-center justify-between px-4 py-2 text-sm font-medium text-white"
        style={{
          background: "linear-gradient(90deg, #dc2626, #ef4444)",
          animation: "slideDown 0.3s ease-out",
        }}
      >
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            Anda offline — data akan disimpan lokal
            {pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {pendingCount} menunggu
              </span>
            )}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 rounded px-2 py-0.5 text-xs hover:bg-white/20 transition-colors"
        >
          ✕
        </button>
      </div>
    );
  }

  // ── Online with pending data ──
  if (isOnline && pendingCount > 0) {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white"
        style={{
          background: "linear-gradient(90deg, #d97706, #f59e0b)",
          animation: "slideDown 0.3s ease-out",
        }}
      >
        <CloudOff className="h-4 w-4 shrink-0" />
        <span>{pendingCount} data offline belum terkirim</span>
      </div>
    );
  }

  // ── Online, no pending → hidden ──
  return null;
}
