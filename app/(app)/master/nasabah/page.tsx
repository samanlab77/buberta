"use client";

import { UserPlus } from "lucide-react";
import { apiClient, type Nasabah } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

export default function NasabahPage() {
  const { data, loading, error, muatUlang } = useApi<Nasabah[]>(() =>
    apiClient.getNasabah(),
  );
  const nasabah = data ?? [];

  return (
    <div className="summary-card animate-fade-in overflow-hidden !p-0">
      <div className="p-6 flex items-center justify-between border-b border-outline-variant">
        <div>
          <h2 className="text-lg font-bold text-surface-on">
            Data Nasabah
          </h2>
          <p className="text-sm text-surface-on-variant">
            {loading ? "Memuat…" : `${nasabah.length} nasabah terdaftar`}
          </p>
        </div>
        <button className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
          <UserPlus size={16} />
          Tambah Nasabah
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
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left">No</th>
                <th className="text-left">Nama</th>
                <th className="text-left">NIK</th>
                <th className="text-left hidden lg:table-cell">Alamat</th>
                <th className="text-left hidden md:table-cell">Pekerjaan</th>
                <th className="text-left hidden sm:table-cell">Kontak</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {nasabah.map((n) => (
                <tr key={n.id}>
                  <td className="text-surface-on-variant font-mono text-xs">
                    {n.no_nasabah}
                  </td>
                  <td>
                    <div className="font-semibold">{n.nama}</div>
                  </td>
                  <td className="font-mono text-xs text-surface-on-variant">
                    {n.nik}
                  </td>
                  <td className="hidden lg:table-cell text-surface-on-variant">
                    {n.alamat}
                  </td>
                  <td className="hidden md:table-cell text-surface-on-variant">
                    {n.pekerjaan}
                  </td>
                  <td className="hidden sm:table-cell text-surface-on-variant">
                    {n.telepon}
                  </td>
                  <td>
                    <span
                      className={`chip ${
                        n.status === "aktif" ? "chip-blue" : "bg-surface-container text-surface-on-variant"
                      }`}
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
