import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buberta Finance — Sistem Manajemen Kredit Mikro",
  description:
    "Aplikasi manajemen kredit mikro Bumdes Bersama Betara LKD. Kelola pinjaman, angsuran, dan pelunasan nasabah dalam satu platform modern.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-surface-on antialiased">
        {children}
      </body>
    </html>
  );
}
