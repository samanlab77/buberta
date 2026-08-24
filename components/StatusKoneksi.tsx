"use client";

import { Wifi, WifiOff, RefreshCw, Loader2 } from "lucide-react";
import { useOffline } from "@/hooks/useOffline";

export default function StatusKoneksi() {
  const { online, antrean, menyinkron, sinkron } = useOffline();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {antrean > 0 && (
        <button
          onClick={() => void sinkron()}
          disabled={!online || menyinkron}
          title="Transaksi menunggu dikirim ke server"
          className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-tertiary-container text-on-tertiary-container disabled:opacity-60 hover:shadow-sm transition-all"
        >
          {menyinkron ? (
            <Loader2 size={10} className="animate-spin sm:w-3 sm:h-3" />
          ) : (
            <RefreshCw size={10} className="sm:w-3 sm:h-3" />
          )}
          <span className="hidden sm:inline">
            {menyinkron ? "Sinkron…" : `${antrean} antre`}
          </span>
          <span className="sm:hidden">
            {menyinkron ? "…" : antrean}
          </span>
        </button>
      )}
      <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium bg-surface-container">
        {online ? (
          <Wifi size={11} className="text-primary sm:w-3.5 sm:h-3.5" />
        ) : (
          <WifiOff size={11} className="text-error sm:w-3.5 sm:h-3.5" />
        )}
        <span className={online ? "text-primary" : "text-error"}>
          {online ? "Online" : "Luring"}
        </span>
      </div>
    </div>
  );
}
