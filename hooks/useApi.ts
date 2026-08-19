"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface HasilApi<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  muatUlang: () => Promise<void>;
}

/**
 * Hook pemuat data generik untuk memanggil apiClient dari komponen klien.
 * Fetcher terbaru disimpan di ref agar useEffect tidak memicu loop.
 */
export function useApi<T>(fetcher: () => Promise<T>): HasilApi<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const muatUlang = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetcherRef.current());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void muatUlang();
  }, [muatUlang]);

  return { data, loading, error, muatUlang };
}
