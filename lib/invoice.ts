/**
 * Buberta Finance — PDF Invoice Generator
 * Generate printable payment receipts (Bukti Penerimaan Angsuran)
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { KontrakDetail } from "./api";

interface InvoiceData {
  noKontrak: string;
  namaNasabah: string;
  noNasabah: string;
  tanggalBayar: string;
  bulanKe: number;
  pokokBayar: number;
  jasaBayar: number;
  totalBayar: number;
  sisaSaldo: number;
  angsuranTerbayar: number;
  tenor: number;
}

/**
 * Format number as Rupiah for PDF
 */
function rupiahPDF(n: number): string {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

/**
 * Generate PDF Invoice for Angsuran Payment
 */
export function generateInvoiceAngsuran(data: InvoiceData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // ===== HEADER =====
  // Garis atas
  doc.setDrawColor(22, 120, 158); // primary color
  doc.setLineWidth(1);
  doc.line(margin, margin, pageWidth - margin, margin);

  // Logo/Brand
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 120, 158);
  doc.text("BUBERTA FINANCE", margin, margin + 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Bumdes Bersama Betara LKD", margin, margin + 18);
  doc.text("Kecamatan Betara, Kabupaten Tanjung Jabung Barat, Provinsi Jambi", margin, margin + 23);

  // Judul Invoice
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("BUKTI PENERIMAAN ANGSURAN", pageWidth / 2, margin + 38, { align: "center" });

  // No Invoice & Tanggal
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const noInvoice = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${data.noKontrak.slice(-4)}`;
  doc.text(`No. Invoice: ${noInvoice}`, margin, margin + 46);
  doc.text(`Tanggal: ${data.tanggalBayar}`, pageWidth - margin, margin + 46, { align: "right" });

  // Garis separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 50, pageWidth - margin, margin + 50);

  // ===== DATA NASABAH =====
  let y = margin + 58;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 120, 158);
  doc.text("DATA NASABAH", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  const nasabahData = [
    ["Nama", `: ${data.namaNasabah}`],
    ["No. Nasabah", `: ${data.noNasabah}`],
    ["No. Kontrak", `: ${data.noKontrak}`],
    ["Tenor", `: ${data.tenor} bulan`],
  ];

  nasabahData.forEach((row) => {
    doc.setFont("helvetica", "normal");
    doc.text(row[0], margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(row[1], margin + 35, y);
    y += 7;
  });

  y += 5;

  // ===== RINCIAN PEMBAYARAN =====
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 120, 158);
  doc.text("RINCIAN PEMBAYARAN", margin, y);
  y += 3;

  // Tabel pembayaran
  const pembayaranBody = [
    ["Pokok Angsuran", rupiahPDF(data.pokokBayar)],
    ["Jasa Angsuran", rupiahPDF(data.jasaBayar)],
    ["Total Dibayar", rupiahPDF(data.totalBayar)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: pembayaranBody,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { halign: "right", fontStyle: "bold", cellWidth: contentWidth - 60 },
    },
    didParseCell: function (data) {
      // Highlight total row
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 12;
        data.cell.styles.fillColor = [194, 232, 251]; // primary-container
      }
    },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 10;

  // ===== RINGKASAN =====
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 120, 158);
  doc.text("RINGKASAN", margin, y);
  y += 3;

  const ringkasanData = [
    ["Bulan ke-", `${data.bulanKe} dari ${data.tenor}`],
    ["Sudah Dibayar", `${data.angsuranTerbayar} bulan`],
    ["Sisa Saldo Pinjaman", rupiahPDF(data.sisaSaldo)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: ringkasanData,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { halign: "right", cellWidth: contentWidth - 60 },
    },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 15;

  // ===== CATATAN =====
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Catatan:", margin, y);
  y += 5;
  doc.text("• Simpan bukti ini sebagai bukti pembayaran yang sah.", margin, y);
  y += 4;
  doc.text("• Hubungi kami jika ada pertanyaan mengenai pembayaran ini.", margin, y);
  y += 4;
  doc.text("• Pembayaran yang sudah diterima tidak dapat dibatalkan.", margin, y);

  // ===== FOOTER =====
  const footerY = doc.internal.pageSize.getHeight() - 25;

  // Garis footer
  doc.setDrawColor(22, 120, 158);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Buberta Finance — Bumdes Bersama Betara LKD",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );
  doc.text(
    `Dicetak pada: ${new Date().toLocaleString("id-ID")}`,
    pageWidth / 2,
    footerY + 10,
    { align: "center" }
  );

  // Simpan PDF
  const filename = `Bukti-Angsuran-${data.noKontrak}-${data.tanggalBayar.replace(/\//g, "-")}.pdf`;
  doc.save(filename);
}

/**
 * Generate PDF Invoice from KontrakDetail after payment
 */
export function generateInvoiceFromKontrak(
  kontrak: KontrakDetail,
  bulanKe: number,
  pokokBayar: number,
  jasaBayar: number,
  totalBayar: number,
): void {
  const tanggalBayar = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  generateInvoiceAngsuran({
    noKontrak: kontrak.no_kontrak,
    namaNasabah: kontrak.nasabah_nama ?? "N/A",
    noNasabah: kontrak.no_nasabah ?? "N/A",
    tanggalBayar,
    bulanKe,
    pokokBayar,
    jasaBayar,
    totalBayar,
    sisaSaldo: kontrak.saldo_pinjaman - pokokBayar,
    angsuranTerbayar: kontrak.angsuran_terbayar + 1,
    tenor: kontrak.tenor,
  });
}
