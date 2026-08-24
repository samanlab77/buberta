"use client";

import { useState } from "react";
import { Building2, CheckCircle2 } from "lucide-react";

export default function ProfilPage() {
  const [form, setForm] = useState({
    nama: "Bumdes Bersama Betara LKD",
    alamat: "Kecamatan Betara, Kabupaten Tanjung Jabung Barat, Provinsi Jambi",
    telepon: "",
    email: "",
    jasaDefault: "1.5",
  });
  const [tersimpan, setTersimpan] = useState(false);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setTersimpan(false);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="summary-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center text-2xl font-bold shadow-md1">
            B3
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-on flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              Profil Perusahaan
            </h2>
            <p className="text-sm text-surface-on-variant">
              Data ini tampil di kop laporan & bukti transaksi
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">
              Nama Lembaga
            </label>
            <input
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              className="input-md3"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">
              Alamat
            </label>
            <textarea
              value={form.alamat}
              onChange={(e) => set("alamat", e.target.value)}
              rows={2}
              className="input-md3 h-auto py-3 resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-on">
                Telepon
              </label>
              <input
                value={form.telepon}
                onChange={(e) => set("telepon", e.target.value)}
                placeholder="08xx-xxxx-xxxx"
                className="input-md3"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-on">
                Email
              </label>
              <input
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="info@buberta.id"
                className="input-md3"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">
              Persentase Jasa Default (% / bulan)
            </label>
            <input
              value={form.jasaDefault}
              onChange={(e) => set("jasaDefault", e.target.value)}
              className="input-md3"
            />
          </div>
          <button
            onClick={() => setTersimpan(true)}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Simpan Profil
          </button>
          {tersimpan && (
            <div className="chip chip-green w-full justify-center py-2.5 animate-fade-in">
              ✅ Profil berhasil disimpan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
