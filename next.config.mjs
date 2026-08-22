/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ekspor statis: menghasilkan folder out/ berisi HTML/CSS/JS murni.
  // Cocok dipasang di Cloudflare Pages sebagai aset statis, sementara API
  // dilayani Pages Functions (functions/api/[[route]].ts) + database D1.
  output: "export",
  // Wajib pada ekspor statis: tidak ada server pengoptimal gambar.
  images: { unoptimized: true },
};

export default nextConfig;
