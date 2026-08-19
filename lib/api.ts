/**
 * Buberta Finance — API Client
 * Penghubung layar React ke Pages Functions API
 */

const API_BASE = "/api";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export const apiClient = {
  // Master
  getNasabah: () => api<Nasabah[]>("/nasabah"),
  createNasabah: (data: {
    nama: string;
    nik: string;
    alamat: string;
    telepon: string;
    pekerjaan: string;
  }) =>
    api<Nasabah>("/nasabah", { method: "POST", body: JSON.stringify(data) }),
  getProduk: () => api<Produk[]>("/produk"),
  getTenorJasa: () => api<TenorJasa[]>("/tenor-jasa"),

  // Kontrak & transaksi
  getKontrakList: () => api<Kontrak[]>("/kontrak"),
  getKontrak: (no: string) => api<KontrakDetail>(`/kontrak/${no}`),
  createKontrak: (data: {
    nasabahId: string;
    produkId?: string;
    hargaJual: number;
    dp: number;
    tenor: number;
  }) =>
    api<{ id: string; no_kontrak: string }>("/kontrak", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createAngsuran: (data: {
    kontrakId: string;
    jumlahAngsuran: number;
    bulanBerjalan: number;
  }) =>
    api<AngsuranResult>("/angsuran", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createPelunasan: (data: { kontrakId: string }) =>
    api<PelunasanResult>("/pelunasan", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Laporan & dashboard
  getLpp: () => api<LppRow[]>("/lpp"),
  getKolektibilitas: () => api<KolekSummary[]>("/kolektibilitas"),
  getKolektibilitasDetail: () => api<KolekDetail[]>("/kolektibilitas-detail"),
  getKas: () => api<KasRow[]>("/kas"),
  getLunas: () => api<LunasRow[]>("/lunas"),
  getRekap: () => api<Rekap>("/rekap"),
  getTrenPenerimaan: () => api<TrenBulan[]>("/tren-penerimaan"),
  getPenerimaanTerbaru: () => api<PenerimaanTerbaru[]>("/penerimaan-terbaru"),
};

// ===== Types =====
export interface Nasabah {
  id: string;
  no_nasabah: string;
  nama: string;
  nik: string;
  alamat: string;
  telepon: string;
  pekerjaan: string;
  status: string;
}
export interface Produk {
  id: string;
  nama: string;
  harga_jual: number;
  stok: number;
  kategori: string;
}
export interface TenorJasa {
  id: string;
  tenor_bulan: number;
  persentase_jasa: number;
  status_aktif: number;
}
export interface Kontrak {
  id: string;
  no_kontrak: string;
  nasabah_id: string;
  produk_id?: string;
  harga_jual: number;
  dp: number;
  pokok_pinjaman: number;
  tenor: number;
  persentase_jasa: number;
  jasa_total: number;
  angsuran_pokok_bulanan: number;
  jasa_bulanan: number;
  total_angsuran_bulanan: number;
  tanggal_akad: string;
  status: string;
  saldo_pinjaman: number;
  angsuran_terbayar: number;
  bulan_jasa_terbayar: number;
  nasabah_nama?: string;
  no_nasabah?: string;
}
export interface KontrakDetail extends Kontrak {
  jadwal: JadwalRow[];
  riwayat: AngsuranRow[];
}
export interface JadwalRow {
  bulan_ke: number;
  tanggal_jatuh_tempo: string;
  angsuran_pokok: number;
  jasa: number;
  total_angsuran: number;
  sisa_saldo: number;
  status: string;
}
export interface AngsuranRow {
  id: string;
  tanggal_bayar: string;
  pokok_bayar: number;
  jasa_bayar: number;
}
export interface AngsuranResult {
  id: string;
  pokok_bayar: number;
  jasa_bayar: number;
  total: number;
}
export interface PelunasanResult {
  id: string;
  sisa_pokok: number;
  jasa_pelunasan: number;
  total_pelunasan: number;
}
export interface LppRow {
  no_nasabah: string;
  nama: string;
  alokasi: number;
  target_p: number;
  target_b: number;
  realisasi_p: number;
  realisasi_b: number;
  saldo: number;
}
export interface KolekSummary {
  status_kolek: string;
  jumlah: number;
}
export interface KolekDetail {
  no_nasabah: string;
  nama: string;
  status_kolek: string;
  hari_tunggakan: number;
  saldo: number;
}
export interface KasRow {
  tanggal: string;
  keterangan: string;
  masuk: number;
  keluar: number;
  saldo?: number;
}
export interface LunasRow {
  no_kontrak: string;
  nama: string;
  no_nasabah: string;
  tanggal_akad: string;
  tanggal_lunas: string;
  pokok_pinjaman: number;
  status: string;
}
export interface Rekap {
  saldo_pinjaman: number;
  penerimaan_bulan_ini: number;
  nasabah_aktif: number;
}
export interface TrenBulan {
  bulan: string;
  penerimaan: number;
}
export interface PenerimaanTerbaru {
  id: string;
  tanggal_bayar: string;
  nama: string;
  no_nasabah: string;
  pokok_bayar: number;
  jasa_bayar: number;
  total: number;
}
