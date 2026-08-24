"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import NavigationDrawer from "@/components/NavigationDrawer";
import StatusKoneksi from "@/components/StatusKoneksi";
import { apiClient, type SesiUser } from "@/lib/api";
import { SesiProvider } from "@/hooks/useSesi";

const kebijakanPeran: { prefix: string; peran: SesiUser["role"][] }[] = [
  { prefix: "/pengaturan", peran: ["admin", "manager"] },
];

const judulHalaman: { prefix: string; judul: string; deskripsi: string }[] = [
  { prefix: "/dashboard", judul: "Dashboard", deskripsi: "Ringkasan aktivitas keuangan" },
  { prefix: "/master", judul: "Master Data", deskripsi: "Kelola data nasabah, produk, dan tenor" },
  { prefix: "/transaksi", judul: "Transaksi Kredit", deskripsi: "Pengajuan, angsuran, dan pelunasan" },
  { prefix: "/laporan", judul: "Laporan", deskripsi: "Laporan keuangan dan kolektibilitas" },
  { prefix: "/pengaturan", judul: "Pengaturan", deskripsi: "Konfigurasi sistem dan pengguna" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SesiUser | null>(null);
  const [status, setStatus] = useState<"cek" | "ok" | "gagal">("cek");

  useEffect(() => {
    let batal = false;
    apiClient
      .me()
      .then((r) => {
        if (batal) return;
        setUser(r.user);
        setStatus("ok");
      })
      .catch(() => {
        if (batal) return;
        setStatus("gagal");
        router.replace("/login");
      });
    return () => { batal = true; };
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const aturan = kebijakanPeran.find((k) => pathname.startsWith(k.prefix));
    if (aturan && !aturan.peran.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, pathname, router]);

  async function keluar() {
    try {
      await apiClient.logout();
    } finally {
      router.replace("/login");
    }
  }

  if (status !== "ok" || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={28} />
          <span className="text-sm text-surface-on-variant">Memuat sesi…</span>
        </div>
      </main>
    );
  }

  const judul = judulHalaman.find((j) => pathname.startsWith(j.prefix));

  return (
    <SesiProvider value={user}>
      <div className="flex min-h-screen bg-background">
        <NavigationDrawer user={user} onKeluar={keluar} />
        <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-surface-container-lowest/80 backdrop-blur-lg border-b border-outline-variant">
            <div className="px-6 h-16 flex items-center gap-4">
              <div className="lg:hidden w-10" />
              <div className="flex-1">
                <h1 className="text-lg font-bold text-surface-on tracking-tight">
                  {judul?.judul ?? "Buberta Finance"}
                </h1>
                {judul?.deskripsi && (
                  <p className="text-xs text-surface-on-variant hidden sm:block">
                    {judul.deskripsi}
                  </p>
                )}
              </div>
              <StatusKoneksi />
              <div className="w-px h-8 bg-outline-variant hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-sm">
                  {(user.nama || "?").charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-surface-on leading-tight">
                    {user.nama}
                  </div>
                  <div className="text-[10px] text-surface-on-variant capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SesiProvider>
  );
}
