"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Trash2, Clock } from "lucide-react";
import { daftarAntrean, hapusAntrean, prosesAntrean } from "@/lib/sync";
import type { AntreanTransaksi } from "@/lib/dexie";

const warnaStatus: Record<string, string> = {
  pending: "chip-yellow",
  syncing: "chip-blue",
  gagal: "chip-red",
};

export default function PanelAntrean() {
  const [items, setItems] = useState<AntreanTransaksi[]>([]);
  const [sibuk, setSibuk] = useState(false);

  const muat = useCallback(async () => {
    try {
      setItems(await daftarAntrean());
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void muat();
    const timer = window.setInterval(() => void muat(), 4000);
    return () => window.clearInterval(timer);
  }, [muat]);

  const sinkron = async () => {
    setSibuk(true);
    try {
      await prosesAntrean();
    } finally {
      await muat();
      setSibuk(false);
    }
  };

  const hapus = async (id?: number) => {
    if (id == null) return;
    await hapusAntrean(id);
    await muat();
  };

  if (items.length === 0) return null;

  return (
    <div className="summary-card overflow-hidden !p-0 animate-fade-in">
      <div className="p-6 flex items-center justify-between gap-3 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-on">
              Antrean Luring
            </h2>
            <p className="text-sm text-surface-on-variant">
              {items.length} transaksi menunggu dikirim ke server
            </p>
          </div>
        </div>
        <button
          onClick={() => void sinkron()}
          disabled={sibuk}
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={14} className={sibuk ? "animate-spin" : ""} />
          {sibuk ? "Menyinkron…" : "Sinkronkan Sekarang"}
        </button>
      </div>
      <div>
        {items.map((it) => (
          <div
            key={it.id}
            className="px-6 py-4 flex items-center justify-between gap-3 border-b border-outline-variant last:border-b-0"
          >
            <div className="min-w-0">
              <div className="font-semibold text-surface-on truncate">
                {it.ringkasan}
              </div>
              <div className="text-xs text-surface-on-variant mt-0.5">
                {it.jenis} · {new Date(it.dibuatPada).toLocaleString("id-ID")}
                {it.pesanError ? ` · ${it.pesanError}` : ""}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`chip capitalize ${warnaStatus[it.status] ?? ""}`}>
                {it.status}
              </span>
              <button
                onClick={() => void hapus(it.id)}
                className="p-2 rounded-lg hover:bg-error-container text-surface-on-variant hover:text-error transition-colors"
                aria-label="Hapus"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
