"use client";

import { useMemo, useState } from "react";
import { FileText, Calculator, Save, CheckCircle2 } from "lucide-react";
import { hitungKredit, type KreditResult } from "@/lib/kredit";
import { rupiah, tanggal } from "@/lib/utils";
import {
  apiClient,
  type Nasabah,
  type Produk,
  type TenorJasa,
} from "@/lib/api";
import { simpanTransaksi } from "@/lib/sync";
import { useApi } from "@/hooks/useApi";

export default function AkadPage() {
  const nasabahQ = useApi<Nasabah[]>(() => apiClient.getNasabah());
  const produkQ = useApi<Produk[]>(() => apiClient.getProduk());
  const tenorQ = useApi<TenorJasa[]>(() => apiClient.getTenorJasa());

  const [nasabahId, setNasabahId] = useState("");
  const [produkId, setProdukId] = useState("");
  const [harga, setHarga] = useState("");
  const [dp, setDp] = useState("");
  const [tenor, setTenor] = useState("");
  const [result, setResult] = useState<KreditResult | null>(null);
  const [pesan, setPesan] = useState<{ mode: "online" | "antrean" } | null>(
    null,
  );
  const [menyimpan, setMenyimpan] = useState(false);

  const daftarTenor = tenorQ.data ?? [];
  const rate = useMemo(() => {
    const t = daftarTenor.find((x) => String(x.tenor_bulan) === tenor);
    return t ? t.persentase_jasa : 0.015;
  }, [daftarTenor, tenor]);

  const pilihProduk = (id: string) => {
    setProdukId(id);
    const p = (produkQ.data ?? []).find((x) => x.id === id);
    if (p) setHarga(String(p.harga_jual));
  };

  const handleCalc = () => {
    if (!tenor) return;
    setResult(
      hitungKredit({
        hargaJual: parseFloat(harga) || 0,
        dp: parseFloat(dp) || 0,
        tenor: parseInt(tenor) || 1,
        persentaseJasa: rate,
        tanggalAkad: new Date().toISOString(),
      }),
    );
  };

  const simpan = async () => {
    if (!nasabahId || !tenor || !harga) return;
    setMenyimpan(true);
    setPesan(null);
    try {
      const hasil = await simpanTransaksi(
        "akad",
        "/api/kontrak",
        {
          nasabahId,
          produkId: produkId || undefined,
          hargaJual: parseFloat(harga) || 0,
          dp: parseFloat(dp) || 0,
          tenor: parseInt(tenor) || 1,
        },
        `Akad kredit ${rupiah(parseFloat(harga) || 0)} · ${tenor} bln`,
      );
      setPesan({ mode: hasil.mode });
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Form */}
      <div className="summary-card">
        <div className="flex items-center gap-2 mb-5">
          <FileText size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-surface-on">
            Pengajuan Kredit (Akad)
          </h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">
              Nasabah
            </label>
            <select
              value={nasabahId}
              onChange={(e) => setNasabahId(e.target.value)}
              className="input-md3"
            >
              <option value="">
                {nasabahQ.loading ? "Memuat nasabah…" : "— Pilih Nasabah —"}
              </option>
              {(nasabahQ.data ?? []).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.no_nasabah} — {n.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">
              Produk (opsional)
            </label>
            <select
              value={produkId}
              onChange={(e) => pilihProduk(e.target.value)}
              className="input-md3"
            >
              <option value="">
                {produkQ.loading ? "Memuat produk…" : "— Tanpa produk —"}
              </option>
              {(produkQ.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} — {rupiah(p.harga_jual)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-on">
                Harga Jual (Rp)
              </label>
              <input
                type="number"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                placeholder="0"
                className="input-md3"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-on">
                DP (Rp)
              </label>
              <input
                type="number"
                value={dp}
                onChange={(e) => setDp(e.target.value)}
                placeholder="0"
                className="input-md3"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">
              Tenor (bulan)
            </label>
            <select
              value={tenor}
              onChange={(e) => setTenor(e.target.value)}
              className="input-md3"
            >
              <option value="">
                {tenorQ.loading ? "Memuat tenor…" : "— Pilih Tenor —"}
              </option>
              {daftarTenor.map((t) => (
                <option key={t.id} value={String(t.tenor_bulan)}>
                  {t.tenor_bulan} bulan
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCalc}
            disabled={!tenor}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Calculator size={16} />
            Hitung & Buat Jadwal
          </button>
        </div>
      </div>

      {/* Result */}
      <div className="space-y-4">
        {result ? (
          <>
            <div className="summary-card">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-surface-on">Ringkasan</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Pokok Pinjaman", value: rupiah(result.pokokPinjaman) },
                  {
                    label: `Jasa Total (${(rate * 100).toFixed(1).replace(".", ",")}% × ${tenor} bln)`,
                    value: rupiah(result.jasaTotal),
                  },
                  { label: "Total", value: rupiah(result.total) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-surface-on-variant">{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-outline-variant pt-3">
                  <span className="text-surface-on-variant font-medium">
                    Angsuran/Bulan
                  </span>
                  <span className="font-bold text-primary text-lg">
                    {rupiah(result.angsuranBulanan)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => void simpan()}
                disabled={!nasabahId || !harga || menyimpan}
                className="btn-primary w-full mt-5 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {menyimpan ? "Menyimpan…" : "Simpan Akad"}
              </button>
              {!nasabahId && (
                <p className="text-xs text-error mt-2 text-center">
                  Pilih nasabah dulu untuk menyimpan akad.
                </p>
              )}
              {pesan && (
                <div
                  className={`mt-3 rounded-xl py-2.5 px-4 text-sm text-center font-medium animate-fade-in ${
                    pesan.mode === "online"
                      ? "chip-green"
                      : "chip-yellow"
                  }`}
                >
                  {pesan.mode === "online"
                    ? "✅ Akad tersimpan ke server."
                    : "📥 Sedang luring — akad masuk antrean, terkirim otomatis saat online."}
                </div>
              )}
            </div>

            <div className="summary-card overflow-hidden !p-0">
              <div className="p-5 border-b border-outline-variant">
                <h2 className="text-lg font-bold text-surface-on">
                  Jadwal Angsuran
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Bulan</th>
                      <th className="text-left">Jatuh Tempo</th>
                      <th className="text-right">Pokok</th>
                      <th className="text-right">Jasa</th>
                      <th className="text-right">Total</th>
                      <th className="text-right">Sisa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.jadwal.map((j) => (
                      <tr key={j.bulanKe}>
                        <td className="font-semibold">{j.bulanKe}</td>
                        <td>{tanggal(j.tanggalJatuhTempo)}</td>
                        <td className="text-right">{rupiah(j.angsuranPokok)}</td>
                        <td className="text-right">{rupiah(j.jasa)}</td>
                        <td className="text-right font-semibold">
                          {rupiah(j.totalAngsuran)}
                        </td>
                        <td className="text-right text-surface-on-variant">
                          {rupiah(j.sisaSaldo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="summary-card flex flex-col items-center justify-center text-surface-on-variant text-center min-h-[300px]">
            <Calculator size={32} className="text-outline-variant mb-3" />
            <p className="text-sm font-medium">
              Isi form di sebelah kiri untuk melihat jadwal angsuran
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
