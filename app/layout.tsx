import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buberta Finance — Sistem Manajemen Kredit Mikro",
  description: "Aplikasi kredit mikro Bumdes Bersama Betara LKD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-background text-surface-on">{children}</body>
    </html>
  );
}
