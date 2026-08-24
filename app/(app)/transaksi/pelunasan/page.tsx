"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";
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
      .then((d) => { if (!batal) setDetail(d); })
      .catch(() => { if (!batal) setDetail(null); })
      .finally(() => { if (!batal) setMemuatDetail(false); });
    return () => { batal = true; };
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="summary-card">
        <div className="flex items-center gap-2 mb-5">
          <FileText size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-surface-on">
            Pelunasan Dipercepat
          </h2>
        </div>
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
              {kontrakQ.loading
                ? "Memuat kontrak…"
                : "— Pilih Kontrak Aktif —"}
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
        <div className="summary-card">
          <h2 className="text-lg font-bold text-surface-on mb-4">
            Rincian Pelunasan
          </h2>
          <div className="space-y-3">
            {[
              { label: "Nasabah", value: `${detail.nasabah_nama ?? "-"}${detail.no_nasabah ? ` (${detail.no_nasabah})` : ""}` },
              { label: "No. Kontrak", value: detail.no_kontrak },
              { label: "Sisa Pokok Pinjaman", value: rupiah(p.sisaPokok) },
              { label: "Sisa Tenor", value: `${sisaBulan} bulan` },
              {
                label: `Jasa Pelunasan (${(detail.persentase_jasa * 100).toFixed(1).replace(".", ",")}% × ${sisaBulan} bln)`,
                value: rupiah(p.jasaPelunasan),
              },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-surface-on-variant">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between border-t-2 border-outline pt-3 text-lg">
              <span className="font-semibold text-surface-on">Total Pelunasan</span>
              <span className="font-bold text-primary">
                {rupiah(p.totalPelunasan)}
              </span>
            </div>
          </div>

          <div className="mt-5 p-4 bg-error-container rounded-xl flex items-start gap-3 animate-fade-in">
            <AlertTriangle size={18} className="text-error shrink-0 mt-0.5" />
            <div className="text-sm text-on-error-container">
              Pelunasan dipercepat akan menutup kontrak. Sisa jasa dihitung
              prorata berdasarkan sisa bulan. Tindakan ini tidak dapat
              dibatalkan.
            </div>
          </div>

          <button
            onClick={() => void konfirmasi()}
            disabled={menyimpan}
            className="btn-primary w-full mt-5 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {menyimpan ? "Menyimpan…" : "Konfirmasi Pelunasan"}
          </button>
        </div>
      )}

      {hasil && (
        <div
          className={`rounded-2xl p-8 shadow-md1 text-center animate-fade-in-scale ${
            hasil.mode === "online" ? "bg-success-container" : "bg-tertiary-container"
          }`}
        >
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-white/50">
            <CheckCircle2 size={32} className={hasil.mode === "online" ? "text-success" : "text-on-tertiary-container"} />
          </div>
          <h3
            className={`text-lg font-bold mb-2 ${
              hasil.mode === "online" ? "text-on-success-container" : "text-on-tertiary-container"
            }`}
          >
            {hasil.mode === "online" ? "Pelunasan Berhasil" : "Masuk Antrean Luring"}
          </h3>
          <p
            className={`text-sm ${
              hasil.mode === "online" ? "text-on-success-container" : "text-on-tertiary-container"
            }`}
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
