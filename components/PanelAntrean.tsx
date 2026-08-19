"use client";

import { useCallback, useEffect, useState } from "react";
import { daftarAntrean, hapusAntrean, prosesAntrean } from "@/lib/sync";
import type { AntreanTransaksi } from "@/lib/dexie";

const warnaStatus: Record<string, string> = {
  pending: "bg-tertiary-container text-on-tertiary-container",
  syncing: "bg-primary-container text-on-primary-container",
  gagal: "bg-error-container text-on-error-container",
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
    <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
      <div className="p-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-surface-on">
            Antrean Luring
          </h2>
          <p className="text-sm text-surface-on-variant">
            {items.length} transaksi menunggu dikirim ke server
          </p>
        </div>
        <button
          onClick={() => void sinkron()}
          disabled={sibuk}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-sm hover:opacity-90 disabled:opacity-60"
        >
          {sibuk ? "Menyinkron\u2026" : "Sinkronkan Sekarang"}
        </button>
      </div>
      <div className="border-t border-outline-variant divide-y divide-outline-variant">
        {items.map((it) => (
          <div
            key={it.id}
            className="px-5 py-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="font-medium text-surface-on truncate">
                {it.ringkasan}
              </div>
              <div className="text-xs text-surface-on-variant">
                {it.jenis} · {new Date(it.dibuatPada).toLocaleString("id-ID")}
                {it.pesanError ? ` · ${it.pesanError}` : ""}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize ${warnaStatus[it.status] ?? ""}`}
              >
                {it.status}
              </span>
              <button
                onClick={() => void hapus(it.id)}
                className="text-error text-xs font-medium hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
