"use client";

/** Indikator sedang memuat data dari API. */
export function Memuat({ pesan = "Memuat data\u2026" }: { pesan?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-surface-on-variant text-sm">
      <span className="w-5 h-5 rounded-full border-2 border-outline-variant border-t-primary animate-spin" />
      {pesan}
    </div>
  );
}

/** Tampilan galat dengan tombol coba lagi. */
export function Galat({
  pesan,
  onCoba,
}: {
  pesan: string;
  onCoba?: () => void;
}) {
  return (
    <div className="m-5 bg-error-container text-on-error-container rounded-xl p-5 text-sm flex flex-col items-center gap-3 text-center">
      <div>⚠️ {pesan}</div>
      {onCoba && (
        <button
          onClick={onCoba}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}

/** Tampilan saat data kosong. */
export function Kosong({ pesan = "Belum ada data." }: { pesan?: string }) {
  return (
    <div className="py-12 text-center text-surface-on-variant text-sm">
      {pesan}
    </div>
  );
}
