"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, Eye, EyeOff, Shield, Wifi, BarChart3 } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cekSesi, setCekSesi] = useState(true);

  useEffect(() => {
    let batal = false;
    apiClient
      .me()
      .then(() => router.replace("/dashboard"))
      .catch(() => {
        if (!batal) setCekSesi(false);
      });
    return () => { batal = true; };
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.login(email, password);
      router.replace("/dashboard");
    } catch {
      setError("Email atau kata sandi salah.");
      setLoading(false);
    }
  }

  if (cekSesi) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={28} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen">
      {/* Left: Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -left-10 w-60 h-60 bg-tertiary/10 rounded-full blur-2xl" />
          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-xl">
              B3
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Buberta Finance
          </h1>
          <p className="text-xl text-white/80 mb-10">
            Sistem Manajemen Kredit Mikro untuk Bumdes Bersama Betara LKD
          </p>

          <div className="space-y-4">
            {[
              { icon: Shield, text: "Keamanan data dengan enkripsi PBKDF2" },
              { icon: Wifi, text: "Bekerja offline — data tersinkron otomatis" },
              { icon: BarChart3, text: "Laporan real-time kapan saja" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[420px] animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-2xl mb-3">
              B3
            </div>
            <h1 className="text-2xl font-bold text-surface-on">
              Buberta Finance
            </h1>
            <p className="text-sm text-surface-on-variant mt-1">
              Bumdes Bersama Betara LKD
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-surface-on mb-2">
              Selamat Datang
            </h2>
            <p className="text-surface-on-variant">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 text-sm text-on-error-container bg-error-container rounded-xl px-4 py-3 animate-fade-in">
                <Shield size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-on">
                Email
              </label>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@buberta.id"
                className="input-md3"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-surface-on">
                  Kata sandi
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="input-md3 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-surface-container-high text-surface-on-variant transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? "Memproses…" : "Masuk"}
            </button>

            {/* Demo credentials */}
            <div className="bg-surface-container rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-surface-on uppercase tracking-wider">
                Akun Demo — Kata sandi: admin123
              </div>
              <div className="space-y-2">
                {[
                  { email: "admin@buberta.id", role: "Administrator", color: "bg-primary-container text-on-primary-container" },
                  { email: "manager@buberta.id", role: "Manager", color: "bg-tertiary-container text-on-tertiary-container" },
                  { email: "kasir@buberta.id", role: "Kasir", color: "bg-secondary-container text-secondary-on-container" },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword("admin123");
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-surface-container-high transition-colors text-left group"
                  >
                    <div
                      className={`px-2 py-0.5 rounded text-xs font-medium ${acc.color}`}
                    >
                      {acc.role}
                    </div>
                    <span className="text-sm text-surface-on-variant group-hover:text-surface-on transition-colors">
                      {acc.email}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
