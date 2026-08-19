/**
 * Buberta Finance — Utility Functions
 */

/** Format number as Rupiah: 1400000 -> "Rp 1.400.000" */
export function rupiah(n: number): string {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

/** Compact Rupiah: 1400000000 -> "Rp 1,4 M" */
export function rupiahRingkas(n: number): string {
  if (n >= 1_000_000_000) return "Rp " + (n / 1_000_000_000).toFixed(1) + " M";
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(1) + " Jt";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(0) + " Rb";
  return rupiah(n);
}

/** Plain number: 1400000 -> "1.400.000" */
export function angka(n: number): string {
  return (n || 0).toLocaleString("id-ID");
}

/** Percentage: 0.015 -> "1,5%" */
export function persen(n: number): string {
  return (n * 100).toFixed(1).replace(".", ",") + "%";
}

/** Format date: "2026-03-19" -> "19/03/2026" */
export function tanggal(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Generate no kontrak: BF-2026-0001 */
export function genNoKontrak(tahun: number, urut: number): string {
  return `BF-${tahun}-${String(urut).padStart(4, "0")}`;
}

/** Generate no nasabah: next number */
export function genNoNasabah(urut: number): string {
  return String(urut).padStart(4, "0");
}
