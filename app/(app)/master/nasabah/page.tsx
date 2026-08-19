"use client";

import { apiClient, type Nasabah } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

export default function NasabahPage() {
  const { data, loading, error, muatUlang } = useApi<Nasabah[]>(() =>
    apiClient.getNasabah(),
  );
  const nasabah = data ?? [];

  return (
    <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-surface-on">
            Data Nasabah
          </h2>
          <p className="text-sm text-surface-on-variant">
            {loading ? "Memuat…" : `${nasabah.length} nasabah terdaftar`}
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-sm">
          + Tambah Nasabah
        </button>
      </div>
      {loading ? (
        <Memuat />
      ) : error ? (
        <Galat pesan={error} onCoba={muatUlang} />
      ) : nasabah.length === 0 ? (
        <Kosong pesan="Belum ada nasabah terdaftar." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-surface-on-variant">
                <th className="text-left py-3 px-4">No</th>
                <th className="text-left py-3 px-4">Nama</th>
                <th className="text-left py-3 px-4">NIK</th>
                <th className="text-left py-3 px-4">Alamat</th>
                <th className="text-left py-3 px-4">Pekerjaan</th>
                <th className="text-left py-3 px-4">Kontak</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {nasabah.map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-outline-variant/50 hover:bg-surface-container"
                >
                  <td className="py-3 px-4">{n.no_nasabah}</td>
                  <td className="py-3 px-4 font-medium">{n.nama}</td>
                  <td className="py-3 px-4">{n.nik}</td>
                  <td className="py-3 px-4">{n.alamat}</td>
                  <td className="py-3 px-4">{n.pekerjaan}</td>
                  <td className="py-3 px-4">{n.telepon}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${n.status === "aktif" ? "bg-primary-container text-on-primary-container" : "bg-surface-variant text-surface-on-variant"}`}
                    >
                      {n.status === "aktif" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
