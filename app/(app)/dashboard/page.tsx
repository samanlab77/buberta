"use client";

import {
  Wallet,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  MessageCircle,
  Send,
} from "lucide-react";
import { angka, rupiah, rupiahRingkas, tanggal } from "@/lib/utils";
import {
  apiClient,
  type KolekSummary,
  type Rekap,
  type TrenBulan,
  type PenerimaanTerbaru,
  type KolekDetail,
} from "@/lib/api";
import { KOLEK_COLOR, KOLEK_LABEL, type StatusKolek } from "@/lib/kredit";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat } from "@/components/DataState";
import RevenueChart from "@/components/RevenueChart";
import KolektibilitasChart from "@/components/KolektibilitasChart";
import {
  generateWhatsAppURL,
  generatePesanAngsuran,
  bukaWhatsApp,
} from "@/lib/whatsapp";

const BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];
function labelBulan(ym: string): string {
  const [y, m] = ym.split("-");
  return `${BULAN[Number(m) - 1] ?? m ?? ""} ${y?.slice(2) ?? ""}`;
}

export default function DashboardPage() {
  const rekap = useApi<Rekap>(() => apiClient.getRekap());
  const kolek = useApi<KolekSummary[]>(() => apiClient.getKolektibilitas());
  const tren = useApi<TrenBulan[]>(() => apiClient.getTrenPenerimaan());
  const terbaru = useApi<PenerimaanTerbaru[]>(() =>
    apiClient.getPenerimaanTerbaru(),
  );
  const kolekDetail = useApi<KolekDetail[]>(() =>
    apiClient.getKolektibilitasDetail(),
  );

  const cards = [
    {
      label: "Total Saldo Pinjaman",
      value: rekap.data?.saldo_pinjaman ?? 0,
      icon: Wallet,
      gradient: "from-primary/10 to-primary/5",
      iconBg: "bg-primary",
      iconColor: "text-on-primary",
      uang: true,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      label: "Penerimaan Bulan Ini",
      value: rekap.data?.penerimaan_bulan_ini ?? 0,
      icon: TrendingUp,
      gradient: "from-tertiary/10 to-tertiary/5",
      iconBg: "bg-tertiary",
      iconColor: "text-on-tertiary",
      uang: true,
      trend: "+8.3%",
      trendUp: true,
    },
    {
      label: "Nasabah Aktif",
      value: rekap.data?.nasabah_aktif ?? 0,
      icon: Users,
      gradient: "from-secondary/10 to-secondary/5",
      iconBg: "bg-secondary",
      iconColor: "text-on-secondary",
      uang: false,
      trend: "+2",
      trendUp: true,
    },
  ];

  const kolekChart = (kolek.data ?? []).map((k) => ({
    label: `Kol ${k.status_kolek} — ${KOLEK_LABEL[k.status_kolek as StatusKolek] ?? ""}`,
    val: k.jumlah,
    color: KOLEK_COLOR[k.status_kolek as StatusKolek] ?? "#16789E",
  }));

  const trenChart = (tren.data ?? []).map((t) => ({
    label: labelBulan(t.bulan),
    target: 0,
    reals: t.penerimaan,
  }));

  const pembayaran = terbaru.data ?? [];

  // Hitung nasabah yang perlu follow-up (Kol II-V)
  const perluFollowUp = (kolekDetail.data ?? []).filter(
    (b) => b.status_kolek !== "I",
  );
  const totalTunggakan = perluFollowUp.reduce((s, b) => s + b.saldo, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`summary-card animate-fade-in-up`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shadow-sm`}
                >
                  <Icon size={22} />
                </div>
                {card.trend && (
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      card.trendUp
                        ? "bg-success-container text-on-success-container"
                        : "bg-error-container text-on-error-container"
                    }`}
                  >
                    {card.trendUp ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    {card.trend}
                  </div>
                )}
              </div>
              <div className="text-sm text-surface-on-variant font-medium mb-1">
                {card.label}
              </div>
              <div className="text-2xl font-bold text-surface-on">
                {rekap.loading ? (
                  <span className="skeleton skeleton-title inline-block w-32" />
                ) : card.uang ? (
                  rupiahRingkas(card.value)
                ) : (
                  angka(card.value)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {rekap.error && <Galat pesan={rekap.error} onCoba={rekap.muatUlang} />}

      {/* Alert: Nasabah Perlu Follow-up */}
      {perluFollowUp.length > 0 && (
        <div className="summary-card bg-gradient-to-r from-error-container/30 to-tertiary-container/30 border border-error/20 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-error" />
              </div>
              <div>
                <h3 className="font-bold text-surface-on flex items-center gap-2">
                  Nasabah Perlu Diingatkan
                  <span className="chip chip-red text-[10px]">
                    {perluFollowUp.length}
                  </span>
                </h3>
                <p className="text-sm text-surface-on-variant mt-0.5">
                  {perluFollowUp.length} nasabah memiliki tunggakan · Total saldo Rp {rupiahRingkas(totalTunggakan)}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {perluFollowUp.slice(0, 3).map((b, i) => (
                    <span
                      key={i}
                      className="text-xs bg-surface-container px-2 py-1 rounded-lg"
                    >
                      {b.nama} ({b.hari_tunggakan} hari)
                    </span>
                  ))}
                  {perluFollowUp.length > 3 && (
                    <span className="text-xs text-surface-on-variant">
                      +{perluFollowUp.length - 3} lainnya
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  // Kirim WhatsApp ke nasabah pertama
                  const first = perluFollowUp[0];
                  if (first) {
                    const pesan = generatePesanAngsuran({
                      namaNasabah: first.nama,
                      noKontrak: first.no_nasabah,
                      jumlahAngsuran: 0,
                      bulanTunggak: Math.ceil(first.hari_tunggakan / 30),
                    });
                    const url = generateWhatsAppURL("081234567890", pesan);
                    bukaWhatsApp(url);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-success text-on-success text-sm font-semibold flex items-center gap-2 hover:shadow-md1 transition-all"
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">Ingatkan Nasabah</span>
                <span className="sm:hidden">WA</span>
              </button>
              <button
                onClick={() => {
                  // Kirim laporan ke admin
                  const daftar = perluFollowUp.slice(0, 10).map((b) => ({
                    nama: b.nama,
                    noKontrak: b.no_nasabah,
                    bulanTunggak: Math.ceil(b.hari_tunggakan / 30),
                    saldo: b.saldo,
                  }));

                  let msg = `📊 *LAPORAN PENGGUNAAN - BUBERTA FINANCE*\n\n`;
                  msg += `⏰ *Tanggal:* ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n\n`;
                  msg += `⚠️ *RINGKASAN TUNGGAKAN:*\n`;
                  msg += `• Jumlah nasabah belum bayar: *${perluFollowUp.length} orang*\n`;
                  msg += `• Total tunggakan: *Rp ${totalTunggakan.toLocaleString("id-ID")}*\n\n`;
                  msg += `📝 *DAFTAR NASABAH TUNGGAKAN:*\n\n`;
                  daftar.forEach((n, i) => {
                    msg += `${i + 1}. *${n.nama}*\n`;
                    msg += `   No. Kontrak: ${n.noKontrak}\n`;
                    msg += `   Tunggakan: ${n.bulanTunggak} bulan\n`;
                    msg += `   Saldo: Rp ${n.saldo.toLocaleString("id-ID")}\n\n`;
                  });
                  msg += `\nSegera lakukan follow-up kepada nasabah yang bersangkutan.`;

                  const url = generateWhatsAppURL("6281234567890", msg);
                  bukaWhatsApp(url);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold flex items-center gap-2 hover:shadow-md1 transition-all"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Laporan ke Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="summary-card animate-fade-in-up delay-300">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-surface-on">
              Tren Penerimaan
            </h2>
          </div>
          <p className="text-sm text-surface-on-variant mb-4">
            Realisasi penerimaan 6 bulan terakhir
          </p>
          {tren.loading ? (
            <Memuat />
          ) : tren.error ? (
            <Galat pesan={tren.error} onCoba={tren.muatUlang} />
          ) : (
            <RevenueChart data={trenChart} />
          )}
        </div>

        <div className="summary-card animate-fade-in-up delay-400">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3Icon />
            <h2 className="text-lg font-semibold text-surface-on">
              Distribusi Kolektibilitas
            </h2>
          </div>
          <p className="text-sm text-surface-on-variant mb-4">
            Status kredit nasabah terkini
          </p>
          {kolek.loading ? (
            <Memuat />
          ) : kolek.error ? (
            <Galat pesan={kolek.error} onCoba={kolek.muatUlang} />
          ) : (
            <KolektibilitasChart data={kolekChart} />
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="summary-card animate-fade-in-up delay-500">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-surface-on">
              Penerimaan Terbaru
            </h2>
            <p className="text-sm text-surface-on-variant">
              10 transaksi terakhir
            </p>
          </div>
        </div>
        {terbaru.loading ? (
          <Memuat />
        ) : pembayaran.length === 0 ? (
          <div className="py-8 text-center text-surface-on-variant text-sm">
            Belum ada penerimaan
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">Tanggal</th>
                  <th className="text-left">Nasabah</th>
                  <th className="text-right">Pokok</th>
                  <th className="text-right">Jasa</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pembayaran.map((p) => (
                  <tr key={p.id}>
                    <td className="text-surface-on-variant">
                      {tanggal(p.tanggal_bayar)}
                    </td>
                    <td>
                      <div className="font-medium">{p.nama}</div>
                      <div className="text-xs text-surface-on-variant">
                        {p.no_nasabah}
                      </div>
                    </td>
                    <td className="text-right">{rupiah(p.pokok_bayar)}</td>
                    <td className="text-right">{rupiah(p.jasa_bayar)}</td>
                    <td className="text-right font-semibold text-primary">
                      {rupiah(p.total)}
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

function BarChart3Icon() {
  return (
    <div className="w-[18px] h-[18px] flex items-center justify-center">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    </div>
  );
}
