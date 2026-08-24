"use client";

import { useState, type FormEvent } from "react";
import { X, Package, Plus } from "lucide-react";
import { rupiah, rupiahRingkas, angka } from "@/lib/utils";
import { apiClient, type Produk } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { useSesi } from "@/hooks/useSesi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

function StokChip({ stok }: { stok: number }) {
  if (stok === 0)
    return <span className="chip chip-red">Habis</span>;
  if (stok <= 2)
    return <span className="chip chip-yellow">Stok Menipis</span>;
  return <span className="chip chip-green">Tersedia</span>;
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
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Produk", value: loading ? "…" : `${produk.length} item`, icon: Package, color: "text-primary" },
          { label: "Total Stok", value: loading ? "…" : `${angka(totalStok)} unit`, icon: Package, color: "text-secondary" },
          { label: "Nilai Persediaan", value: loading ? "…" : rupiahRingkas(nilaiPersediaan), icon: Package, color: "text-primary" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="summary-card">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={card.color} />
                <span className="text-sm text-surface-on-variant font-medium">
                  {card.label}
                </span>
              </div>
              <div className="text-xl font-bold text-surface-on">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="summary-card overflow-hidden !p-0">
        <div className="p-6 flex items-center justify-between border-b border-outline-variant">
          <div>
            <h2 className="text-lg font-bold text-surface-on">
              Master Produk
            </h2>
            <p className="text-sm text-surface-on-variant">
              {loading ? "Memuat…" : `${produk.length} produk terdaftar`}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setFormTampil(true)}
              className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Tambah Produk
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
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">Nama Produk</th>
                  <th className="text-left hidden sm:table-cell">Kategori</th>
                  <th className="text-right">Harga Jual</th>
                  <th className="text-right hidden md:table-cell">Stok</th>
                  <th className="text-left">Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {produk.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold">{p.nama}</td>
                    <td className="hidden sm:table-cell">
                      <span className="chip chip-blue">{p.kategori}</span>
                    </td>
                    <td className="text-right">{rupiah(p.harga_jual)}</td>
                    <td className="text-right hidden md:table-cell">
                      {angka(p.stok)}
                    </td>
                    <td>
                      <StokChip stok={p.stok} />
                    </td>
                    <td className="text-right">
                      <button className="text-primary font-medium text-sm hover:underline transition-colors">
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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onBatal}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={simpan}
        className="bg-surface rounded-2xl shadow-md4 w-full max-w-md p-6 space-y-5 animate-fade-in-scale"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-surface-on">
            Tambah Produk
          </h3>
          <button
            type="button"
            onClick={onBatal}
            aria-label="Tutup"
            className="p-1.5 rounded-lg hover:bg-surface-container-high text-surface-on-variant transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {galat && (
          <div className="rounded-xl bg-error-container text-on-error-container text-sm px-4 py-3 animate-fade-in">
            {galat}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-on">
            Nama Produk
          </label>
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            autoFocus
            placeholder="mis. Motor Listrik"
            className="input-md3"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-on">
            Kategori
          </label>
          <input
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            placeholder="mis. Elektronik"
            className="input-md3"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">
              Harga Jual (Rp)
            </label>
            <input
              type="number"
              min={0}
              value={hargaJual}
              onChange={(e) => setHargaJual(e.target.value)}
              placeholder="0"
              className="input-md3"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">Stok</label>
            <input
              type="number"
              min={0}
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              placeholder="0"
              className="input-md3"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onBatal}
            className="btn-outline px-5 py-2.5 text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={menyimpan}
            className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {menyimpan ? "Menyimpan…" : "Simpan Produk"}
          </button>
        </div>
      </form>
    </div>
  );
}
