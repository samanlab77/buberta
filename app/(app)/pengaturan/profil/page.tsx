"use client";

import { useState } from "react";

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
    <div className="max-w-2xl space-y-6">
      <div className="bg-surface-container-low rounded-xl p-6 shadow-md1">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center text-2xl font-bold">
            B3
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-on">
              Profil Perusahaan
            </h2>
            <p className="text-sm text-surface-on-variant">
              Data ini tampil di kop laporan & bukti transaksi
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-surface-on-variant block mb-1">
              Nama Lembaga
            </label>
            <input
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-surface-on-variant block mb-1">
              Alamat
            </label>
            <textarea
              value={form.alamat}
              onChange={(e) => set("alamat", e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-surface-on-variant block mb-1">
                Telepon
              </label>
              <input
                value={form.telepon}
                onChange={(e) => set("telepon", e.target.value)}
                placeholder="08xx-xxxx-xxxx"
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-surface-on-variant block mb-1">
                Email
              </label>
              <input
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="info@buberta.id"
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-surface-on-variant block mb-1">
              Persentase Jasa Default (% / bulan)
            </label>
            <input
              value={form.jasaDefault}
              onChange={(e) => set("jasaDefault", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-surface-on"
            />
          </div>
          <button
            onClick={() => setTersimpan(true)}
            className="w-full py-3 rounded-lg bg-primary text-on-primary font-semibold hover:opacity-90"
          >
            Simpan Profil
          </button>
          {tersimpan && (
            <div className="text-center text-sm bg-primary-container text-on-primary-container rounded-lg py-2">
              ✅ Profil berhasil disimpan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
