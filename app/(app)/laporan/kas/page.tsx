"use client";

import { ArrowDownLeft, ArrowUpRight, Landmark, Download } from "lucide-react";
import { rupiah, rupiahRingkas, tanggal } from "@/lib/utils";
import { apiClient, type KasRow } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";
import { exportKasToExcel } from "@/lib/export-excel";

export default function KasPage() {
  const { data, loading, error, muatUlang } = useApi<KasRow[]>(() =>
    apiClient.getKas(),
  );
  const urut = [...(data ?? [])].sort((a, b) =>
    a.tanggal.localeCompare(b.tanggal),
  );
  let saldo = 0;
  const baris = urut.map((r) => {
    saldo += (r.masuk || 0) - (r.keluar || 0);
    return { ...r, saldo };
  });
  const totalMasuk = baris.reduce((s, r) => s + (r.masuk || 0), 0);
  const totalKeluar = baris.reduce((s, r) => s + (r.keluar || 0), 0);
  const saldoAkhir = baris.length ? baris[baris.length - 1].saldo : 0;

  const handleExport = async () => {
    const exportData = baris.map((r) => ({
      tanggal: r.tanggal,
      keterangan: r.keterangan ?? "Transaksi",
      masuk: r.masuk || 0,
      keluar: r.keluar || 0,
      saldo: r.saldo,
    }));
    await exportKasToExcel(exportData, totalMasuk, totalKeluar, saldoAkhir);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Masuk",
            value: loading ? "…" : rupiahRingkas(totalMasuk),
            icon: ArrowDownLeft,
            color: "text-primary",
            bg: "bg-primary-container",
          },
          {
            label: "Total Keluar",
            value: loading ? "…" : rupiahRingkas(totalKeluar),
            icon: ArrowUpRight,
            color: "text-error",
            bg: "bg-error-container",
          },
          {
            label: "Saldo Akhir",
            value: loading ? "…" : rupiahRingkas(saldoAkhir),
            icon: Landmark,
            color: saldoAkhir >= 0 ? "text-primary" : "text-error",
            bg: saldoAkhir >= 0 ? "bg-primary-container" : "bg-error-container",
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
              <div className={`text-xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="summary-card overflow-hidden !p-0">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-surface-on">
              Buku Kas/Bank
            </h2>
          </div>
          {baris.length > 0 && (
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
        ) : baris.length === 0 ? (
          <Kosong pesan="Belum ada transaksi kas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">Tanggal</th>
                  <th className="text-left">Keterangan</th>
                  <th className="text-right">Masuk</th>
                  <th className="text-right">Keluar</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {baris.map((r, i) => (
                  <tr key={i}>
                    <td>{tanggal(r.tanggal)}</td>
                    <td className="text-surface-on-variant">
                      {r.keterangan ?? "Transaksi"}
                    </td>
                    <td className="text-right text-primary font-medium">
                      {r.masuk > 0 ? rupiah(r.masuk) : "—"}
                    </td>
                    <td className="text-right text-error font-medium">
                      {r.keluar > 0 ? rupiah(r.keluar) : "—"}
                    </td>
                    <td
                      className={`text-right font-semibold ${
                        r.saldo >= 0 ? "text-surface-on" : "text-error"
                      }`}
                    >
                      {rupiah(r.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-container font-bold border-t-2 border-outline">
                  <td className="py-4 px-4" colSpan={2}>TOTAL</td>
                  <td className="text-right py-4 px-4 text-primary">
                    {rupiahRingkas(totalMasuk)}
                  </td>
                  <td className="text-right py-4 px-4 text-error">
                    {rupiahRingkas(totalKeluar)}
                  </td>
                  <td className="text-right py-4 px-4">
                    {rupiahRingkas(saldoAkhir)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
