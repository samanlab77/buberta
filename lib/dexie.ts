import Dexie, { type Table } from "dexie";

export type JenisTransaksi = "angsuran" | "pelunasan" | "akad" | "nasabah";
export type StatusAntrean = "pending" | "syncing" | "gagal";

/** Satu transaksi kasir yang menunggu dikirim ke server. */
export interface AntreanTransaksi {
  id?: number;
  jenis: JenisTransaksi;
  endpoint: string;
  payload: unknown;
  ringkasan: string;
  status: StatusAntrean;
  percobaan: number;
  pesanError?: string;
  dibuatPada: string;
}

/** Cache data master (produk, tenor, nasabah) agar tetap bisa dibuka luring. */
export interface CacheEntri {
  kunci: string;
  data: unknown;
  diperbaruiPada: string;
}

export class BubertaDexie extends Dexie {
  antrean!: Table<AntreanTransaksi, number>;
  cache!: Table<CacheEntri, string>;

  constructor() {
    super("buberta-finance");
    this.version(1).stores({
      antrean: "++id, jenis, status, dibuatPada",
      cache: "kunci, diperbaruiPada",
    });
  }
}

let instance: BubertaDexie | undefined;

/** Ambil koneksi Dexie. Hanya tersedia di browser (butuh IndexedDB). */
export function getDb(): BubertaDexie {
  if (typeof window === "undefined") {
    throw new Error("Dexie hanya tersedia di sisi browser (IndexedDB).");
  }
  if (!instance) instance = new BubertaDexie();
  return instance;
}
