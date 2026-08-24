"use client";

import { Users, Plus, AlertTriangle } from "lucide-react";

const penggunaData = [
  {
    nama: "Administrator",
    email: "admin@buberta.id",
    role: "admin",
    deskripsi: "Akses penuh sistem",
  },
  {
    nama: "Manager Buberta",
    email: "manager@buberta.id",
    role: "manager",
    deskripsi: "Persetujuan kredit & laporan",
  },
  {
    nama: "Kasir Bumdes",
    email: "kasir@buberta.id",
    role: "kasir",
    deskripsi: "Input transaksi harian",
  },
];

const roleChip: Record<string, string> = {
  admin: "chip-blue",
  manager: "chip-yellow",
  kasir: "bg-secondary-container text-secondary-on-container",
};

export default function PenggunaPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="summary-card overflow-hidden !p-0">
        <div className="p-6 flex items-center justify-between border-b border-outline-variant">
          <div>
            <h2 className="text-lg font-bold text-surface-on flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Manajemen Pengguna
            </h2>
            <p className="text-sm text-surface-on-variant">
              {penggunaData.length} pengguna terdaftar · 3 peran
            </p>
          </div>
          <button className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <Plus size={16} />
            Tambah Pengguna
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left">Nama</th>
                <th className="text-left hidden sm:table-cell">Email</th>
                <th className="text-left">Peran</th>
                <th className="text-left hidden md:table-cell">Hak Akses</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {penggunaData.map((u) => (
                <tr key={u.email}>
                  <td className="font-semibold">{u.nama}</td>
                  <td className="hidden sm:table-cell text-surface-on-variant">
                    {u.email}
                  </td>
                  <td>
                    <span className={`chip capitalize ${roleChip[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="hidden md:table-cell text-surface-on-variant">
                    {u.deskripsi}
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
      </div>

      <div className="bg-tertiary-container rounded-xl p-5 flex items-start gap-3 animate-fade-in">
        <AlertTriangle size={18} className="text-on-tertiary-container shrink-0 mt-0.5" />
        <div className="text-sm text-on-tertiary-container">
          Kata sandi awal semua akun:{" "}
          <code className="font-mono font-bold">admin123</code>. Wajib
          diganti saat login pertama di lingkungan produksi.
        </div>
      </div>
    </div>
  );
}
