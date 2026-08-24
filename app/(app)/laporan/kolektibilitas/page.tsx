"use client";

import { AlertCircle } from "lucide-react";
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
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kartu.map((k) => (
          <div
            key={k.kode}
            className="summary-card group hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm"
                style={{ background: k.color }}
              >
                {k.kode}
              </div>
              <div>
                <div className="text-sm font-bold text-surface-on leading-tight">
                  {k.label}
                </div>
                <div className="text-[11px] text-surface-on-variant">
                  {k.rentang}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-surface-on">
              {ringkasan.loading ? (
                <span className="skeleton skeleton-title inline-block w-12" />
              ) : (
                angka(k.jumlah)
              )}
            </div>
            <div className="text-xs text-surface-on-variant mt-1">
              {((k.jumlah / total) * 100).toFixed(1)}% dari total
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(k.jumlah / total) * 100}%`,
                  background: k.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="summary-card overflow-hidden !p-0">
        <div className="p-6 border-b border-outline-variant flex items-center gap-2">
          <AlertCircle size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-surface-on">
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
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">No</th>
                  <th className="text-left">Nama</th>
                  <th className="text-left">Status</th>
                  <th className="text-right">Saldo</th>
                  <th className="text-right">Tunggakan</th>
                </tr>
              </thead>
              <tbody>
                {baris.map((b, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-surface-on-variant">
                      {b.no_nasabah}
                    </td>
                    <td className="font-semibold">{b.nama}</td>
                    <td>
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                        style={{
                          background:
                            KOLEK_COLOR[b.status_kolek as StatusKolek] ?? "#6F797F",
                        }}
                      >
                        Kol {b.status_kolek}
                      </span>
                    </td>
                    <td className="text-right">{rupiah(b.saldo)}</td>
                    <td className="text-right font-medium text-error">
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
