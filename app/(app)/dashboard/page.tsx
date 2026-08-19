"use client";

import { angka, rupiahRingkas } from "@/lib/utils";
import {
  apiClient,
  type KolekSummary,
  type Rekap,
  type TrenBulan,
} from "@/lib/api";
import { KOLEK_COLOR, KOLEK_LABEL, type StatusKolek } from "@/lib/kredit";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat } from "@/components/DataState";
import RevenueChart from "@/components/RevenueChart";
import KolektibilitasChart from "@/components/KolektibilitasChart";

const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
function labelBulan(ym: string): string {
  const [y, m] = ym.split("-");
  return `${BULAN[Number(m) - 1] ?? m ?? ""} ${y?.slice(2) ?? ""}`;
}

export default function DashboardPage() {
  const rekap = useApi<Rekap>(() => apiClient.getRekap());
  const kolek = useApi<KolekSummary[]>(() => apiClient.getKolektibilitas());
  const tren = useApi<TrenBulan[]>(() => apiClient.getTrenPenerimaan());

  const cards = [
    {
      label: "Total Saldo Pinjaman",
      value: rekap.data?.saldo_pinjaman ?? 0,
      icon: "💰",
      bg: "bg-primary-container",
      uang: true,
    },
    {
      label: "Penerimaan Bulan Ini",
      value: rekap.data?.penerimaan_bulan_ini ?? 0,
      icon: "📥",
      bg: "bg-tertiary-container",
      uang: true,
    },
    {
      label: "Nasabah Aktif",
      value: rekap.data?.nasabah_aktif ?? 0,
      icon: "👥",
      bg: "bg-secondary-container",
      uang: false,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-surface-container-low rounded-xl p-5 shadow-md1"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 text-2xl ${card.bg}`}
            >
              {card.icon}
            </div>
            <div className="text-sm text-surface-on-variant font-medium">
              {card.label}
            </div>
            <div className="text-2xl font-bold text-surface-on mt-1">
              {rekap.loading
                ? "…"
                : card.uang
                  ? rupiahRingkas(card.value)
                  : angka(card.value)}
            </div>
          </div>
        ))}
      </div>
      {rekap.error && <Galat pesan={rekap.error} onCoba={rekap.muatUlang} />}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <h2 className="text-lg font-semibold text-surface-on mb-1">
            Tren Penerimaan
          </h2>
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

        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <h2 className="text-lg font-semibold text-surface-on mb-1">
            Distribusi Kolektibilitas
          </h2>
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
    </div>
  );
}
