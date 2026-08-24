"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Calculator,
  Save,
  CheckCircle2,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { hitungKredit, type KreditResult } from "@/lib/kredit";
import { rupiah, tanggal } from "@/lib/utils";
import {
  apiClient,
  type Nasabah,
  type Produk,
  type TenorJasa,
  type Kontrak,
} from "@/lib/api";
import { simpanTransaksi } from "@/lib/sync";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

export default function AkadPage() {
  const nasabahQ = useApi<Nasabah[]>(() => apiClient.getNasabah());
  const produkQ = useApi<Produk[]>(() => apiClient.getProduk());
  const tenorQ = useApi<TenorJasa[]>(() => apiClient.getTenorJasa());
  const kontrakQ = useApi<Kontrak[]>(() => apiClient.getKontrakList());

  // Form state
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

  // Edit state
  const [editItem, setEditItem] = useState<Kontrak | null>(null);
  const [editNasabahId, setEditNasabahId] = useState("");
  const [editProdukId, setEditProdukId] = useState("");
  const [editHarga, setEditHarga] = useState("");
  const [editDp, setEditDp] = useState("");
  const [editTenor, setEditTenor] = useState("");
  const [editing, setEditing] = useState(false);

  // Delete state
  const [hapusItem, setHapusItem] = useState<Kontrak | null>(null);
  const [menghapus, setMenghapus] = useState(false);

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
      void kontrakQ.muatUlang();
    } finally {
      setMenyimpan(false);
    }
  };

  // Edit handlers
  const bukaEdit = (k: Kontrak) => {
    setEditItem(k);
    setEditNasabahId(k.nasabah_id);
    setEditProdukId(k.produk_id || "");
    setEditHarga(String(k.harga_jual));
    setEditDp(String(k.dp));
    setEditTenor(String(k.tenor));
  };

  const prosesEdit = async () => {
    if (!editItem) return;
    setEditing(true);
    try {
      await apiClient.updateKontrak(editItem.id, {
        nasabahId: editNasabahId,
        produkId: editProdukId || undefined,
        hargaJual: parseFloat(editHarga) || 0,
        dp: parseFloat(editDp) || 0,
        tenor: parseInt(editTenor) || 1,
      });
      setEditItem(null);
      void kontrakQ.muatUlang();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah kontrak");
    } finally {
      setEditing(false);
    }
  };

  // Delete handlers
  const prosesHapus = async () => {
    if (!hapusItem) return;
    setMenghapus(true);
    try {
      await apiClient.deleteKontrak(hapusItem.id);
      setHapusItem(null);
      void kontrakQ.muatUlang();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus kontrak");
    } finally {
      setMenghapus(false);
    }
  };

  const daftarKontrak = kontrakQ.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid lg:grid-cols-2 gap-6">
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
                      {result.jadwal.map((j: { bulanKe: number; tanggalJatuhTempo: string; angsuranPokok: number; jasa: number; totalAngsuran: number; sisaSaldo: number }) => (
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

      {/* Daftar Kontrak */}
      <div className="summary-card overflow-hidden !p-0">
        <div className="p-6 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-surface-on">
            Daftar Kontrak
          </h2>
          <p className="text-sm text-surface-on-variant mt-1">
            Kontrak yang belum ada pembayaran bisa diedit atau dihapus
          </p>
        </div>
        {kontrakQ.loading ? (
          <Memuat />
        ) : kontrakQ.error ? (
          <Galat pesan={kontrakQ.error} onCoba={kontrakQ.muatUlang} />
        ) : daftarKontrak.length === 0 ? (
          <Kosong pesan="Belum ada kontrak." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">No. Kontrak</th>
                  <th className="text-left">Nasabah</th>
                  <th className="text-right">Pokok</th>
                  <th className="text-right">Angsuran/Bln</th>
                  <th className="text-center">Tenor</th>
                  <th className="text-center">Terbayar</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftarKontrak.map((k) => (
                  <tr key={k.id}>
                    <td className="font-mono text-xs font-semibold">
                      {k.no_kontrak}
                    </td>
                    <td>
                      <div className="font-medium">{k.nasabah_nama}</div>
                      <div className="text-xs text-surface-on-variant">
                        {k.no_nasabah}
                      </div>
                    </td>
                    <td className="text-right">{rupiah(k.pokok_pinjaman)}</td>
                    <td className="text-right">{rupiah(k.total_angsuran_bulanan)}</td>
                    <td className="text-center">{k.tenor} bln</td>
                    <td className="text-center">
                      {k.angsuran_terbayar}/{k.tenor}
                    </td>
                    <td className="text-center">
                      <span
                        className={`chip ${
                          k.status === "aktif"
                            ? "chip-blue"
                            : k.status === "lunas"
                              ? "chip-green"
                              : "chip-yellow"
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {k.angsuran_terbayar === 0 && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => bukaEdit(k)}
                            className="p-2 rounded-lg hover:bg-primary-container text-surface-on-variant hover:text-primary transition-colors"
                            title="Edit kontrak"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setHapusItem(k)}
                            className="p-2 rounded-lg hover:bg-error-container text-surface-on-variant hover:text-error transition-colors"
                            title="Hapus kontrak"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit Kontrak */}
      {editItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEditItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl shadow-md4 w-full max-w-lg p-6 animate-fade-in-scale"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
                  <Pencil size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-on">
                    Edit Kontrak
                  </h3>
                  <p className="text-xs text-surface-on-variant">
                    {editItem.no_kontrak}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditItem(null)}
                className="p-2 rounded-lg hover:bg-surface-container text-surface-on-variant"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-on">
                  Nasabah
                </label>
                <select
                  value={editNasabahId}
                  onChange={(e) => setEditNasabahId(e.target.value)}
                  className="input-md3"
                >
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
                  value={editProdukId}
                  onChange={(e) => setEditProdukId(e.target.value)}
                  className="input-md3"
                >
                  <option value="">— Tanpa produk —</option>
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
                    value={editHarga}
                    onChange={(e) => setEditHarga(e.target.value)}
                    className="input-md3"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-on">
                    DP (Rp)
                  </label>
                  <input
                    type="number"
                    value={editDp}
                    onChange={(e) => setEditDp(e.target.value)}
                    className="input-md3"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-on">
                  Tenor (bulan)
                </label>
                <select
                  value={editTenor}
                  onChange={(e) => setEditTenor(e.target.value)}
                  className="input-md3"
                >
                  {daftarTenor.map((t) => (
                    <option key={t.id} value={String(t.tenor_bulan)}>
                      {t.tenor_bulan} bulan
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-primary-container/30 rounded-xl p-3 mt-4 text-xs text-on-primary-container">
              Mengubah kontrak akan menghitung ulang jadwal angsuran secara otomatis.
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEditItem(null)}
                className="btn-outline px-5 py-2.5 text-sm"
                disabled={editing}
              >
                Batal
              </button>
              <button
                onClick={() => void prosesEdit()}
                disabled={editing || !editNasabahId || !editHarga}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {editing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {hapusItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setHapusItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl shadow-md4 w-full max-w-md p-6 animate-fade-in-scale"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center shrink-0">
                <AlertTriangle size={24} className="text-error" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface-on">
                  Hapus Kontrak?
                </h3>
                <p className="text-sm text-surface-on-variant">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-4 mb-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-on-variant">No. Kontrak</span>
                  <span className="font-mono font-semibold">{hapusItem.no_kontrak}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-on-variant">Nasabah</span>
                  <span className="font-medium">{hapusItem.nasabah_nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-on-variant">Pokok Pinjaman</span>
                  <span className="font-medium">{rupiah(hapusItem.pokok_pinjaman)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-on-variant">Angsuran Terbayar</span>
                  <span className="font-medium">{hapusItem.angsuran_terbayar}/{hapusItem.tenor} bulan</span>
                </div>
              </div>
            </div>

            <div className="bg-error-container/50 rounded-xl p-3 mb-5 text-sm text-on-error-container">
              Semua data terkait (jadwal, kas bank) akan ikut terhapus. Stok produk akan dikembalikan.
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setHapusItem(null)}
                className="btn-outline px-5 py-2.5 text-sm"
                disabled={menghapus}
              >
                Batal
              </button>
              <button
                onClick={() => void prosesHapus()}
                disabled={menghapus}
                className="px-5 py-2.5 rounded-xl bg-error text-on-error font-semibold text-sm hover:shadow-md1 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {menghapus ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menghapus…
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
