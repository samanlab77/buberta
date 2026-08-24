"use client";

import { FileText, Download } from "lucide-react";
import { rupiah, rupiahRingkas } from "@/lib/utils";
import { apiClient, type LppRow } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";
import { exportLppToExcel } from "@/lib/export-excel";

export default function LppPage() {
  const { data, loading, error, muatUlang } = useApi<LppRow[]>(() =>
    apiClient.getLpp(),
  );
  const rows = data ?? [];
  const totals = rows.reduce(
    (acc, r) => ({
      alokasi: acc.alokasi + r.alokasi,
      targetP: acc.targetP + r.target_p,
      targetB: acc.targetB + r.target_b,
      realisasiP: acc.realisasiP + r.realisasi_p,
      realisasiB: acc.realisasiB + r.realisasi_b,
      saldo: acc.saldo + r.saldo,
    }),
    { alokasi: 0, targetP: 0, targetB: 0, realisasiP: 0, realisasiB: 0, saldo: 0 },
  );

  const handleExport = async () => {
    await exportLppToExcel(rows);
  };

  return (
    <div className="summary-card animate-fade-in overflow-hidden !p-0">
      <div className="p-6 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-surface-on">
            LPP — Laporan Pinjaman & Penerimaan
          </h2>
        </div>
        {rows.length > 0 && (
          <button
            onClick={() => void handleExport()}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            <Download size={16} />
            Export Excel
          </button>
        )}
      </div>
      {loading ? (
        <Memuat />
      ) : error ? (
        <Galat pesan={error} onCoba={muatUlang} />
      ) : rows.length === 0 ? (
        <Kosong pesan="Belum ada data pinjaman." />
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left">No</th>
                <th className="text-left">Nama</th>
                <th className="text-right">Alokasi</th>
                <th className="text-right">Target Pokok</th>
                <th className="text-right">Target Jasa</th>
                <th className="text-right">Realisasi Pokok</th>
                <th className="text-right">Realisasi Jasa</th>
                <th className="text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.no_nasabah}>
                  <td className="font-mono text-xs text-surface-on-variant">{r.no_nasabah}</td>
                  <td className="font-semibold">{r.nama}</td>
                  <td className="text-right">{rupiah(r.alokasi)}</td>
                  <td className="text-right">{rupiah(r.target_p)}</td>
                  <td className="text-right">{rupiah(r.target_b)}</td>
                  <td className="text-right">{rupiah(r.realisasi_p)}</td>
                  <td className="text-right">{rupiah(r.realisasi_b)}</td>
                  <td className="text-right font-semibold">{rupiah(r.saldo)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-container font-bold border-t-2 border-outline">
                <td className="py-4 px-4" colSpan={2}>TOTAL</td>
                <td className="text-right py-4 px-4">{rupiahRingkas(totals.alokasi)}</td>
                <td className="text-right py-4 px-4">{rupiahRingkas(totals.targetP)}</td>
                <td className="text-right py-4 px-4">{rupiahRingkas(totals.targetB)}</td>
                <td className="text-right py-4 px-4">{rupiahRingkas(totals.realisasiP)}</td>
                <td className="text-right py-4 px-4">{rupiahRingkas(totals.realisasiB)}</td>
                <td className="text-right py-4 px-4">{rupiahRingkas(totals.saldo)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
