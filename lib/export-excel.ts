/**
 * Buberta Finance — Excel Export Utility
 * Generate Excel files for reports
 */

import ExcelJS from "exceljs";

// Warna brand
const PRIMARY_COLOR = "16789E";
const HEADER_BG = "C2E8FB";
const SUCCESS_COLOR = "006B3F";
const ERROR_COLOR = "BA1A1A";

/**
 * Style untuk header sheet
 */
function styleHeader(worksheet: ExcelJS.Worksheet, colCount: number) {
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${PRIMARY_COLOR}` },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF000000" } },
    };
  });
}

/**
 * Style untuk baris data
 */
function styleDataRows(worksheet: ExcelJS.Worksheet, startRow: number) {
  for (let i = startRow; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
      };
    });
    // Zebra striping
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F9FC" },
        };
      });
    }
  }
}

/**
 * Style untuk baris total
 */
function styleTotalRow(worksheet: ExcelJS.Worksheet, rowNum: number) {
  const row = worksheet.getRow(rowNum);
  row.font = { bold: true, size: 11 };
  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEAEEF2" },
    };
    cell.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
    };
  });
}

/**
 * Format angka sebagai Rupiah
 */
function rupiah(n: number): string {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

/**
 * Download workbook sebagai file Excel
 */
async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===== EXPORT LPP =====
interface LppExportData {
  no_nasabah: string;
  nama: string;
  alokasi: number;
  target_p: number;
  target_b: number;
  realisasi_p: number;
  realisasi_b: number;
  saldo: number;
}

export async function exportLppToExcel(
  data: LppExportData[],
  judul: string = "LPP — Laporan Pinjaman & Penerimaan",
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Buberta Finance";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("LPP", {
    properties: { defaultColWidth: 18 },
  });

  // Judul
  ws.mergeCells("A1:H1");
  const titleCell = ws.getCell("A1");
  titleCell.value = judul;
  titleCell.font = { bold: true, size: 14, color: { argb: `FF${PRIMARY_COLOR}` } };
  titleCell.alignment = { horizontal: "center" };

  ws.mergeCells("A2:H2");
  const dateCell = ws.getCell("A2");
  dateCell.value = `Dicetak: ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
  dateCell.font = { size: 10, color: { argb: "FF6F797F" } };
  dateCell.alignment = { horizontal: "center" };

  // Header
  ws.addRow([]);
  ws.addRow([
    "No",
    "Nama",
    "Alokasi",
    "Target Pokok",
    "Target Jasa",
    "Realisasi Pokok",
    "Realisasi Jasa",
    "Saldo",
  ]);
  styleHeader(ws, 8);

  // Data
  const totals = { alokasi: 0, targetP: 0, targetB: 0, realisasiP: 0, realisasiB: 0, saldo: 0 };
  data.forEach((r, i) => {
    ws.addRow([
      r.no_nasabah,
      r.nama,
      r.alokasi,
      r.target_p,
      r.target_b,
      r.realisasi_p,
      r.realisasi_b,
      r.saldo,
    ]);
    totals.alokasi += r.alokasi;
    totals.targetP += r.target_p;
    totals.targetB += r.target_b;
    totals.realisasiP += r.realisasi_p;
    totals.realisasiB += r.realisasi_b;
    totals.saldo += r.saldo;
  });

  // Format kolom angka
  for (let i = 3; i <= 8; i++) {
    ws.getColumn(i).numFmt = '#,##0';
  }

  // Total row
  ws.addRow([
    "",
    "TOTAL",
    totals.alokasi,
    totals.targetP,
    totals.targetB,
    totals.realisasiP,
    totals.realisasiB,
    totals.saldo,
  ]);
  styleTotalRow(ws, ws.rowCount);

  styleDataRows(ws, 5);

  // Auto width
  ws.columns.forEach((col) => {
    col.width = Math.max(col.width || 10, 14);
  });

  await downloadWorkbook(workbook, `LPP-${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ===== EXPORT KAS/BANK =====
interface KasExportData {
  tanggal: string;
  keterangan: string;
  masuk: number;
  keluar: number;
  saldo?: number;
}

export async function exportKasToExcel(
  data: KasExportData[],
  totalMasuk: number,
  totalKeluar: number,
  saldoAkhir: number,
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Buberta Finance";

  const ws = workbook.addWorksheet("Buku Kas/Bank", {
    properties: { defaultColWidth: 18 },
  });

  // Judul
  ws.mergeCells("A1:E1");
  ws.getCell("A1").value = "Buku Kas/Bank — Buberta Finance";
  ws.getCell("A1").font = { bold: true, size: 14, color: { argb: `FF${PRIMARY_COLOR}` } };
  ws.getCell("A1").alignment = { horizontal: "center" };

  ws.mergeCells("A2:E2");
  ws.getCell("A2").value = `Dicetak: ${new Date().toLocaleDateString("id-ID")}`;
  ws.getCell("A2").font = { size: 10, color: { argb: "FF6F797F" } };
  ws.getCell("A2").alignment = { horizontal: "center" };

  // Header
  ws.addRow([]);
  ws.addRow(["Tanggal", "Keterangan", "Masuk", "Keluar", "Saldo"]);
  styleHeader(ws, 5);

  // Data
  data.forEach((r) => {
    ws.addRow([r.tanggal, r.keterangan, r.masuk, r.keluar, r.saldo ?? 0]);
  });

  // Format kolom angka
  [3, 4, 5].forEach((i) => ws.getColumn(i).numFmt = '#,##0');

  // Total
  ws.addRow(["TOTAL", "", totalMasuk, totalKeluar, saldoAkhir]);
  styleTotalRow(ws, ws.rowCount);

  styleDataRows(ws, 5);

  await downloadWorkbook(workbook, `Kas-Bank-${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ===== EXPORT LUNAS =====
interface LunasExportData {
  no_kontrak: string;
  nama: string;
  no_nasabah: string;
  tanggal_akad: string;
  tanggal_lunas: string;
  pokok_pinjaman: number;
  status: string;
}

export async function exportLunasToExcel(data: LunasExportData[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Buberta Finance";

  const ws = workbook.addWorksheet("Kredit Lunas", {
    properties: { defaultColWidth: 16 },
  });

  // Judul
  ws.mergeCells("A1:G1");
  ws.getCell("A1").value = "Laporan Kredit Lunas — Buberta Finance";
  ws.getCell("A1").font = { bold: true, size: 14, color: { argb: `FF${PRIMARY_COLOR}` } };
  ws.getCell("A1").alignment = { horizontal: "center" };

  ws.mergeCells("A2:G2");
  ws.getCell("A2").value = `Dicetak: ${new Date().toLocaleDateString("id-ID")}`;
  ws.getCell("A2").font = { size: 10, color: { argb: "FF6F797F" } };
  ws.getCell("A2").alignment = { horizontal: "center" };

  // Header
  ws.addRow([]);
  ws.addRow(["No. Kontrak", "Nasabah", "No. Nasabah", "Tgl Akad", "Tgl Lunas", "Pokok", "Jenis"]);
  styleHeader(ws, 7);

  // Data
  const totalPokok = data.reduce((s, r) => s + r.pokok_pinjaman, 0);
  data.forEach((r) => {
    const jenis = r.status === "dipercepat" ? "Dipercepat" : "Normal";
    ws.addRow([r.no_kontrak, r.nama, r.no_nasabah, r.tanggal_akad, r.tanggal_lunas, r.pokok_pinjaman, jenis]);
  });

  // Format kolom angka
  ws.getColumn(6).numFmt = '#,##0';

  // Total
  ws.addRow(["", "", "", "", "TOTAL", totalPokok, ""]);
  styleTotalRow(ws, ws.rowCount);

  styleDataRows(ws, 5);

  await downloadWorkbook(workbook, `Lunas-${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ===== EXPORT KOLEKTIBILITAS =====
interface KolekExportData {
  no_nasabah: string;
  nama: string;
  status_kolek: string;
  hari_tunggakan: number;
  saldo: number;
}

export async function exportKolektibilitasToExcel(data: KolekExportData[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Buberta Finance";

  const ws = workbook.addWorksheet("Kolektibilitas", {
    properties: { defaultColWidth: 16 },
  });

  // Judul
  ws.mergeCells("A1:E1");
  ws.getCell("A1").value = "Detail Kolektibilitas — Buberta Finance";
  ws.getCell("A1").font = { bold: true, size: 14, color: { argb: `FF${PRIMARY_COLOR}` } };
  ws.getCell("A1").alignment = { horizontal: "center" };

  ws.mergeCells("A2:E2");
  ws.getCell("A2").value = `Dicetak: ${new Date().toLocaleDateString("id-ID")}`;
  ws.getCell("A2").font = { size: 10, color: { argb: "FF6F797F" } };
  ws.getCell("A2").alignment = { horizontal: "center" };

  // Header
  ws.addRow([]);
  ws.addRow(["No. Nasabah", "Nama", "Status", "Hari Tunggakan", "Saldo"]);
  styleHeader(ws, 5);

  // Data
  data.forEach((r) => {
    ws.addRow([r.no_nasabah, r.nama, `Kol ${r.status_kolek}`, r.hari_tunggakan, r.saldo]);
  });

  // Format kolom angka
  ws.getColumn(5).numFmt = '#,##0';

  styleDataRows(ws, 5);

  await downloadWorkbook(workbook, `Kolektibilitas-${new Date().toISOString().split("T")[0]}.xlsx`);
}
