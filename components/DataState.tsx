"use client";

import { AlertTriangle, Inbox, RefreshCw, Loader2 } from "lucide-react";

/** Indikator sedang memuat data dari API. */
export function Memuat({ pesan = "Memuat data…" }: { pesan?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-surface-on-variant">
      <Loader2 className="animate-spin text-primary" size={24} />
      <span className="text-sm font-medium">{pesan}</span>
    </div>
  );
}

/** Tampilan galat dengan tombol coba lagi. */
export function Galat({
  pesan,
  onCoba,
}: {
  pesan: string;
  onCoba?: () => void;
}) {
  return (
    <div className="m-6 bg-error-container text-on-error-container rounded-xl p-6 text-sm flex flex-col items-center gap-4 text-center animate-fade-in">
      <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
        <AlertTriangle size={20} className="text-error" />
      </div>
      <div className="font-medium">{pesan}</div>
      {onCoba && (
        <button
          onClick={onCoba}
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
        >
          <RefreshCw size={14} />
          Coba lagi
        </button>
      )}
    </div>
  );
}

/** Tampilan saat data kosong. */
export function Kosong({ pesan = "Belum ada data." }: { pesan?: string }) {
  return (
    <div className="py-16 text-center text-surface-on-variant">
      <div className="w-12 h-12 rounded-full bg-surface-container mx-auto mb-3 flex items-center justify-center">
        <Inbox size={20} className="text-outline" />
      </div>
      <p className="text-sm font-medium">{pesan}</p>
    </div>
  );
}
