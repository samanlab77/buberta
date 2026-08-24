/**
 * Buberta Finance — WhatsApp Follow-up Utility
 * Generate WhatsApp chat links for payment reminders
 */

const NOMOR_KANTOR = "6281234567890"; // Nomor WhatsApp kantor (ganti sesuai kebutuhan)

/**
 * Format nomor telepon Indonesia ke format WhatsApp
 * Input: "081234567890" → Output: "6281234567890"
 */
export function formatNomorWA(nomor: string): string {
  // Hapus spasi, dash, dan karakter non-angka
  let cleaned = nomor.replace(/[^0-9]/g, "");

  // Jika diawali 0, ganti dengan 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }

  // Jika diawali +62, ganti dengan 62
  if (cleaned.startsWith("+62")) {
    cleaned = "62" + cleaned.slice(3);
  }

  // Jika diawali 62, sudah benar
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * Generate URL WhatsApp untuk mengirim pesan
 */
export function generateWhatsAppURL(
  nomor: string,
  pesan: string,
): string {
  const formattedNomor = formatNomorWA(nomor);
  const encodedPesan = encodeURIComponent(pesan);
  return `https://wa.me/${formattedNomor}?text=${encodedPesan}`;
}

/**
 * Generate pesan pengingat angsuran
 */
export function generatePesanAngsuran(data: {
  namaNasabah: string;
  noKontrak: string;
  jumlahAngsuran: number;
  bulanTunggak: number;
  tanggalJatuhTempo?: string;
}): string {
  const { namaNasabah, noKontrak, jumlahAngsuran, bulanTunggak, tanggalJatuhTempo } = data;

  let pesan = `Halo Bapak/Ibu ${namaNasabah},\n\n`;
  pesan += `Kami dari Buberta Finance (Bumdes Bersama Betara LKD) ingin mengingatkan bahwa angsuran Anda:\n\n`;
  pesan += `📋 *No. Kontrak:* ${noKontrak}\n`;
  pesan += `💰 *Jumlah Angsuran:* Rp ${jumlahAngsuran.toLocaleString("id-ID")}\n`;
  pesan += `📅 *Tunggakan:* ${bulanTunggak} bulan\n`;

  if (tanggalJatuhTempo) {
    pesan += `⏰ *Jatuh Tempo:* ${tanggalJatuhTempo}\n`;
  }

  pesan += `\nMohon segera melakukan pembayaran untuk menghindari denda tambahan.\n\n`;
  pesan += `Terima kasih atas perhatian dan kerjasamanya. 🙏\n\n`;
  pesan += `Salam,\n`;
  pesan += `*Buberta Finance*\n`;
  pesan += `Bumdes Bersama Betara LKD`;

  return pesan;
}

/**
 * Generate pesan pengingat untuk admin/manager
 */
export function generatePesanNotifikasiAdmin(data: {
  jumlahNasabah: number;
  totalTunggakan: number;
  daftarNasabah: Array<{
    nama: string;
    noKontrak: string;
    bulanTunggak: number;
    saldo: number;
  }>;
}): string {
  const { jumlahNasabah, totalTunggakan, daftarNasabah } = data;

  let pesan = `📊 *LAPORAN PENGGUNAAN - BUBERTA FINANCE*\n\n`;
  pesan += `⏰ *Tanggal:* ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n\n`;
  pesan += `⚠️ *RINGKASAN TUNGGAKAN:*\n`;
  pesan += `• Jumlah nasabah belum bayar: *${jumlahNasabah} orang*\n`;
  pesan += `• Total tunggakan: *Rp ${totalTunggakan.toLocaleString("id-ID")}*\n\n`;

  if (daftarNasabah.length > 0) {
    pesan += `📝 *DAFTAR NASABAH TUNGGAKAN:*\n\n`;
    daftarNasabah.forEach((n, i) => {
      pesan += `${i + 1}. *${n.nama}*\n`;
      pesan += `   No. Kontrak: ${n.noKontrak}\n`;
      pesan += `   Tunggakan: ${n.bulanTunggak} bulan\n`;
      pesan += `   Saldo: Rp ${n.saldo.toLocaleString("id-ID")}\n\n`;
    });
  }

  pesan += `\nSegera lakukan follow-up kepada nasabah yang bersangkutan.\n\n`;
  pesan += `Terima kasih.`;

  return pesan;
}

/**
 * Buka WhatsApp di browser/app
 */
export function bukaWhatsApp(url: string): void {
  window.open(url, "_blank");
}
