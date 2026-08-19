"use client";

import { useState } from "react";

export default function BackupPage() {
  const [otomatis, setOtomatis] = useState(true);
  const [frekuensi, setFrekuensi] = useState("harian");

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
          <div className="text-3xl mb-2">📤</div>
          <h2 className="text-lg font-semibold text-surface-on mb-1">
            Ekspor Data
          </h2>
          <p className="text-sm text-surface-on-variant mb-4">
            Unduh salinan seluruh data untuk arsip atau pindah server.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 py-3 rounded-lg bg-primary text-on-primary font-medium hover:opacity-90">
              Unduh .sql
            </button>
            <button className="flex-1 py-3 rounded-lg bg-secondary-container text-secondary-on-container font-medium hover:opacity-90">
              Unduh .json
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
          <div className="text-3xl mb-2">📥</div>
          <h2 className="text-lg font-semibold text-surface-on mb-1">
            Impor Data
          </h2>
          <p className="text-sm text-surface-on-variant mb-4">
            Pulihkan data dari berkas cadangan (.sql atau .json).
          </p>
          <input
            type="file"
            accept=".sql,.json"
            className="w-full text-sm text-surface-on-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-on-primary file:font-medium"
          />
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
        <h2 className="text-lg font-semibold text-surface-on mb-4">
          Backup Otomatis
        </h2>
        <div className="flex items-center justify-between py-3 border-b border-outline-variant">
          <div>
            <div className="font-medium text-surface-on">
              Aktifkan backup otomatis
            </div>
            <div className="text-sm text-surface-on-variant">
              Cadangan disimpan ke penyimpanan cloud
            </div>
          </div>
          <button
            onClick={() => setOtomatis((o) => !o)}
            className={`w-12 h-7 rounded-full transition-colors relative ${otomatis ? "bg-primary" : "bg-outline-variant"}`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-surface transition-all ${otomatis ? "left-6" : "left-1"}`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="font-medium text-surface-on">Frekuensi</div>
          <select
            value={frekuensi}
            onChange={(e) => setFrekuensi(e.target.value)}
            disabled={!otomatis}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface text-surface-on disabled:opacity-50"
          >
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
          </select>
        </div>
        <div className="mt-4 text-sm text-surface-on-variant">
          Backup terakhir:{" "}
          <span className="font-medium text-surface-on">19/08/2026 22:00</span>{" "}
          · Ukuran: 128 KB
        </div>
      </div>
    </div>
  );
}
