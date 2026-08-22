"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import NavigationDrawer from "@/components/NavigationDrawer";
import StatusKoneksi from "@/components/StatusKoneksi";
import { apiClient, type SesiUser } from "@/lib/api";
import { SesiProvider } from "@/hooks/useSesi";

// Kebijakan akses per-peran: prefix path -> peran yang diizinkan.
const kebijakanPeran: { prefix: string; peran: SesiUser["role"][] }[] = [
  { prefix: "/pengaturan", peran: ["admin", "manager"] },
];

const judulHalaman: { prefix: string; judul: string }[] = [
  { prefix: "/dashboard", judul: "Dashboard" },
  { prefix: "/master", judul: "Master Data" },
  { prefix: "/transaksi", judul: "Transaksi Kredit" },
  { prefix: "/laporan", judul: "Laporan" },
  { prefix: "/pengaturan", judul: "Pengaturan" },
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
    return () => {
      batal = true;
    };
  }, [router]);

  // Blokir peran yang tidak berwenang membuka rute tertentu.
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
      <main className="flex min-h-screen items-center justify-center bg-background text-surface-on-variant">
        <Loader2 className="animate-spin" size={22} />
      </main>
    );
  }

  return (
    <SesiProvider value={user}>
      <div className="flex min-h-screen">
      <NavigationDrawer user={user} onKeluar={keluar} />
      <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant px-5 h-16 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-surface-on flex-1">
            {judulHalaman.find((j) => pathname.startsWith(j.prefix))?.judul ??
              "Buberta Finance"}
          </h1>
          <StatusKoneksi />
        </header>
        <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>
      </div>
    </SesiProvider>
  );
}
