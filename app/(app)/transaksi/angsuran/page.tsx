"use client";

import { useEffect, useState } from "react";
import { CreditCard, FileText, CheckCircle2 } from "lucide-react";
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
      .then((d) => { if (!batal) setDetail(d); })
      .catch(() => { if (!batal) setDetail(null); })
      .finally(() => { if (!batal) setMemuatDetail(false); });
    return () => { batal = true; };
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
        apiClient.getKontrak(noKontrak).then(setDetail).catch(() => {});
      }
    } finally {
      setMenyimpan(false);
    }
  };

  const terbaru = terbaruQ.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="summary-card">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-surface-on">
              Penerimaan Angsuran
            </h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-on">
                No. Kontrak
              </label>
              <select
                value={noKontrak}
                onChange={(e) => setNoKontrak(e.target.value)}
                className="input-md3"
              >
                <option value="">
                  {kontrakQ.loading ? "Memuat kontrak…" : "— Pilih Kontrak —"}
                </option>
                {daftarKontrak.map((k) => (
                  <option key={k.id} value={k.no_kontrak}>
                    {k.no_kontrak}
                    {k.nasabah_nama ? ` — ${k.nasabah_nama}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-on">
                Bulan ke-
              </label>
              <input
                type="number"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                placeholder={detail ? String(detail.angsuran_terbayar + 1) : "1"}
                className="input-md3"
              />
            </div>
            <div className="bg-surface-container rounded-xl p-4 space-y-2">
              <div className="text-sm font-semibold text-surface-on-variant mb-2">
                Pemecahan Otomatis
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-on-variant">Pokok</span>
                <span className="font-semibold">
                  {detail ? rupiah(detail.angsuran_pokok_bulanan) : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-on-variant">Jasa</span>
                <span className="font-semibold">
                  {detail ? rupiah(detail.jasa_bulanan) : "—"}
                </span>
              </div>
              <div className="flex justify-between border-t border-outline-variant pt-2 text-base">
                <span className="font-medium text-surface-on">Total</span>
                <span className="font-bold text-primary">
                  {detail ? rupiah(detail.total_angsuran_bulanan) : "—"}
                </span>
              </div>
            </div>
            <button
              onClick={() => void terima()}
              disabled={!detail || menyimpan}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {menyimpan ? "Menyimpan…" : "Terima Angsuran"}
            </button>
            {pesan && (
              <div
                className={`rounded-xl py-2.5 px-4 text-sm text-center font-medium animate-fade-in ${
                  pesan.mode === "online" ? "chip-green" : "chip-yellow"
                }`}
              >
                {pesan.mode === "online"
                  ? "✅ Angsuran tersimpan ke server."
                  : "📥 Sedang luring — angsuran masuk antrean, terkirim otomatis saat online."}
              </div>
            )}
          </div>
        </div>

        {/* Info Kontrak */}
        <div className="summary-card">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-surface-on">Info Kontrak</h2>
          </div>
          {memuatDetail ? (
            <Memuat pesan="Memuat kontrak…" />
          ) : detail ? (
            <div className="space-y-3">
              {[
                { label: "Nasabah", value: `${detail.nasabah_nama ?? "-"}${detail.no_nasabah ? ` (${detail.no_nasabah})` : ""}` },
                { label: "Pokok Pinjaman", value: rupiah(detail.pokok_pinjaman) },
                { label: "Tenor", value: `${detail.tenor} bulan` },
                { label: "Angsuran/Bulan", value: rupiah(detail.total_angsuran_bulanan) },
                { label: "Sudah Dibayar", value: `${detail.angsuran_terbayar} bulan` },
                { label: "Sisa Saldo", value: rupiah(detail.saldo_pinjaman) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-surface-on-variant">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-surface-on-variant text-sm">Status</span>
                <span className="chip chip-blue">{detail.status}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-surface-on-variant py-12">
              <FileText size={28} className="text-outline-variant mb-2" />
              <p className="text-sm font-medium">Pilih kontrak untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>

      <PanelAntrean />

      {/* Recent payments */}
      <div className="summary-card overflow-hidden !p-0">
        <div className="p-6 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-surface-on">
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
                {terbaru.map((p) => (
                  <tr key={p.id}>
                    <td>{tanggal(p.tanggal_bayar)}</td>
                    <td>
                      <div className="font-medium">{p.nama}</div>
                      <div className="text-xs text-surface-on-variant">{p.no_nasabah}</div>
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
