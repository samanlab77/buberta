"use client";

import { useState } from "react";
import { Download, Upload, Database, Clock } from "lucide-react";

export default function BackupPage() {
  const [otomatis, setOtomatis] = useState(true);
  const [frekuensi, setFrekuensi] = useState("harian");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="summary-card group hover:scale-[1.01] transition-transform">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Download size={24} />
          </div>
          <h2 className="text-lg font-bold text-surface-on mb-1">
            Ekspor Data
          </h2>
          <p className="text-sm text-surface-on-variant mb-5">
            Unduh salinan seluruh data untuk arsip atau pindah server.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
              <Download size={14} />
              Unduh .sql
            </button>
            <button className="btn-outline flex-1 py-3 text-sm flex items-center justify-center gap-2">
              <Download size={14} />
              Unduh .json
            </button>
          </div>
        </div>

        <div className="summary-card group hover:scale-[1.01] transition-transform">
          <div className="w-12 h-12 rounded-xl bg-secondary-container text-secondary-on-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload size={24} />
          </div>
          <h2 className="text-lg font-bold text-surface-on mb-1">
            Impor Data
          </h2>
          <p className="text-sm text-surface-on-variant mb-5">
            Pulihkan data dari berkas cadangan (.sql atau .json).
          </p>
          <input
            type="file"
            accept=".sql,.json"
            className="w-full text-sm text-surface-on-variant file:mr-4 file:py-2 file:px-5 file:rounded-xl file:border-0 file:bg-primary file:text-on-primary file:font-semibold file:text-sm file:cursor-pointer file:transition-all hover:file:shadow-md1"
          />
        </div>
      </div>

      <div className="summary-card">
        <div className="flex items-center gap-2 mb-5">
          <Clock size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-surface-on">
            Backup Otomatis
          </h2>
        </div>
        <div className="flex items-center justify-between py-4 border-b border-outline-variant">
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
            className={`w-12 h-7 rounded-full transition-all duration-200 relative ${
              otomatis ? "bg-primary shadow-md1" : "bg-outline-variant"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                otomatis ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between py-4">
          <div className="font-medium text-surface-on">Frekuensi</div>
          <select
            value={frekuensi}
            onChange={(e) => setFrekuensi(e.target.value)}
            disabled={!otomatis}
            className="input-md3 w-auto px-4 disabled:opacity-50"
          >
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
          </select>
        </div>
        <div className="mt-4 p-3 bg-surface-container rounded-xl text-sm text-surface-on-variant">
          <Database size={14} className="inline mr-1.5" />
          Backup terakhir:{" "}
          <span className="font-semibold text-surface-on">19/08/2026 22:00</span>{" "}
          · Ukuran: <span className="font-semibold text-surface-on">128 KB</span>
        </div>
      </div>
    </div>
  );
}
