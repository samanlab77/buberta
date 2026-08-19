"use client";

import { useMemo, useState } from "react";
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
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
        <h2 className="text-lg font-semibold text-surface-on mb-4">
          Pengajuan Kredit (Akad)
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-surface-on-variant block mb-1">
              Nasabah
            </label>
            <select
              value={nasabahId}
              onChange={(e) => setNasabahId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
            >
              <option value="">
                {nasabahQ.loading ? "Memuat nasabah…" : "-- Pilih Nasabah --"}
              </option>
              {(nasabahQ.data ?? []).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.no_nasabah} — {n.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-surface-on-variant block mb-1">
              Produk (opsional)
            </label>
            <select
              value={produkId}
              onChange={(e) => pilihProduk(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
            >
              <option value="">
                {produkQ.loading ? "Memuat produk…" : "-- Tanpa produk --"}
              </option>
              {(produkQ.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} — {rupiah(p.harga_jual)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-surface-on-variant block mb-1">
              Harga Jual (Rp)
            </label>
            <input
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-surface-on-variant block mb-1">
              DP (Rp)
            </label>
            <input
              type="number"
              value={dp}
              onChange={(e) => setDp(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-surface-on-variant block mb-1">
              Tenor (bulan)
            </label>
            <select
              value={tenor}
              onChange={(e) => setTenor(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
            >
              <option value="">
                {tenorQ.loading ? "Memuat tenor…" : "-- Pilih Tenor --"}
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
            className="w-full py-3 rounded-lg bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60"
          >
            Hitung & Buat Jadwal
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {result ? (
          <>
            <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
              <h2 className="text-lg font-semibold text-surface-on mb-4">
                Ringkasan
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-surface-on-variant">
                    Pokok Pinjaman
                  </span>
                  <span className="font-semibold">
                    {rupiah(result.pokokPinjaman)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-on-variant">
                    Jasa Total ({(rate * 100).toFixed(1).replace(".", ",")}% ×{" "}
                    {tenor} bln)
                  </span>
                  <span className="font-semibold">
                    {rupiah(result.jasaTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-on-variant">Total</span>
                  <span className="font-semibold">{rupiah(result.total)}</span>
                </div>
                <div className="flex justify-between border-t border-outline-variant pt-2">
                  <span className="text-surface-on-variant">
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
                className="w-full mt-4 py-3 rounded-lg bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {menyimpan ? "Menyimpan…" : "Simpan Akad"}
              </button>
              {!nasabahId && (
                <p className="text-xs text-error mt-2 text-center">
                  Pilih nasabah dulu untuk menyimpan akad.
                </p>
              )}
              {pesan && (
                <div
                  className={`mt-3 rounded-lg py-2 px-3 text-sm text-center ${pesan.mode === "online" ? "bg-primary-container text-on-primary-container" : "bg-tertiary-container text-on-tertiary-container"}`}
                >
                  {pesan.mode === "online"
                    ? "✅ Akad tersimpan ke server."
                    : "📥 Sedang luring — akad masuk antrean, terkirim otomatis saat online."}
                </div>
              )}
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
              <h2 className="text-lg font-semibold text-surface-on mb-4">
                Jadwal Angsuran
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant text-surface-on-variant">
                      <th className="text-left py-2 px-2">Bulan</th>
                      <th className="text-left py-2 px-2">Jatuh Tempo</th>
                      <th className="text-right py-2 px-2">Pokok</th>
                      <th className="text-right py-2 px-2">Jasa</th>
                      <th className="text-right py-2 px-2">Total</th>
                      <th className="text-right py-2 px-2">Sisa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.jadwal.map((j) => (
                      <tr
                        key={j.bulanKe}
                        className="border-b border-outline-variant/50"
                      >
                        <td className="py-2 px-2">{j.bulanKe}</td>
                        <td className="py-2 px-2">
                          {tanggal(j.tanggalJatuhTempo)}
                        </td>
                        <td className="text-right py-2 px-2">
                          {rupiah(j.angsuranPokok)}
                        </td>
                        <td className="text-right py-2 px-2">
                          {rupiah(j.jasa)}
                        </td>
                        <td className="text-right py-2 px-2 font-semibold">
                          {rupiah(j.totalAngsuran)}
                        </td>
                        <td className="text-right py-2 px-2">
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
          <div className="bg-surface-container-low rounded-xl p-6 shadow-md1 flex items-center justify-center text-surface-on-variant text-center min-h-[200px]">
            Isi form di sebelah kiri untuk melihat jadwal angsuran
          </div>
        )}
      </div>
    </div>
  );
}
