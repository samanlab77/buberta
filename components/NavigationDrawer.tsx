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
  ChevronRight,
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

const warnaPeran: Record<Peran, string> = {
  admin: "bg-primary-container text-on-primary-container",
  manager: "bg-tertiary-container text-on-tertiary-container",
  kasir: "bg-secondary-container text-secondary-on-container",
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-surface-container-lowest border-r border-outline-variant z-50 flex flex-col overflow-y-auto transition-transform duration-300 ease-md ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-md1">
              B3
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-surface-on tracking-tight">
                Buberta Finance
              </div>
              <div className="text-xs text-surface-on-variant truncate">
                Bumdes Bersama Betara LKD
              </div>
            </div>
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container-high text-surface-on-variant transition-colors"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-outline-variant" />

        {/* Navigation */}
        <nav className="flex-1 p-3 mt-2">
          <div className="text-xs font-semibold text-surface-on-variant uppercase tracking-wider px-4 mb-2">
            Menu
          </div>
          {menu.map((item) => {
            const active = pathname.startsWith("/" + item.section);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 h-11 rounded-xl font-medium text-sm transition-all duration-200 my-0.5 group ${
                  active
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "text-surface-on-variant hover:bg-surface-container-high"
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors ${active ? "text-primary" : "text-surface-on-variant group-hover:text-surface-on"}`}
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <ChevronRight size={14} className="text-primary opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-outline-variant">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-high transition-colors group">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {inisial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-surface-on truncate">
                {user.nama}
              </div>
              <span
                className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${warnaPeran[user.role]}`}
              >
                {labelPeran[user.role] ?? user.role}
              </span>
            </div>
            <button
              onClick={onKeluar}
              title="Keluar"
              aria-label="Keluar"
              className="p-2 rounded-lg hover:bg-error-container text-surface-on-variant hover:text-error transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-30 lg:hidden p-2.5 rounded-xl bg-surface-container-lowest shadow-md1 hover:bg-surface-container-high transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
      >
        <Menu size={22} className="text-surface-on" />
      </button>
    </>
  );
}
