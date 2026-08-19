"use client";

import { useState } from "react";
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
    <div className="space-y-6">
      <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-medium text-surface-on-variant">
            Simulasi pokok pinjaman:
          </label>
          <input
            type="number"
            value={contohPokok}
            onChange={(e) => setContohPokok(e.target.value)}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface text-surface-on w-full sm:w-56"
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
                  className="bg-surface-container-low rounded-xl p-5 shadow-md1 text-center"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg mb-2">
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

          <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-surface-on">
                  Master Tenor & Jasa
                </h2>
                <p className="text-sm text-surface-on-variant">
                  {tenor.length} pilihan tenor aktif
                </p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-sm hover:opacity-90">
                + Tambah Tenor
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant text-surface-on-variant">
                    <th className="text-left py-3 px-4">Tenor (bulan)</th>
                    <th className="text-right py-3 px-4">Jasa per Bulan</th>
                    <th className="text-right py-3 px-4">
                      Jasa Total (simulasi)
                    </th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tenor.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-outline-variant/50 hover:bg-surface-container"
                    >
                      <td className="py-3 px-4 font-medium">
                        {t.tenor_bulan} bulan
                      </td>
                      <td className="text-right py-3 px-4">
                        {persen(t.persentase_jasa)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {rupiah(
                          Math.round(pokok * t.persentase_jasa * t.tenor_bulan),
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium ${t.status_aktif === 1 ? "bg-primary-container text-on-primary-container" : "bg-surface-variant text-surface-on-variant"}`}
                        >
                          {t.status_aktif === 1 ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <button className="text-primary font-medium hover:underline">
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
