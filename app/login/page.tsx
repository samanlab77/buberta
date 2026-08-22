"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cekSesi, setCekSesi] = useState(true);

  // Jika sudah masuk, langsung arahkan ke dashboard.
  useEffect(() => {
    let batal = false;
    apiClient
      .me()
      .then(() => router.replace("/dashboard"))
      .catch(() => {
        if (!batal) setCekSesi(false);
      });
    return () => {
      batal = true;
    };
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
      <main className="flex min-h-screen items-center justify-center bg-background text-surface-on-variant">
        <Loader2 className="animate-spin" size={22} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-2xl mb-3">
            BF
          </div>
          <h1 className="text-2xl font-semibold text-surface-on">
            Buberta Finance
          </h1>
          <p className="text-sm text-surface-on-variant">
            Bumdes Bersama Betara LKD
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-surface-container-low border border-outline-variant rounded-[28px] p-6 flex flex-col gap-4 shadow-md1"
        >
          <h2 className="text-lg font-semibold text-surface-on">Masuk</h2>

          {error && (
            <div className="text-sm text-on-error-container bg-error-container rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-surface-on-variant">
              Email
            </span>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@buberta.id"
              className="h-12 px-4 rounded-xl bg-surface-container border border-outline-variant text-surface-on outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-surface-on-variant">
              Kata sandi
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 px-4 rounded-xl bg-surface-container border border-outline-variant text-surface-on outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-full bg-primary text-on-primary font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? "Memproses…" : "Masuk"}
          </button>

          <div className="text-xs text-surface-on-variant border-t border-outline-variant pt-3">
            <p className="font-medium mb-1">Akun demo — kata sandi: admin123</p>
            <ul className="space-y-0.5">
              <li>admin@buberta.id — Administrator</li>
              <li>manager@buberta.id — Manager</li>
              <li>kasir@buberta.id — Kasir</li>
            </ul>
          </div>
        </form>
      </div>
    </main>
  );
}
