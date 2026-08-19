"use client";

import { useEffect, useState } from "react";
import { rupiah, tanggal } from "@/lib/utils";
import { simpanTransaksi } from "@/lib/sync";
import {
  apiClient,
  type Kontrak,
  type KontrakDetail,
  type PenerimaanTerbaru,
} from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";
import PanelAntrean from "@/components/PanelAntrean";

export default function AngsuranPage() {
  const kontrakQ = useApi<Kontrak[]>(() => apiClient.getKontrakList());
  const terbaruQ = useApi<PenerimaanTerbaru[]>(() =>
    apiClient.getPenerimaanTerbaru(),
  );
  const daftarKontrak = (kontrakQ.data ?? []).filter(
    (k) => k.status === "aktif",
  );

  const [noKontrak, setNoKontrak] = useState("");
  const [bulan, setBulan] = useState("");
  const [detail, setDetail] = useState<KontrakDetail | null>(null);
  const [memuatDetail, setMemuatDetail] = useState(false);
  const [pesan, setPesan] = useState<{ mode: "online" | "antrean" } | null>(
    null,
  );
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    if (!noKontrak) {
      setDetail(null);
      return;
    }
    let batal = false;
    setMemuatDetail(true);
    setDetail(null);
    apiClient
      .getKontrak(noKontrak)
      .then((d) => {
        if (!batal) setDetail(d);
      })
      .catch(() => {
        if (!batal) setDetail(null);
      })
      .finally(() => {
        if (!batal) setMemuatDetail(false);
      });
    return () => {
      batal = true;
    };
  }, [noKontrak]);

  const terima = async () => {
    if (!detail) return;
    setMenyimpan(true);
    setPesan(null);
    try {
      const hasil = await simpanTransaksi(
        "angsuran",
        "/api/angsuran",
        {
          kontrakId: detail.id,
          bulanBerjalan: Number(bulan) || detail.angsuran_terbayar + 1,
          jumlahAngsuran: detail.total_angsuran_bulanan,
        },
        `Angsuran ${detail.no_kontrak} · ${rupiah(detail.total_angsuran_bulanan)}`,
      );
      setPesan({ mode: hasil.mode });
      if (hasil.mode === "online") {
        void terbaruQ.muatUlang();
        apiClient
          .getKontrak(noKontrak)
          .then(setDetail)
          .catch(() => {});
      }
    } finally {
      setMenyimpan(false);
    }
  };

  const terbaru = terbaruQ.data ?? [];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
          <h2 className="text-lg font-semibold text-surface-on mb-4">
            Penerimaan Angsuran
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-surface-on-variant block mb-1">
                No. Kontrak
              </label>
              <select
                value={noKontrak}
                onChange={(e) => setNoKontrak(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
              >
                <option value="">
                  {kontrakQ.loading ? "Memuat kontrak…" : "-- Pilih Kontrak --"}
                </option>
                {daftarKontrak.map((k) => (
                  <option key={k.id} value={k.no_kontrak}>
                    {k.no_kontrak}
                    {k.nasabah_nama ? ` — ${k.nasabah_nama}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-on-variant block mb-1">
                Bulan ke-
              </label>
              <input
                type="number"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                placeholder={
                  detail ? String(detail.angsuran_terbayar + 1) : "1"
                }
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
              />
            </div>
            <div className="bg-surface-container rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium text-surface-on-variant mb-2">
                Pemecahan Otomatis
              </div>
              <div className="flex justify-between text-sm">
                <span>Pokok</span>
                <span className="font-semibold">
                  {detail ? rupiah(detail.angsuran_pokok_bulanan) : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Jasa</span>
                <span className="font-semibold">
                  {detail ? rupiah(detail.jasa_bulanan) : "—"}
                </span>
              </div>
              <div className="flex justify-between border-t border-outline-variant pt-2 text-base">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">
                  {detail ? rupiah(detail.total_angsuran_bulanan) : "—"}
                </span>
              </div>
            </div>
            <button
              onClick={() => void terima()}
              disabled={!detail || menyimpan}
              className="w-full py-3 rounded-lg bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {menyimpan ? "Menyimpan…" : "Terima Angsuran"}
            </button>
            {pesan && (
              <div
                className={`rounded-lg py-2 px-3 text-sm text-center ${pesan.mode === "online" ? "bg-primary-container text-on-primary-container" : "bg-tertiary-container text-on-tertiary-container"}`}
              >
                {pesan.mode === "online"
                  ? "✅ Angsuran tersimpan ke server."
                  : "📥 Sedang luring — angsuran masuk antrean, terkirim otomatis saat online."}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
          <h2 className="text-lg font-semibold text-surface-on mb-4">
            Info Kontrak
          </h2>
          {memuatDetail ? (
            <Memuat pesan="Memuat kontrak…" />
          ) : detail ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-surface-on-variant">Nasabah</span>
                <span className="font-medium">
                  {detail.nasabah_nama ?? "-"}
                  {detail.no_nasabah ? ` (${detail.no_nasabah})` : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-on-variant">Pokok Pinjaman</span>
                <span className="font-medium">
                  {rupiah(detail.pokok_pinjaman)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-on-variant">Tenor</span>
                <span className="font-medium">{detail.tenor} bulan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-on-variant">Angsuran/Bulan</span>
                <span className="font-medium">
                  {rupiah(detail.total_angsuran_bulanan)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-on-variant">Sudah Dibayar</span>
                <span className="font-medium">
                  {detail.angsuran_terbayar} bulan
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-on-variant">Sisa Saldo</span>
                <span className="font-medium">
                  {rupiah(detail.saldo_pinjaman)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-on-variant">Status</span>
                <span className="px-3 py-1 rounded text-xs font-medium bg-primary-container text-on-primary-container">
                  {detail.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-surface-on-variant text-center py-8">
              Pilih kontrak untuk melihat detail
            </div>
          )}
        </div>
      </div>

      <PanelAntrean />

      <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-surface-on">
            Penerimaan Terbaru
          </h2>
        </div>
        {terbaruQ.loading ? (
          <Memuat />
        ) : terbaruQ.error ? (
          <Galat pesan={terbaruQ.error} onCoba={terbaruQ.muatUlang} />
        ) : terbaru.length === 0 ? (
          <Kosong pesan="Belum ada penerimaan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-surface-on-variant">
                  <th className="text-left py-3 px-4">Bukti</th>
                  <th className="text-left py-3 px-4">Tanggal</th>
                  <th className="text-left py-3 px-4">Nasabah</th>
                  <th className="text-right py-3 px-4">Pokok</th>
                  <th className="text-right py-3 px-4">Jasa</th>
                  <th className="text-right py-3 px-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {terbaru.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-outline-variant/50 hover:bg-surface-container"
                  >
                    <td className="py-3 px-4 font-medium">
                      {p.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4">{tanggal(p.tanggal_bayar)}</td>
                    <td className="py-3 px-4">
                      {p.nama} ({p.no_nasabah})
                    </td>
                    <td className="text-right py-3 px-4">
                      {rupiah(p.pokok_bayar)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {rupiah(p.jasa_bayar)}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
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
