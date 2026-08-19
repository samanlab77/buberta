/**
 * Buberta Finance — Mesin Kalkulasi Kredit
 * Persentase jasa flat: pokok × rate × tenor
 * Semua nilai uang dalam integer rupiah (bukan pecahan)
 */

export interface KreditInput {
  hargaJual: number;
  dp: number;
  tenor: number;
  persentaseJasa: number; // 0.015 = 1.5%
  tanggalAkad: string; // ISO date string
}

export interface JadwalAngsuran {
  bulanKe: number;
  tanggalJatuhTempo: string;
  angsuranPokok: number;
  jasa: number;
  totalAngsuran: number;
  sisaSaldo: number;
}

export interface KreditResult {
  pokokPinjaman: number;
  jasaTotal: number;
  total: number;
  angsuranBulanan: number;
  jasaBulanan: number;
  pokokBulanan: number;
  jadwal: JadwalAngsuran[];
}

/**
 * Hitung kredit dan generate jadwal angsuran.
 * Rumus: jasa_total = pokok × persentase_jasa × tenor (flat rate)
 */
export function hitungKredit(input: KreditInput): KreditResult {
  const pokokPinjaman = input.hargaJual - input.dp;
  const jasaTotal = Math.round(
    pokokPinjaman * input.persentaseJasa * input.tenor,
  );
  const total = pokokPinjaman + jasaTotal;
  const angsuranBulanan = Math.round(total / input.tenor);
  const jasaBulanan = Math.round(jasaTotal / input.tenor);
  const pokokBulanan = Math.round(pokokPinjaman / input.tenor);

  const jadwal: JadwalAngsuran[] = [];
  const baseDate = new Date(input.tanggalAkad);
  let sisa = total;

  for (let i = 1; i <= input.tenor; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    sisa -= pokokBulanan + jasaBulanan;
    jadwal.push({
      bulanKe: i,
      tanggalJatuhTempo: dueDate.toISOString().split("T")[0],
      angsuranPokok: pokokBulanan,
      jasa: jasaBulanan,
      totalAngsuran: pokokBulanan + jasaBulanan,
      sisaSaldo: Math.max(0, sisa),
    });
  }

  return {
    pokokPinjaman,
    jasaTotal,
    total,
    angsuranBulanan,
    jasaBulanan,
    pokokBulanan,
    jadwal,
  };
}

/**
 * Hitung pelunasan dipercepat.
 */
export interface PelunasanResult {
  sisaPokok: number;
  jasaPelunasan: number;
  totalPelunasan: number;
}

export function hitungPelunasan(
  saldoPinjaman: number,
  sisaBulan: number,
  persentaseJasa: number,
): PelunasanResult {
  const sisaPokok = saldoPinjaman;
  const jasaPelunasan = Math.round(sisaPokok * persentaseJasa * sisaBulan);
  return {
    sisaPokok,
    jasaPelunasan,
    totalPelunasan: sisaPokok + jasaPelunasan,
  };
}

/**
 * Tentukan status kolektibilitas berdasarkan bulan menunggak.
 */
export type StatusKolek = "I" | "II" | "III" | "IV" | "V";

export function hitungKolektibilitas(bulanMenunggak: number): StatusKolek {
  if (bulanMenunggak === 0) return "I";
  if (bulanMenunggak <= 2) return "II";
  if (bulanMenunggak <= 4) return "III";
  if (bulanMenunggak <= 6) return "IV";
  return "V";
}

export const KOLEK_LABEL: Record<StatusKolek, string> = {
  I: "Lancar",
  II: "Dalam Perhatian Khusus",
  III: "Kurang Lancar",
  IV: "Diragukan",
  V: "Macet",
};

export const KOLEK_COLOR: Record<StatusKolek, string> = {
  I: "#006B3F",
  II: "#D5803B",
  III: "#E56458",
  IV: "#BA1A1A",
  V: "#7F0000",
};
