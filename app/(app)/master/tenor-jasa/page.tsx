"use client";

import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import { rupiah, persen } from "@/lib/utils";
import { apiClient, type TenorJasa } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

export default function TenorJasaPage() {
  const { data, loading, error, muatUlang } = useApi<TenorJasa[]>(() =>
    apiClient.getTenorJasa(),
  );
  const tenor = data ?? [];
  const [contohPokok, setContohPokok] = useState("5000000");
  const pokok = parseFloat(contohPokok) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="summary-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-medium text-surface-on-variant">
            Simulasi pokok pinjaman:
          </label>
          <input
            type="number"
            value={contohPokok}
            onChange={(e) => setContohPokok(e.target.value)}
            className="input-md3 w-full sm:w-56"
          />
          <span className="text-sm text-surface-on-variant">
            Jasa flat = pokok × persen × tenor
          </span>
        </div>
      </div>

      {loading ? (
        <Memuat />
      ) : error ? (
        <Galat pesan={error} onCoba={muatUlang} />
      ) : tenor.length === 0 ? (
        <Kosong pesan="Belum ada tenor aktif." />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tenor.map((t) => {
              const jasaTotal = Math.round(
                pokok * t.persentase_jasa * t.tenor_bulan,
              );
              return (
                <div
                  key={t.id}
                  className="summary-card text-center group hover:border-primary transition-all"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-110 transition-transform">
                    {t.tenor_bulan}
                  </div>
                  <div className="text-sm font-semibold text-surface-on">
                    {t.tenor_bulan} bulan
                  </div>
                  <div className="text-xs text-surface-on-variant mb-2">
                    Jasa {persen(t.persentase_jasa)}/bln
                  </div>
                  <div className="text-base font-bold text-primary">
                    {rupiah(jasaTotal)}
                  </div>
                  <div className="text-xs text-surface-on-variant">
                    total jasa
                  </div>
                </div>
              );
            })}
          </div>

          <div className="summary-card overflow-hidden !p-0">
            <div className="p-6 flex items-center justify-between border-b border-outline-variant">
              <div>
                <h2 className="text-lg font-bold text-surface-on flex items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  Master Tenor & Jasa
                </h2>
                <p className="text-sm text-surface-on-variant">
                  {tenor.length} pilihan tenor aktif
                </p>
              </div>
              <button className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
                <Plus size={16} />
                Tambah Tenor
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left">Tenor (bulan)</th>
                    <th className="text-right">Jasa per Bulan</th>
                    <th className="text-right hidden sm:table-cell">
                      Jasa Total (simulasi)
                    </th>
                    <th className="text-left">Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tenor.map((t) => (
                    <tr key={t.id}>
                      <td className="font-semibold">
                        {t.tenor_bulan} bulan
                      </td>
                      <td className="text-right">
                        {persen(t.persentase_jasa)}
                      </td>
                      <td className="text-right hidden sm:table-cell">
                        {rupiah(
                          Math.round(pokok * t.persentase_jasa * t.tenor_bulan),
                        )}
                      </td>
                      <td>
                        <span
                          className={`chip ${
                            t.status_aktif === 1 ? "chip-blue" : "bg-surface-container text-surface-on-variant"
                          }`}
                        >
                          {t.status_aktif === 1 ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="text-right">
                        <button className="text-primary font-medium text-sm hover:underline transition-colors">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
