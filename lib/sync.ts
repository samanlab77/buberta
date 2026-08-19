import { getDb, type AntreanTransaksi, type JenisTransaksi } from "./dexie";

export interface HasilSimpan {
  mode: "online" | "antrean";
  data?: unknown;
  antreanId?: number;
}

async function kirim(endpoint: string, payload: unknown): Promise<unknown> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function tambahAntrean(
  jenis: JenisTransaksi,
  endpoint: string,
  payload: unknown,
  ringkasan: string,
): Promise<number> {
  return getDb().antrean.add({
    jenis,
    endpoint,
    payload,
    ringkasan,
    status: "pending",
    percobaan: 0,
    dibuatPada: new Date().toISOString(),
  });
}

export async function hitungAntrean(): Promise<number> {
  return getDb().antrean.where("status").anyOf("pending", "gagal").count();
}

export async function daftarAntrean(): Promise<AntreanTransaksi[]> {
  return getDb().antrean.orderBy("dibuatPada").reverse().toArray();
}

export async function hapusAntrean(id: number): Promise<void> {
  return getDb().antrean.delete(id);
}

/** Kirim ulang seluruh antrean. Yang gagal ditandai agar bisa dicoba lagi. */
export async function prosesAntrean(): Promise<{
  berhasil: number;
  gagal: number;
}> {
  const db = getDb();
  const items = await db.antrean
    .where("status")
    .anyOf("pending", "gagal")
    .toArray();
  let berhasil = 0;
  let gagal = 0;
  for (const item of items) {
    if (item.id == null) continue;
    try {
      await db.antrean.update(item.id, { status: "syncing" });
      await kirim(item.endpoint, item.payload);
      await db.antrean.delete(item.id);
      berhasil += 1;
    } catch (e) {
      await db.antrean.update(item.id, {
        status: "gagal",
        percobaan: item.percobaan + 1,
        pesanError: e instanceof Error ? e.message : String(e),
      });
      gagal += 1;
    }
  }
  return { berhasil, gagal };
}

/**
 * Simpan transaksi kasir dengan strategi luring-dulu-aman.
 * - Daring: langsung kirim ke server.
 * - Luring / jaringan gagal: masuk antrean lokal (IndexedDB) dan otomatis
 *   dikirim ulang saat koneksi kembali.
 */
export async function simpanTransaksi(
  jenis: JenisTransaksi,
  endpoint: string,
  payload: unknown,
  ringkasan: string,
): Promise<HasilSimpan> {
  const luring = typeof navigator !== "undefined" && !navigator.onLine;
  if (luring) {
    const antreanId = await tambahAntrean(jenis, endpoint, payload, ringkasan);
    return { mode: "antrean", antreanId };
  }
  try {
    const data = await kirim(endpoint, payload);
    return { mode: "online", data };
  } catch {
    const antreanId = await tambahAntrean(jenis, endpoint, payload, ringkasan);
    return { mode: "antrean", antreanId };
  }
}
