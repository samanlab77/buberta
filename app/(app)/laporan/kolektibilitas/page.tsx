"use client";

import { AlertCircle, MessageCircle, Send } from "lucide-react";
import { angka, rupiah } from "@/lib/utils";
import { apiClient, type KolekSummary, type KolekDetail } from "@/lib/api";
import { KOLEK_COLOR, KOLEK_LABEL, type StatusKolek } from "@/lib/kredit";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";
import {
  generateWhatsAppURL,
  generatePesanAngsuran,
  bukaWhatsApp,
} from "@/lib/whatsapp";

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

  // Hitung total nasabah yang perlu di-follow up (Kol II-V)
  const perluFollowUp = baris.filter(
    (b) => b.status_kolek !== "I",
  );
  const totalTunggakan = perluFollowUp.reduce((s, b) => s + b.saldo, 0);

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

      {/* Ringkasan Follow-up */}
      {perluFollowUp.length > 0 && (
        <div className="summary-card bg-gradient-to-r from-tertiary-container/50 to-primary-container/50 border border-tertiary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={18} className="text-on-tertiary-container" />
                <h3 className="font-bold text-surface-on">
                  Perlu Follow-up WhatsApp
                </h3>
              </div>
              <p className="text-sm text-surface-on-variant">
                {perluFollowUp.length} nasabah dengan tunggakan (Kol II-V) · Total saldo Rp {rupiah(totalTunggakan)}
              </p>
            </div>
            <button
              onClick={() => {
                // Kirim notifikasi ke admin/manager
                const daftar = perluFollowUp.slice(0, 10).map((b) => ({
                  nama: b.nama,
                  noKontrak: b.no_nasabah,
                  bulanTunggak: b.hari_tunggakan,
                  saldo: b.saldo,
                }));

                const pesan = `📊 *LAPORAN PENGGUNAAN - BUBERTA FINANCE*\n\n`;
                const data = {
                  jumlahNasabah: perluFollowUp.length,
                  totalTunggakan,
                  daftarNasabah: daftar,
                };

                // Generate pesan
                let msg = `📊 *LAPORAN PENGGUNAAN - BUBERTA FINANCE*\n\n`;
                msg += `⏰ *Tanggal:* ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n\n`;
                msg += `⚠️ *RINGKASAN TUNGGAKAN:*\n`;
                msg += `• Jumlah nasabah belum bayar: *${data.jumlahNasabah} orang*\n`;
                msg += `• Total tunggakan: *Rp ${data.totalTunggakan.toLocaleString("id-ID")}*\n\n`;
                msg += `📝 *DAFTAR NASABAH TUNGGAKAN:*\n\n`;
                data.daftarNasabah.forEach((n, i) => {
                  msg += `${i + 1}. *${n.nama}*\n`;
                  msg += `   No. Kontrak: ${n.noKontrak}\n`;
                  msg += `   Tunggakan: ${n.bulanTunggak} hari\n`;
                  msg += `   Saldo: Rp ${n.saldo.toLocaleString("id-ID")}\n\n`;
                });
                msg += `\nSegera lakukan follow-up kepada nasabah yang bersangkutan.`;

                const url = generateWhatsAppURL("6281234567890", msg);
                bukaWhatsApp(url);
              }}
              className="btn-primary bg-tertiary text-on-tertiary px-6 py-2.5 text-sm flex items-center gap-2 hover:bg-tertiary/90 shrink-0"
            >
              <Send size={16} />
              Kirim Laporan ke Admin
            </button>
          </div>
        </div>
      )}

      <div className="summary-card overflow-hidden !p-0">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-surface-on">
              Detail Kolektibilitas per Nasabah
            </h2>
          </div>
          {perluFollowUp.length > 0 && (
            <span className="chip chip-yellow">
              {perluFollowUp.length} perlu follow-up
            </span>
          )}
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
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {baris.map((b, i) => {
                  const isOverdue = b.status_kolek !== "I";
                  const pesanWA = generatePesanAngsuran({
                    namaNasabah: b.nama,
                    noKontrak: b.no_nasabah,
                    jumlahAngsuran: 0, // Akan diisi dari data kontrak
                    bulanTunggak: Math.ceil(b.hari_tunggakan / 30),
                  });

                  return (
                    <tr
                      key={i}
                      className={
                        isOverdue ? "bg-tertiary-container/20" : ""
                      }
                    >
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
                      <td className="text-center">
                        {isOverdue && (
                          <button
                            onClick={() => {
                              const url = generateWhatsAppURL(
                                "081234567890", // Nomor nasabah (seharusnya dari data)
                                pesanWA,
                              );
                              bukaWhatsApp(url);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success text-on-success text-xs font-semibold hover:shadow-md1 transition-all"
                            title={`Kirim WhatsApp ke ${b.nama}`}
                          >
                            <MessageCircle size={14} />
                            <span className="hidden sm:inline">Ingatkan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
