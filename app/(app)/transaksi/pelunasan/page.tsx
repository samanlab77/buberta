"use client";

import { useEffect, useState } from "react";
import { rupiah } from "@/lib/utils";
import { simpanTransaksi } from "@/lib/sync";
import { hitungPelunasan } from "@/lib/kredit";
import { apiClient, type Kontrak, type KontrakDetail } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat } from "@/components/DataState";

export default function PelunasanPage() {
  const kontrakQ = useApi<Kontrak[]>(() => apiClient.getKontrakList());
  const daftar = (kontrakQ.data ?? []).filter((k) => k.status === "aktif");

  const [noKontrak, setNoKontrak] = useState("");
  const [detail, setDetail] = useState<KontrakDetail | null>(null);
  const [memuatDetail, setMemuatDetail] = useState(false);
  const [hasil, setHasil] = useState<{ mode: "online" | "antrean" } | null>(
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
    setHasil(null);
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

  const sisaBulan = detail ? detail.tenor - detail.angsuran_terbayar : 0;
  const p = detail
    ? hitungPelunasan(detail.saldo_pinjaman, sisaBulan, detail.persentase_jasa)
    : null;

  const konfirmasi = async () => {
    if (!detail || !p) return;
    setMenyimpan(true);
    setHasil(null);
    try {
      const r = await simpanTransaksi(
        "pelunasan",
        "/api/pelunasan",
        { kontrakId: detail.id },
        `Pelunasan ${detail.no_kontrak} · ${rupiah(p.totalPelunasan)}`,
      );
      setHasil({ mode: r.mode });
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
        <h2 className="text-lg font-semibold text-surface-on mb-4">
          Pelunasan Dipercepat
        </h2>
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
              {kontrakQ.loading
                ? "Memuat kontrak…"
                : "-- Pilih Kontrak Aktif --"}
            </option>
            {daftar.map((k) => (
              <option key={k.id} value={k.no_kontrak}>
                {k.no_kontrak}
                {k.nasabah_nama ? ` — ${k.nasabah_nama}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {memuatDetail && <Memuat pesan="Memuat kontrak…" />}

      {detail && p && (
        <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
          <h2 className="text-lg font-semibold text-surface-on mb-4">
            Rincian Pelunasan
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-surface-on-variant">Nasabah</span>
              <span className="font-medium">
                {detail.nasabah_nama ?? "-"}
                {detail.no_nasabah ? ` (${detail.no_nasabah})` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-on-variant">No. Kontrak</span>
              <span className="font-medium">{detail.no_kontrak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-on-variant">
                Sisa Pokok Pinjaman
              </span>
              <span className="font-medium">{rupiah(p.sisaPokok)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-on-variant">Sisa Tenor</span>
              <span className="font-medium">{sisaBulan} bulan</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-on-variant">
                Jasa Pelunasan (
                {(detail.persentase_jasa * 100).toFixed(1).replace(".", ",")}% ×{" "}
                {sisaBulan} bln)
              </span>
              <span className="font-medium">{rupiah(p.jasaPelunasan)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-outline pt-3 text-lg">
              <span className="font-semibold">Total Pelunasan</span>
              <span className="font-bold text-primary">
                {rupiah(p.totalPelunasan)}
              </span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-error-container rounded-lg">
            <div className="text-sm text-on-error-container">
              ⚠️ Pelunasan dipercepat akan menutup kontrak. Sisa jasa dihitung
              prorata berdasarkan sisa bulan. Tindakan ini tidak dapat
              dibatalkan.
            </div>
          </div>
          <button
            onClick={() => void konfirmasi()}
            disabled={menyimpan}
            className="w-full mt-4 py-3 rounded-lg bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {menyimpan ? "Menyimpan…" : "Konfirmasi Pelunasan"}
          </button>
        </div>
      )}

      {hasil && (
        <div
          className={`rounded-xl p-6 shadow-md1 text-center ${hasil.mode === "online" ? "bg-primary-container" : "bg-tertiary-container"}`}
        >
          <div className="text-4xl mb-2">
            {hasil.mode === "online" ? "✅" : "📥"}
          </div>
          <h3
            className={`text-lg font-semibold mb-1 ${hasil.mode === "online" ? "text-on-primary-container" : "text-on-tertiary-container"}`}
          >
            {hasil.mode === "online"
              ? "Pelunasan Berhasil"
              : "Masuk Antrean Luring"}
          </h3>
          <p
            className={`text-sm ${hasil.mode === "online" ? "text-on-primary-container" : "text-on-tertiary-container"}`}
          >
            {hasil.mode === "online"
              ? `Kontrak ${detail?.no_kontrak ?? ""} telah dilunasi sebesar ${rupiah(p?.totalPelunasan ?? 0)}.`
              : `Pelunasan ${detail?.no_kontrak ?? ""} tersimpan lokal dan terkirim otomatis saat online.`}
          </p>
        </div>
      )}
    </div>
  );
}
