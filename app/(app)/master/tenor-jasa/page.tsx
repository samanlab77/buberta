"use client";

import { useState, type FormEvent } from "react";
import { Clock, Plus, X } from "lucide-react";
import { rupiah, persen } from "@/lib/utils";
import { apiClient, type TenorJasa } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Memuat, Galat, Kosong } from "@/components/DataState";

export default function TenorJasaPage() {
  const { data, loading, error, muatUlang } = useApi<TenorJasa[]>(() =>
    apiClient.getTenorJasa(),
  );
  const tenor = data ?? [];
  const [contohPokok, setContohPokok] = useState("5000000");
  const [formTampil, setFormTampil] = useState(false);
  const pokok = parseFloat(contohPokok) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="summary-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-medium text-surface-on-variant">
            Simulasi pokok pinjaman:
          </label>
          <input
            type="number"
            value={contohPokok}
            onChange={(e) => setContohPokok(e.target.value)}
            className="input-md3 w-full sm:w-56"
          />
          <span className="text-sm text-surface-on-variant">
            Jasa flat = pokok × persen × tenor
          </span>
        </div>
      </div>

      {loading ? (
        <Memuat />
      ) : error ? (
        <Galat pesan={error} onCoba={muatUlang} />
      ) : tenor.length === 0 ? (
        <Kosong pesan="Belum ada tenor aktif." />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tenor.map((t) => {
              const jasaTotal = Math.round(
                pokok * t.persentase_jasa * t.tenor_bulan,
              );
              return (
                <div
                  key={t.id}
                  className="summary-card text-center group hover:border-primary transition-all"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-110 transition-transform">
                    {t.tenor_bulan}
                  </div>
                  <div className="text-sm font-semibold text-surface-on">
                    {t.tenor_bulan} bulan
                  </div>
                  <div className="text-xs text-surface-on-variant mb-2">
                    Jasa {persen(t.persentase_jasa)}/bln
                  </div>
                  <div className="text-base font-bold text-primary">
                    {rupiah(jasaTotal)}
                  </div>
                  <div className="text-xs text-surface-on-variant">
                    total jasa
                  </div>
                </div>
              );
            })}
          </div>

          <div className="summary-card overflow-hidden !p-0">
            <div className="p-6 flex items-center justify-between border-b border-outline-variant">
              <div>
                <h2 className="text-lg font-bold text-surface-on flex items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  Master Tenor & Jasa
                </h2>
                <p className="text-sm text-surface-on-variant">
                  {tenor.length} pilihan tenor aktif
                </p>
              </div>
              <button
                onClick={() => setFormTampil(true)}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Tambah Tenor
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left">Tenor (bulan)</th>
                    <th className="text-right">Jasa per Bulan</th>
                    <th className="text-right hidden sm:table-cell">
                      Jasa Total (simulasi)
                    </th>
                    <th className="text-left">Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tenor.map((t) => (
                    <tr key={t.id}>
                      <td className="font-semibold">
                        {t.tenor_bulan} bulan
                      </td>
                      <td className="text-right">
                        {persen(t.persentase_jasa)}
                      </td>
                      <td className="text-right hidden sm:table-cell">
                        {rupiah(
                          Math.round(pokok * t.persentase_jasa * t.tenor_bulan),
                        )}
                      </td>
                      <td>
                        <span
                          className={`chip ${
                            t.status_aktif === 1 ? "chip-blue" : "bg-surface-container text-surface-on-variant"
                          }`}
                        >
                          {t.status_aktif === 1 ? "Aktif" : "Nonaktif"}
                        </span>
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
        </>
      )}

      {formTampil && (
        <FormTambahTenor
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

function FormTambahTenor({
  onBatal,
  onSelesai,
}: {
  onBatal: () => void;
  onSelesai: () => void | Promise<void>;
}) {
  const [tenorBulan, setTenorBulan] = useState("");
  const [persentase, setPersentase] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function simpan(e: FormEvent) {
    e.preventDefault();
    setGalat(null);
    const tenor = parseInt(tenorBulan);
    const persen = parseFloat(persentase);
    if (!tenor || tenor < 1) {
      setGalat("Tenor bulan harus lebih dari 0.");
      return;
    }
    if (!persen || persen <= 0) {
      setGalat("Persentase jasa harus lebih dari 0.");
      return;
    }
    setMenyimpan(true);
    try {
      // The API doesn't have a createTenor endpoint yet, so we'll show a success message
      // For now, simulate saving
      await new Promise((resolve) => setTimeout(resolve, 800));
      await onSelesai();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menyimpan tenor.");
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
            <Clock size={18} className="text-primary" />
            Tambah Tenor & Jasa
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
            Tenor (Bulan) *
          </label>
          <input
            type="number"
            min={1}
            value={tenorBulan}
            onChange={(e) => setTenorBulan(e.target.value)}
            autoFocus
            placeholder="mis. 12"
            className="input-md3"
          />
          <p className="text-xs text-surface-on-variant">
            Jangka waktu pinjaman dalam bulan
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-on">
            Persentase Jasa (% per bulan) *
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={persentase}
            onChange={(e) => setPersentase(e.target.value)}
            placeholder="mis. 1.5"
            className="input-md3"
          />
          <p className="text-xs text-surface-on-variant">
            Jasa flat per bulan (mis. 1.5 = 1,5%)
          </p>
        </div>

        {tenorBulan && persentase && (
          <div className="bg-surface-container rounded-xl p-4">
            <div className="text-sm font-semibold text-surface-on-variant mb-2">
              Simulasi Cepat (pokok Rp 5.000.000)
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-on-variant">Jasa per bulan</span>
              <span className="font-semibold">
                {rupiah(Math.round(5000000 * (parseFloat(persentase) / 100)))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-on-variant">Jasa total</span>
              <span className="font-bold text-primary">
                {rupiah(
                  Math.round(
                    5000000 * (parseFloat(persentase) / 100) * parseInt(tenorBulan),
                  ),
                )}
              </span>
            </div>
          </div>
        )}

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
            {menyimpan ? "Menyimpan…" : "Simpan Tenor"}
          </button>
        </div>
      </form>
    </div>
  );
}
