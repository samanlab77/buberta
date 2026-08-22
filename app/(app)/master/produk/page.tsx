"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { rupiah, rupiahRingkas, angka } from "@/lib/utils";
import { apiClient, type Produk } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { useSesi } from "@/hooks/useSesi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

function StokChip({ stok }: { stok: number }) {
  if (stok === 0)
    return (
      <span className="px-3 py-1 rounded text-xs font-medium bg-error-container text-on-error-container">
        Habis
      </span>
    );
  if (stok <= 2)
    return (
      <span className="px-3 py-1 rounded text-xs font-medium bg-tertiary-container text-on-tertiary-container">
        Stok Menipis
      </span>
    );
  return (
    <span className="px-3 py-1 rounded text-xs font-medium bg-primary-container text-on-primary-container">
      Tersedia
    </span>
  );
}

export default function ProdukPage() {
  const sesi = useSesi();
  const isAdmin = sesi?.role === "admin";
  const { data, loading, error, muatUlang } = useApi<Produk[]>(() =>
    apiClient.getProduk(),
  );
  const [formTampil, setFormTampil] = useState(false);
  const produk = data ?? [];
  const totalStok = produk.reduce((s, p) => s + p.stok, 0);
  const nilaiPersediaan = produk.reduce((s, p) => s + p.harga_jual * p.stok, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <div className="text-sm text-surface-on-variant font-medium">
            Total Produk
          </div>
          <div className="text-2xl font-bold text-surface-on mt-1">
            {loading ? "…" : `${produk.length} item`}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <div className="text-sm text-surface-on-variant font-medium">
            Total Stok
          </div>
          <div className="text-2xl font-bold text-surface-on mt-1">
            {loading ? "…" : `${angka(totalStok)} unit`}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md1">
          <div className="text-sm text-surface-on-variant font-medium">
            Nilai Persediaan
          </div>
          <div className="text-2xl font-bold text-primary mt-1">
            {loading ? "…" : rupiahRingkas(nilaiPersediaan)}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-surface-on">
              Master Produk
            </h2>
            <p className="text-sm text-surface-on-variant">
              {loading ? "Memuat…" : `${produk.length} produk terdaftar`}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setFormTampil(true)}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-sm hover:opacity-90"
            >
              + Tambah Produk
            </button>
          )}
        </div>
        {loading ? (
          <Memuat />
        ) : error ? (
          <Galat pesan={error} onCoba={muatUlang} />
        ) : produk.length === 0 ? (
          <Kosong pesan="Belum ada produk." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-surface-on-variant">
                  <th className="text-left py-3 px-4">Nama Produk</th>
                  <th className="text-left py-3 px-4">Kategori</th>
                  <th className="text-right py-3 px-4">Harga Jual</th>
                  <th className="text-right py-3 px-4">Stok</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {produk.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-outline-variant/50 hover:bg-surface-container"
                  >
                    <td className="py-3 px-4 font-medium">{p.nama}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded text-xs font-medium bg-secondary-container text-secondary-on-container">
                        {p.kategori}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      {rupiah(p.harga_jual)}
                    </td>
                    <td className="text-right py-3 px-4">{angka(p.stok)}</td>
                    <td className="py-3 px-4">
                      <StokChip stok={p.stok} />
                    </td>
                    <td className="text-right py-3 px-4">
                      <button className="text-primary font-medium hover:underline">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formTampil && (
        <FormTambahProduk
          onBatal={() => setFormTampil(false)}
          onSelesai={async () => {
            setFormTampil(false);
            await muatUlang();
          }}
        />
      )}
    </div>
  );
}

function FormTambahProduk({
  onBatal,
  onSelesai,
}: {
  onBatal: () => void;
  onSelesai: () => void | Promise<void>;
}) {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [stok, setStok] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function simpan(e: FormEvent) {
    e.preventDefault();
    setGalat(null);
    const harga = Number(hargaJual);
    const jumlahStok = Number(stok || "0");
    if (!nama.trim()) {
      setGalat("Nama produk wajib diisi.");
      return;
    }
    if (!Number.isFinite(harga) || harga < 0) {
      setGalat("Harga jual harus berupa angka minimal 0.");
      return;
    }
    if (!Number.isFinite(jumlahStok) || jumlahStok < 0) {
      setGalat("Stok harus berupa angka minimal 0.");
      return;
    }
    setMenyimpan(true);
    try {
      await apiClient.createProduk({
        nama: nama.trim(),
        kategori: kategori.trim(),
        harga_jual: Math.round(harga),
        stok: Math.round(jumlahStok),
      });
      await onSelesai();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menyimpan produk.");
      setMenyimpan(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onBatal}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={simpan}
        className="bg-surface rounded-xl shadow-md3 w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-on">
            Tambah Produk
          </h3>
          <button
            type="button"
            onClick={onBatal}
            aria-label="Tutup"
            className="p-1.5 rounded-full hover:bg-surface-container-high text-surface-on-variant"
          >
            <X size={20} />
          </button>
        </div>

        {galat && (
          <div className="rounded-lg bg-error-container text-on-error-container text-sm px-3 py-2">
            {galat}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-surface-on">
            Nama Produk
          </label>
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            autoFocus
            placeholder="mis. Motor Listrik"
            className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-surface-on focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-surface-on">
            Kategori
          </label>
          <input
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            placeholder="mis. Elektronik"
            className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-surface-on focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-on">
              Harga Jual (Rp)
            </label>
            <input
              type="number"
              min={0}
              value={hargaJual}
              onChange={(e) => setHargaJual(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-surface-on focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-on">Stok</label>
            <input
              type="number"
              min={0}
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-surface-on focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onBatal}
            className="px-4 py-2 rounded-lg text-surface-on font-medium text-sm hover:bg-surface-container-high"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={menyimpan}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-sm hover:opacity-90 disabled:opacity-60"
          >
            {menyimpan ? "Menyimpan…" : "Simpan Produk"}
          </button>
        </div>
      </form>
    </div>
  );
}
