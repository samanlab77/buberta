"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "LPP", href: "/laporan/lpp" },
  { label: "Kolektibilitas", href: "/laporan/kolektibilitas" },
  { label: "Data Lunas", href: "/laporan/lunas" },
  { label: "Buku Kas/Bank", href: "/laporan/kas" },
];

export default function LaporanLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-surface-container w-fit">
        {tabs.map((t) => {
          const aktif =
            pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={
                aktif
                  ? "px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-on-primary shadow-md1 transition-all"
                  : "px-5 py-2.5 rounded-lg text-sm font-medium text-surface-on-variant hover:bg-surface-container-high hover:text-surface-on transition-all"
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
