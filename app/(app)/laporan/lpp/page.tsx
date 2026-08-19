"use client";

import { rupiah, rupiahRingkas } from "@/lib/utils";
import { apiClient, type LppRow } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

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
    {
      alokasi: 0,
      targetP: 0,
      targetB: 0,
      realisasiP: 0,
      realisasiB: 0,
      saldo: 0,
    },
  );

  return (
    <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-surface-on">
          LPP — Laporan Pinjaman & Penerimaan
        </h2>
        <p className="text-sm text-surface-on-variant">Rekap seluruh kontrak</p>
      </div>
      {loading ? (
        <Memuat />
      ) : error ? (
        <Galat pesan={error} onCoba={muatUlang} />
      ) : rows.length === 0 ? (
        <Kosong pesan="Belum ada data pinjaman." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-surface-on-variant">
                <th className="text-left py-3 px-3">No</th>
                <th className="text-left py-3 px-3">Nama</th>
                <th className="text-right py-3 px-3">Alokasi</th>
                <th className="text-right py-3 px-3">Target Pokok</th>
                <th className="text-right py-3 px-3">Target Jasa</th>
                <th className="text-right py-3 px-3">Realisasi Pokok</th>
                <th className="text-right py-3 px-3">Realisasi Jasa</th>
                <th className="text-right py-3 px-3">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.no_nasabah}
                  className="border-b border-outline-variant/50 hover:bg-surface-container"
                >
                  <td className="py-3 px-3">{r.no_nasabah}</td>
                  <td className="py-3 px-3 font-medium">{r.nama}</td>
                  <td className="text-right py-3 px-3">{rupiah(r.alokasi)}</td>
                  <td className="text-right py-3 px-3">{rupiah(r.target_p)}</td>
                  <td className="text-right py-3 px-3">{rupiah(r.target_b)}</td>
                  <td className="text-right py-3 px-3">
                    {rupiah(r.realisasi_p)}
                  </td>
                  <td className="text-right py-3 px-3">
                    {rupiah(r.realisasi_b)}
                  </td>
                  <td className="text-right py-3 px-3 font-semibold">
                    {rupiah(r.saldo)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-outline bg-surface-container font-bold">
                <td className="py-3 px-3" colSpan={2}>
                  TOTAL
                </td>
                <td className="text-right py-3 px-3">
                  {rupiahRingkas(totals.alokasi)}
                </td>
                <td className="text-right py-3 px-3">
                  {rupiahRingkas(totals.targetP)}
                </td>
                <td className="text-right py-3 px-3">
                  {rupiahRingkas(totals.targetB)}
                </td>
                <td className="text-right py-3 px-3">
                  {rupiahRingkas(totals.realisasiP)}
                </td>
                <td className="text-right py-3 px-3">
                  {rupiahRingkas(totals.realisasiB)}
                </td>
                <td className="text-right py-3 px-3">
                  {rupiahRingkas(totals.saldo)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
