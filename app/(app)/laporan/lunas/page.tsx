"use client";

import { CheckCircle2, FileCheck, Zap, Download } from "lucide-react";
import { rupiah, rupiahRingkas, tanggal } from "@/lib/utils";
import { apiClient, type LunasRow } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";
import { exportLunasToExcel } from "@/lib/export-excel";

export default function LunasPage() {
  const { data, loading, error, muatUlang } = useApi<LunasRow[]>(() =>
    apiClient.getLunas(),
  );
  const rows = data ?? [];
  const totalPokok = rows.reduce((s, l) => s + l.pokok_pinjaman, 0);
  const dipercepat = rows.filter((l) => l.status === "dipercepat").length;

  const handleExport = async () => {
    await exportLunasToExcel(rows);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Kontrak Lunas",
            value: loading ? "…" : `${rows.length} kontrak`,
            icon: CheckCircle2,
            color: "text-primary",
            bg: "bg-primary-container",
          },
          {
            label: "Total Pokok Lunas",
            value: loading ? "…" : rupiahRingkas(totalPokok),
            icon: FileCheck,
            color: "text-primary",
            bg: "bg-primary-container",
          },
          {
            label: "Pelunasan Dipercepat",
            value: loading ? "…" : `${dipercepat} kontrak`,
            icon: Zap,
            color: "text-on-tertiary-container",
            bg: "bg-tertiary-container",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="summary-card">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={16} className={card.color} />
                </div>
                <span className="text-sm text-surface-on-variant font-medium">
                  {card.label}
                </span>
              </div>
              <div className="text-xl font-bold text-surface-on">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="summary-card overflow-hidden !p-0">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-surface-on">
              Laporan Kredit Lunas
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
          <Kosong pesan="Belum ada kontrak lunas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">No. Kontrak</th>
                  <th className="text-left">Nasabah</th>
                  <th className="text-left hidden md:table-cell">Tgl Akad</th>
                  <th className="text-left hidden md:table-cell">Tgl Lunas</th>
                  <th className="text-right">Pokok</th>
                  <th className="text-left">Jenis</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const jenis =
                    l.status === "dipercepat" ? "Dipercepat" : "Normal";
                  return (
                    <tr key={l.no_kontrak}>
                      <td className="font-semibold">{l.no_kontrak}</td>
                      <td>
                        <div className="font-medium">{l.nama}</div>
                        <div className="text-xs text-surface-on-variant">{l.no_nasabah}</div>
                      </td>
                      <td className="hidden md:table-cell">{tanggal(l.tanggal_akad)}</td>
                      <td className="hidden md:table-cell">{tanggal(l.tanggal_lunas)}</td>
                      <td className="text-right">{rupiah(l.pokok_pinjaman)}</td>
                      <td>
                        <span
                          className={`chip ${
                            jenis === "Dipercepat" ? "chip-yellow" : "chip-green"
                          }`}
                        >
                          {jenis}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-surface-container font-bold border-t-2 border-outline">
                  <td className="py-4 px-4" colSpan={4}>TOTAL</td>
                  <td className="text-right py-4 px-4">{rupiah(totalPokok)}</td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
