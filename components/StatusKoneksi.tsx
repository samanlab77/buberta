"use client";

import { useOffline } from "@/hooks/useOffline";

export default function StatusKoneksi() {
  const { online, antrean, menyinkron, sinkron } = useOffline();

  return (
    <div className="flex items-center gap-3">
      {antrean > 0 && (
        <button
          onClick={() => void sinkron()}
          disabled={!online || menyinkron}
          title="Transaksi menunggu dikirim ke server"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-tertiary-container text-on-tertiary-container disabled:opacity-60"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container" />
          {menyinkron ? "Menyinkron\u2026" : `${antrean} antre`}
        </button>
      )}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${online ? "bg-primary" : "bg-error"}`}
        />
        <span className="text-sm text-surface-on-variant">
          {online ? "Online" : "Luring"}
        </span>
      </div>
    </div>
  );
}
