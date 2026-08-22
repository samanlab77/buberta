"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Banknote,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { type SesiUser } from "@/lib/api";

type Peran = SesiUser["role"];

const menuItems: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  section: string;
  roles: Peran[];
}[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "dashboard",
    roles: ["admin", "manager", "kasir"],
  },
  {
    label: "Master Data",
    href: "/master/nasabah",
    icon: FolderOpen,
    section: "master",
    roles: ["admin", "manager", "kasir"],
  },
  {
    label: "Transaksi Kredit",
    href: "/transaksi/akad",
    icon: Banknote,
    section: "transaksi",
    roles: ["admin", "manager", "kasir"],
  },
  {
    label: "Laporan",
    href: "/laporan/lpp",
    icon: BarChart3,
    section: "laporan",
    roles: ["admin", "manager", "kasir"],
  },
  {
    label: "Pengaturan",
    href: "/pengaturan/pengguna",
    icon: Settings,
    section: "pengaturan",
    roles: ["admin", "manager"],
  },
];

const labelPeran: Record<Peran, string> = {
  admin: "Administrator",
  manager: "Manager",
  kasir: "Kasir",
};

export default function NavigationDrawer({
  user,
  onKeluar,
}: {
  user: SesiUser;
  onKeluar: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const inisial = (user.nama || "?").charAt(0).toUpperCase();
  const menu = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-surface-container-low border-r border-outline-variant z-50 flex flex-col overflow-y-auto transition-transform duration-200 ease-md ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 p-5 pb-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
            BF
          </div>
          <div>
            <div className="text-base font-semibold text-surface-on">
              Buberta Finance
            </div>
            <div className="text-xs text-surface-on-variant">
              Bumdes Bersama Betara LKD
            </div>
          </div>
          <button
            className="ml-auto lg:hidden p-2 rounded-full hover:bg-surface-container-high"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-3">
          {menu.map((item) => {
            const active = pathname.startsWith("/" + item.section);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3.5 px-4 h-12 rounded-[28px] font-medium text-sm transition-colors duration-200 ease-md my-0.5 ${active ? "bg-secondary-container text-secondary-on-container font-semibold" : "text-surface-on-variant hover:bg-surface-container-high"}`}
              >
                <Icon size={24} className={active ? "text-primary" : ""} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-outline-variant">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold text-sm">
              {inisial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-surface-on truncate">
                {user.nama}
              </div>
              <div className="text-xs text-surface-on-variant">
                {labelPeran[user.role] ?? user.role}
              </div>
            </div>
            <button
              onClick={onKeluar}
              title="Keluar"
              aria-label="Keluar"
              className="p-2 rounded-full hover:bg-surface-container-high text-surface-on-variant"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
      <button
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-full hover:bg-surface-container-high"
        onClick={() => setOpen(true)}
      >
        <Menu size={24} />
      </button>
    </>
  );
}
