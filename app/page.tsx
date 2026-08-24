"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  Shield,
  BarChart3,
  Wifi,
  CreditCard,
  Users,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  FileText,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Manajemen Kredit Mikro",
    desc: "Pengajuan akad, jadwal angsuran, dan pelunasan dipercepat — semua terhitung otomatis.",
    color: "bg-primary-container text-on-primary-container",
  },
  {
    icon: Users,
    title: "Database Nasabah",
    desc: "Kelola data nasabah, produk, dan tenor dalam satu panel master data yang terintegrasi.",
    color: "bg-tertiary-container text-on-tertiary-container",
  },
  {
    icon: BarChart3,
    title: "Laporan Real-Time",
    desc: "LPP, kolektibilitas, buku kas, dan tren penerimaan — tersedia kapan saja.",
    color: "bg-secondary-container text-secondary-on-container",
  },
  {
    icon: Wifi,
    title: "Bekerja Offline",
    desc: "Transaksi tetap bisa dilakukan tanpa internet. Data otomatis tersinkron saat online.",
    color: "bg-success-container text-on-success-container",
  },
  {
    icon: Shield,
    title: "Keamanan Terjamin",
    desc: "Autentikasi sesi dengan kata sandi terenkripsi PBKDF2 dan token HMAC.",
    color: "bg-error-container text-on-error-container",
  },
  {
    icon: TrendingUp,
    title: "Analisis Kolektibilitas",
    desc: "Pantau status kredit nasabah dari lancar hingga macet dengan indikator visual.",
    color: "bg-primary-container text-on-primary-container",
  },
];

const stats = [
  { value: "100%", label: "Offline-First" },
  { value: "3", label: "Level Akses" },
  { value: "6", label: "Modul Utama" },
  { value: "24/7", label: "Ketersediaan" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
              B3
            </div>
            <span className="font-semibold text-surface-on text-lg">
              Buberta Finance
            </span>
          </div>
          <Link
            href="/login"
            className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
          >
            Masuk
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero-gradient relative min-h-[92vh] flex items-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -left-20 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse-soft" />
              <span className="text-white/80 text-sm font-medium">
                Bumdes Bersama Betara LKD
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
              Sistem Manajemen{" "}
              <span className="text-tertiary">Kredit Mikro</span>{" "}
              yang Cerdas & Terpercaya
            </h1>

            <p className="text-lg sm:text-xl text-white/75 leading-relaxed mb-10 max-w-2xl animate-fade-in-up delay-200">
              Kelola pinjaman, angsuran, dan pelunasan nasabah dalam satu
              platform modern. Bekerja bahkan tanpa koneksi internet — data
              tersinkron otomatis.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
              <Link
                href="/login"
                className="btn-primary bg-tertiary text-on-tertiary px-8 py-4 text-base font-bold flex items-center gap-2 hover:bg-tertiary/90 hover:shadow-lg"
              >
                Mulai Sekarang
                <ArrowRight size={20} />
              </Link>
              <a
                href="#fitur"
                className="btn-outline border-white/30 text-white hover:bg-white/10 px-8 py-4 text-base flex items-center gap-2"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 animate-fade-in-up delay-500">
              {stats.map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-tertiary">
                    {s.value}
                  </div>
                  <div className="text-sm text-white/60 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="fitur" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 section-fade">
            <div className="chip chip-blue mb-4 mx-auto w-fit">
              <Landmark size={14} className="mr-1.5" />
              Fitur Unggulan
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-on mb-4">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-surface-on-variant text-lg max-w-2xl mx-auto">
              Platform lengkap untuk pengelolaan kredit mikro Bumdes, dirancang
              khusus untuk kemudahan operasional sehari-hari.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 section-fade">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="summary-card group cursor-default"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color} transition-transform group-hover:scale-110`}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-on mb-2">
                    {f.title}
                  </h3>
                  <p className="text-surface-on-variant leading-relaxed text-sm">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 section-fade">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-on mb-4">
              Cara Kerja
            </h2>
            <p className="text-surface-on-variant text-lg max-w-2xl mx-auto">
              Tiga langkah sederhana untuk mulai mengelola kredit mikro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 section-fade">
            {[
              {
                step: "01",
                title: "Daftarkan Nasabah",
                desc: "Tambah data nasabah dengan informasi lengkap: nama, NIK, alamat, dan pekerjaan.",
                icon: Users,
              },
              {
                step: "02",
                title: "Buat Akad Kredit",
                desc: "Pilih nasabah, produk, dan tenor — sistem menghitung jadwal angsuran secara otomatis.",
                icon: FileText,
              },
              {
                step: "03",
                title: "Pantau & Laporkan",
                desc: "Terima angsuran, pantau kolektibilitas, dan akses laporan kapan saja.",
                icon: BarChart3,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative group">
                  <div className="summary-card h-full">
                    <div className="text-5xl font-bold text-primary-container mb-4 select-none">
                      {item.step}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center mb-3">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-on mb-2">
                      {item.title}
                    </h3>
                    <p className="text-surface-on-variant text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-4 text-outline-variant">
                    <ChevronRight size={24} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-gradient rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-tertiary/10 rounded-full blur-xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Siap Mengelola Kredit Mikro dengan Lebih Baik?
              </h2>
              <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto">
                Mulai gunakan Buberta Finance hari ini dan rasakan kemudahan
                pengelolaan keuangan Bumdes Anda.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/login"
                  className="btn-primary bg-tertiary text-on-tertiary px-10 py-4 text-base font-bold flex items-center gap-2 hover:bg-tertiary/90"
                >
                  Masuk ke Sistem
                  <ArrowRight size={20} />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/60">
                {[
                  "Gratis untuk Bumdes",
                  "Bekerja Offline",
                  "Data Aman & Terenkripsi",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-tertiary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                B3
              </div>
              <span className="text-sm text-surface-on-variant">
                &copy; 2026 Buberta Finance — Bumdes Bersama Betara LKD
              </span>
            </div>
            <div className="text-sm text-surface-on-variant">
              Dikembangkan dengan{" "}
              <span className="text-error">♥</span> untuk kemajuan Bumdes
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
