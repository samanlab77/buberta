"use client";

import { rupiah, rupiahRingkas, tanggal } from "@/lib/utils";
import { apiClient, type LunasRow } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

export default function LunasPage() {
  const { data, loading, error, muatUlang } = useApi<LunasRow[]>(() =>
    apiClient.getLunas(),
  );
  const rows = data ?? [];
  const totalPokok = rows.reduce((s, l) => s + l.pokok_pinjaman, 0);
  const dipercepat = rows.filter((l) => l.status === "dipercepat").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <div className="text-sm text-surface-on-variant font-medium">
            Total Kontrak Lunas
          </div>
          <div className="text-2xl font-bold text-surface-on mt-1">
            {loading ? "…" : `${rows.length} kontrak`}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <div className="text-sm text-surface-on-variant font-medium">
            Total Pokok Lunas
          </div>
          <div className="text-2xl font-bold text-primary mt-1">
            {loading ? "…" : rupiahRingkas(totalPokok)}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <div className="text-sm text-surface-on-variant font-medium">
            Pelunasan Dipercepat
          </div>
          <div className="text-2xl font-bold text-surface-on mt-1">
            {loading ? "…" : `${dipercepat} kontrak`}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-surface-on">
            Laporan Kredit Lunas
          </h2>
        </div>
        {loading ? (
          <Memuat />
        ) : error ? (
          <Galat pesan={error} onCoba={muatUlang} />
        ) : rows.length === 0 ? (
          <Kosong pesan="Belum ada kontrak lunas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-surface-on-variant">
                  <th className="text-left py-3 px-4">No. Kontrak</th>
                  <th className="text-left py-3 px-4">Nasabah</th>
                  <th className="text-left py-3 px-4">Tgl Akad</th>
                  <th className="text-left py-3 px-4">Tgl Lunas</th>
                  <th className="text-right py-3 px-4">Pokok</th>
                  <th className="text-left py-3 px-4">Jenis</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const jenis =
                    l.status === "dipercepat" ? "Dipercepat" : "Normal";
                  return (
                    <tr
                      key={l.no_kontrak}
                      className="border-b border-outline-variant/50 hover:bg-surface-container"
                    >
                      <td className="py-3 px-4 font-medium">{l.no_kontrak}</td>
                      <td className="py-3 px-4">
                        {l.nama} ({l.no_nasabah})
                      </td>
                      <td className="py-3 px-4">{tanggal(l.tanggal_akad)}</td>
                      <td className="py-3 px-4">{tanggal(l.tanggal_lunas)}</td>
                      <td className="text-right py-3 px-4">
                        {rupiah(l.pokok_pinjaman)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium ${jenis === "Dipercepat" ? "bg-tertiary-container text-on-tertiary-container" : "bg-primary-container text-on-primary-container"}`}
                        >
                          {jenis}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-outline bg-surface-container font-bold">
                  <td className="py-3 px-4" colSpan={4}>
                    TOTAL
                  </td>
                  <td className="text-right py-3 px-4">{rupiah(totalPokok)}</td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
