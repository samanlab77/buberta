"use client";

import { rupiah, rupiahRingkas, angka } from "@/lib/utils";
import { apiClient, type Produk } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
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
  const { data, loading, error, muatUlang } = useApi<Produk[]>(() =>
    apiClient.getProduk(),
  );
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
          <button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-sm hover:opacity-90">
            + Tambah Produk
          </button>
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
    </div>
  );
}
