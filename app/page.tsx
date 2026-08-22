"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Pengalihan sisi-klien ke /dashboard.
// redirect() sisi-server dari next/navigation TIDAK didukung pada
// output: "export", jadi kita alihkan lewat router di useEffect.
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-surface-on-variant">
      Mengalihkan ke dashboard…
    </main>
  );
}
