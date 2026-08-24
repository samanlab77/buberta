"use client";

import { Wifi, WifiOff, RefreshCw, Loader2 } from "lucide-react";
import { useOffline } from "@/hooks/useOffline";

export default function StatusKoneksi() {
  const { online, antrean, menyinkron, sinkron } = useOffline();

  return (
    <div className="flex items-center gap-2">
      {antrean > 0 && (
        <button
          onClick={() => void sinkron()}
          disabled={!online || menyinkron}
          title="Transaksi menunggu dikirim ke server"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-tertiary-container text-on-tertiary-container disabled:opacity-60 hover:shadow-sm transition-all"
        >
          {menyinkron ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <RefreshCw size={12} />
          )}
          {menyinkron ? "Sinkron…" : `${antrean} antre`}
        </button>
      )}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-container">
        {online ? (
          <Wifi size={13} className="text-primary" />
        ) : (
          <WifiOff size={13} className="text-error" />
        )}
        <span className={online ? "text-primary" : "text-error"}>
          {online ? "Online" : "Luring"}
        </span>
      </div>
    </div>
  );
}
