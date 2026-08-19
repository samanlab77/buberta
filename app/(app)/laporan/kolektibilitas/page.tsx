"use client";

import { angka, rupiah } from "@/lib/utils";
import { apiClient, type KolekSummary, type KolekDetail } from "@/lib/api";
import { KOLEK_COLOR, KOLEK_LABEL, type StatusKolek } from "@/lib/kredit";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

const RENTANG: Record<StatusKolek, string> = {
  I: "0x menunggak",
  II: "1–2x menunggak",
  III: "3–4x menunggak",
  IV: "5–6x menunggak",
  V: ">6x menunggak",
};
const URUTAN: StatusKolek[] = ["I", "II", "III", "IV", "V"];

export default function KolektibilitasPage() {
  const ringkasan = useApi<KolekSummary[]>(() => apiClient.getKolektibilitas());
  const detail = useApi<KolekDetail[]>(() =>
    apiClient.getKolektibilitasDetail(),
  );

  const petaJumlah = new Map(
    (ringkasan.data ?? []).map((k) => [k.status_kolek, k.jumlah] as const),
  );
  const kartu = URUTAN.map((kode) => ({
    kode,
    label: KOLEK_LABEL[kode],
    rentang: RENTANG[kode],
    jumlah: petaJumlah.get(kode) ?? 0,
    color: KOLEK_COLOR[kode],
  }));
  const total = kartu.reduce((s, k) => s + k.jumlah, 0) || 1;
  const baris = detail.data ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {kartu.map((k) => (
          <div
            key={k.kode}
            className="bg-surface-container-low rounded-xl p-5 shadow-md1"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                style={{ background: k.color }}
              >
                {k.kode}
              </div>
              <div>
                <div className="text-sm font-semibold text-surface-on">
                  {k.label}
                </div>
                <div className="text-xs text-surface-on-variant">
                  {k.rentang}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-surface-on">
              {ringkasan.loading ? "…" : angka(k.jumlah)}
            </div>
            <div className="text-sm text-surface-on-variant">
              {((k.jumlah / total) * 100).toFixed(1)}% dari total
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-surface-on">
            Detail Kolektibilitas per Nasabah
          </h2>
        </div>
        {detail.loading ? (
          <Memuat />
        ) : detail.error ? (
          <Galat pesan={detail.error} onCoba={detail.muatUlang} />
        ) : baris.length === 0 ? (
          <Kosong pesan="Semua kredit lancar (Kol I)." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-surface-on-variant">
                  <th className="text-left py-3 px-4">No</th>
                  <th className="text-left py-3 px-4">Nama</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Saldo</th>
                  <th className="text-right py-3 px-4">Tunggakan</th>
                </tr>
              </thead>
              <tbody>
                {baris.map((b, i) => (
                  <tr key={i} className="border-b border-outline-variant/50">
                    <td className="py-3 px-4">{b.no_nasabah}</td>
                    <td className="py-3 px-4 font-medium">{b.nama}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{
                          background:
                            KOLEK_COLOR[b.status_kolek as StatusKolek] ??
                            "#6F797F",
                        }}
                      >
                        Kol {b.status_kolek}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">{rupiah(b.saldo)}</td>
                    <td className="text-right py-3 px-4">
                      {b.hari_tunggakan} hari
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
