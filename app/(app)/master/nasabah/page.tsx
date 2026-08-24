"use client";

import { useState, type FormEvent } from "react";
import { UserPlus, X } from "lucide-react";
import { apiClient, type Nasabah } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

export default function NasabahPage() {
  const { data, loading, error, muatUlang } = useApi<Nasabah[]>(() =>
    apiClient.getNasabah(),
  );
  const nasabah = data ?? [];
  const [formTampil, setFormTampil] = useState(false);

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
        <button
          onClick={() => setFormTampil(true)}
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
        >
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

      {formTampil && (
        <FormTambahNasabah
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

function FormTambahNasabah({
  onBatal,
  onSelesai,
}: {
  onBatal: () => void;
  onSelesai: () => void | Promise<void>;
}) {
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telepon, setTelepon] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function simpan(e: FormEvent) {
    e.preventDefault();
    setGalat(null);
    if (!nama.trim()) {
      setGalat("Nama nasabah wajib diisi.");
      return;
    }
    if (!nik.trim()) {
      setGalat("NIK wajib diisi.");
      return;
    }
    setMenyimpan(true);
    try {
      await apiClient.createNasabah({
        nama: nama.trim(),
        nik: nik.trim(),
        alamat: alamat.trim(),
        telepon: telepon.trim(),
        pekerjaan: pekerjaan.trim(),
      });
      await onSelesai();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menyimpan nasabah.");
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
          <h3 className="text-lg font-bold text-surface-on flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            Tambah Nasabah
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
            Nama Lengkap *
          </label>
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            autoFocus
            placeholder="Nama lengkap nasabah"
            className="input-md3"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-on">
            NIK *
          </label>
          <input
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            placeholder="Nomor Induk Kependudukan"
            className="input-md3"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-on">
            Alamat
          </label>
          <textarea
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            rows={2}
            placeholder="Alamat lengkap"
            className="input-md3 h-auto py-3 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">
              Telepon
            </label>
            <input
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="08xx-xxxx-xxxx"
              className="input-md3"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-on">
              Pekerjaan
            </label>
            <input
              value={pekerjaan}
              onChange={(e) => setPekerjaan(e.target.value)}
              placeholder="mis. Petani"
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
            {menyimpan ? "Menyimpan…" : "Simpan Nasabah"}
          </button>
        </div>
      </form>
    </div>
  );
}
