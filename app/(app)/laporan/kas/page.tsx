"use client";

import { rupiah, rupiahRingkas, tanggal } from "@/lib/utils";
import { apiClient, type KasRow } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

export default function KasPage() {
  const { data, loading, error, muatUlang } = useApi<KasRow[]>(() =>
    apiClient.getKas(),
  );
  // API mengembalikan urut DESC; urutkan menaik agar saldo berjalan benar.
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <div className="text-sm text-surface-on-variant font-medium">
            Total Masuk
          </div>
          <div className="text-2xl font-bold text-primary mt-1">
            {loading ? "…" : rupiahRingkas(totalMasuk)}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <div className="text-sm text-surface-on-variant font-medium">
            Total Keluar
          </div>
          <div className="text-2xl font-bold text-error mt-1">
            {loading ? "…" : rupiahRingkas(totalKeluar)}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <div className="text-sm text-surface-on-variant font-medium">
            Saldo Akhir
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${saldoAkhir >= 0 ? "text-primary" : "text-error"}`}
          >
            {loading ? "…" : rupiahRingkas(saldoAkhir)}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-surface-on">
            Buku Kas/Bank
          </h2>
          <p className="text-sm text-surface-on-variant">
            Mutasi kas otomatis dari transaksi
          </p>
        </div>
        {loading ? (
          <Memuat />
        ) : error ? (
          <Galat pesan={error} onCoba={muatUlang} />
        ) : baris.length === 0 ? (
          <Kosong pesan="Belum ada transaksi kas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-surface-on-variant">
                  <th className="text-left py-3 px-4">Tanggal</th>
                  <th className="text-left py-3 px-4">Keterangan</th>
                  <th className="text-right py-3 px-4">Masuk</th>
                  <th className="text-right py-3 px-4">Keluar</th>
                  <th className="text-right py-3 px-4">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {baris.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-outline-variant/50 hover:bg-surface-container"
                  >
                    <td className="py-3 px-4">{tanggal(r.tanggal)}</td>
                    <td className="py-3 px-4">{r.keterangan ?? "Transaksi"}</td>
                    <td className="text-right py-3 px-4 text-primary">
                      {r.masuk > 0 ? rupiah(r.masuk) : "—"}
                    </td>
                    <td className="text-right py-3 px-4 text-error">
                      {r.keluar > 0 ? rupiah(r.keluar) : "—"}
                    </td>
                    <td
                      className={`text-right py-3 px-4 font-semibold ${r.saldo >= 0 ? "text-surface-on" : "text-error"}`}
                    >
                      {rupiah(r.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-outline bg-surface-container font-bold">
                  <td className="py-3 px-4" colSpan={2}>
                    TOTAL
                  </td>
                  <td className="text-right py-3 px-4 text-primary">
                    {rupiahRingkas(totalMasuk)}
                  </td>
                  <td className="text-right py-3 px-4 text-error">
                    {rupiahRingkas(totalKeluar)}
                  </td>
                  <td className="text-right py-3 px-4">
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
