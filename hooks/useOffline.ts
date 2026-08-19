"use client";

import { useCallback, useEffect, useState } from "react";
import { hitungAntrean, prosesAntrean } from "@/lib/sync";

export interface StatusLuring {
  online: boolean;
  antrean: number;
  menyinkron: boolean;
  sinkron: () => Promise<void>;
  refresh: () => Promise<void>;
}

/** Pantau status koneksi + jumlah antrean, dan sinkron otomatis saat online. */
export function useOffline(): StatusLuring {
  const [online, setOnline] = useState(true);
  const [antrean, setAntrean] = useState(0);
  const [menyinkron, setMenyinkron] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setAntrean(await hitungAntrean());
    } catch {
      // IndexedDB belum siap / tidak tersedia
    }
  }, []);

  const sinkron = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    setMenyinkron(true);
    try {
      await prosesAntrean();
    } finally {
      await refresh();
      setMenyinkron(false);
    }
  }, [refresh]);

  useEffect(() => {
    setOnline(navigator.onLine);
    void refresh();
    const keOnline = () => {
      setOnline(true);
      void sinkron();
    };
    const keOffline = () => setOnline(false);
    window.addEventListener("online", keOnline);
    window.addEventListener("offline", keOffline);
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => {
      window.removeEventListener("online", keOnline);
      window.removeEventListener("offline", keOffline);
      window.clearInterval(timer);
    };
  }, [refresh, sinkron]);

  return { online, antrean, menyinkron, sinkron, refresh };
}
