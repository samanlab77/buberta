/// <reference types="@cloudflare/workers-types" />

/**
 * Buberta Finance — Pages Functions API
 * Runtime: Cloudflare Workers (via Pages Functions)
 * Variable name binding: DB (D1Database)
 */

interface Env {
  DB: D1Database;
  AUTH_SECRET?: string;
}

// ===================== AUTENTIKASI (sesi berbasis cookie) =====================
// Implementasi ringkas tanpa pustaka Node: verifikasi kata sandi PBKDF2 dan
// token sesi bertanda-tangan HMAC, keduanya via Web Crypto (crypto.subtle)
// yang tersedia di runtime Cloudflare Workers/Pages Functions.
const enc = new TextEncoder();
const NAMA_COOKIE = "bf_sesi";
const MASA_SESI_DETIK = 60 * 60 * 8; // 8 jam

interface SesiPayload {
  sub: string;
  email: string;
  nama: string;
  role: string;
  exp: number;
}

function hexKeBytes(hex: string): Uint8Array {
  const b = new Uint8Array(hex.length / 2);
  for (let i = 0; i < b.length; i++)
    b[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return b;
}
function bufferKeHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
function bytesKeB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlKeBytes(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function strKeB64url(str: string): string {
  return bytesKeB64url(enc.encode(str));
}
function b64urlKeStr(s: string): string {
  return new TextDecoder().decode(b64urlKeBytes(s));
}

async function verifikasiPassword(
  password: string,
  tersimpan: string,
): Promise<boolean> {
  // Format tersimpan: pbkdf2$<iterasi>$<saltHex>$<hashHex>
  const bagian = tersimpan.split("$");
  if (bagian.length !== 4 || bagian[0] !== "pbkdf2") return false;
  const iterasi = parseInt(bagian[1], 10);
  const salt = hexKeBytes(bagian[2]);
  const diharapkan = bagian[3];
  const kunci = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: iterasi, hash: "SHA-256" },
    kunci,
    256,
  );
  const aktual = bufferKeHex(bits);
  if (aktual.length !== diharapkan.length) return false;
  let beda = 0;
  for (let i = 0; i < aktual.length; i++)
    beda |= aktual.charCodeAt(i) ^ diharapkan.charCodeAt(i);
  return beda === 0;
}

async function hmac(secret: string, data: string): Promise<string> {
  const kunci = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", kunci, enc.encode(data));
  return bytesKeB64url(new Uint8Array(sig));
}

function rahasia(env: Env): string {
  return env.AUTH_SECRET || "dev-secret-ganti-di-produksi";
}

async function buatToken(
  payload: SesiPayload,
  secret: string,
): Promise<string> {
  const body = strKeB64url(JSON.stringify(payload));
  return body + "." + (await hmac(secret, body));
}
async function verifikasiToken(
  token: string,
  secret: string,
): Promise<SesiPayload | null> {
  const titik = token.indexOf(".");
  if (titik < 0) return null;
  const body = token.slice(0, titik);
  const sig = token.slice(titik + 1);
  if (sig !== (await hmac(secret, body))) return null;
  try {
    const payload = JSON.parse(b64urlKeStr(body)) as SesiPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000))
      return null;
    return payload;
  } catch {
    return null;
  }
}

function bacaCookie(request: Request, nama: string): string | null {
  const header = request.headers.get("Cookie") || "";
  for (const bagian of header.split(";")) {
    const idx = bagian.indexOf("=");
    if (idx < 0) continue;
    if (bagian.slice(0, idx).trim() === nama)
      return decodeURIComponent(bagian.slice(idx + 1).trim());
  }
  return null;
}
function serialisasiCookie(
  request: Request,
  token: string,
  maxAge: number,
): string {
  const https = new URL(request.url).protocol === "https:";
  return `${NAMA_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; ${
    https ? "Secure; " : ""
  }SameSite=Lax; Max-Age=${maxAge}`;
}

async function bacaSesi(
  request: Request,
  env: Env,
): Promise<SesiPayload | null> {
  const token = bacaCookie(request, NAMA_COOKIE);
  if (!token) return null;
  return verifikasiToken(token, rahasia(env));
}

function galatJson(status: number, pesan: string): Response {
  return new Response(JSON.stringify({ error: pesan }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const path = (params.route as string[]).join("/");

  // Sesi pengguna saat ini (dibaca dari cookie tanda-tangan).
  if (path === "auth/me") {
    const sesi = await bacaSesi(context.request, env);
    if (!sesi) return galatJson(401, "Belum masuk");
    return Response.json({
      user: { id: sesi.sub, email: sesi.email, nama: sesi.nama, role: sesi.role },
    });
  }

  // Semua rute data GET wajib memiliki sesi yang sah.
  const sesi = await bacaSesi(context.request, env);
  if (!sesi) return galatJson(401, "Belum masuk");

  if (path === "kesehatan") {
    const [n, p, k] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) as c FROM nasabah").first(),
      env.DB.prepare("SELECT COUNT(*) as c FROM produk").first(),
      env.DB.prepare("SELECT COUNT(*) as c FROM kontrak").first(),
    ]);
    return Response.json({
      sehat: true,
      jumlah: { nasabah: n?.c, produk: p?.c, kontrak: k?.c },
    });
  }

  if (path === "nasabah") {
    const r = await env.DB.prepare(
      "SELECT * FROM nasabah ORDER BY no_nasabah",
    ).all();
    return Response.json(r.results);
  }

  if (path === "produk") {
    const r = await env.DB.prepare(
      'SELECT * FROM produk WHERE status = "aktif" ORDER BY nama',
    ).all();
    return Response.json(r.results);
  }

  if (path === "tenor-jasa") {
    const r = await env.DB.prepare(
      "SELECT * FROM tenor_jasa WHERE status_aktif = 1 ORDER BY tenor_bulan",
    ).all();
    return Response.json(r.results);
  }

  if (path === "kontrak") {
    const r = await env.DB.prepare(
      "SELECT k.*, n.nama as nasabah_nama, n.no_nasabah FROM kontrak k JOIN nasabah n ON k.nasabah_id = n.id ORDER BY k.created_at DESC",
    ).all();
    return Response.json(r.results);
  }

  if (path.startsWith("kontrak/")) {
    const no = path.split("/")[1];
    const kontrak = await env.DB.prepare(
      "SELECT k.*, n.nama as nasabah_nama, n.no_nasabah FROM kontrak k JOIN nasabah n ON k.nasabah_id = n.id WHERE k.no_kontrak = ?",
    )
      .bind(no)
      .first();
    if (!kontrak) return new Response("Not found", { status: 404 });
    const [jadwal, riwayat] = await Promise.all([
      env.DB.prepare(
        "SELECT * FROM jadwal_angsuran WHERE kontrak_id = ? ORDER BY bulan_ke",
      )
        .bind((kontrak as any).id)
        .all(),
      env.DB.prepare(
        "SELECT * FROM penerimaan_angsuran WHERE kontrak_id = ? ORDER BY tanggal_bayar",
      )
        .bind((kontrak as any).id)
        .all(),
    ]);
    return Response.json({
      ...kontrak,
      jadwal: jadwal.results,
      riwayat: riwayat.results,
    });
  }

  if (path === "lpp") {
    const r = await env.DB.prepare(
      `
      SELECT n.no_nasabah, n.nama, k.pokok_pinjaman as alokasi,
             k.pokok_pinjaman as target_p, k.jasa_total as target_b,
             k.angsuran_terbayar * k.angsuran_pokok_bulanan as realisasi_p,
             k.bulan_jasa_terbayar * k.jasa_bulanan as realisasi_b,
             k.saldo_pinjaman as saldo
      FROM kontrak k JOIN nasabah n ON k.nasabah_id = n.id ORDER BY n.no_nasabah
    `,
    ).all();
    return Response.json(r.results);
  }

  if (path === "kolektibilitas") {
    const r = await env.DB.prepare(
      `
      SELECT status_kolek, COUNT(*) as jumlah FROM kolektibilitas
      WHERE tanggal_penilaian = (SELECT MAX(tanggal_penilaian) FROM kolektibilitas)
      GROUP BY status_kolek
    `,
    ).all();
    return Response.json(r.results);
  }

  if (path === "kolektibilitas-detail") {
    const r = await env.DB.prepare(
      `
      SELECT n.no_nasabah, n.nama, k.status_kolek, k.hari_tunggakan,
             ktr.saldo_pinjaman as saldo
      FROM kolektibilitas k
      JOIN kontrak ktr ON k.kontrak_id = ktr.id
      JOIN nasabah n ON ktr.nasabah_id = n.id
      WHERE k.tanggal_penilaian = (SELECT MAX(tanggal_penilaian) FROM kolektibilitas)
        AND k.status_kolek != 'I'
      ORDER BY k.status_kolek DESC
    `,
    ).all();
    return Response.json(r.results);
  }

  if (path === "kas") {
    const r = await env.DB.prepare(
      "SELECT * FROM kas_bank ORDER BY tanggal DESC LIMIT 100",
    ).all();
    return Response.json(r.results);
  }

  if (path === "lunas") {
    const r = await env.DB.prepare(
      `
      SELECT k.no_kontrak, n.nama, n.no_nasabah, k.tanggal_akad,
             k.updated_at as tanggal_lunas, k.pokok_pinjaman, k.status
      FROM kontrak k JOIN nasabah n ON k.nasabah_id = n.id
      WHERE k.status IN ('lunas','dipercepat')
      ORDER BY k.updated_at DESC
    `,
    ).all();
    return Response.json(r.results);
  }

  if (path === "penerimaan-terbaru") {
    const r = await env.DB.prepare(
      `
      SELECT pa.id, pa.tanggal_bayar, pa.pokok_bayar, pa.jasa_bayar,
             (pa.pokok_bayar + pa.jasa_bayar) as total, n.nama, n.no_nasabah
      FROM penerimaan_angsuran pa
      JOIN kontrak k ON pa.kontrak_id = k.id
      JOIN nasabah n ON k.nasabah_id = n.id
      ORDER BY pa.tanggal_bayar DESC LIMIT 10
    `,
    ).all();
    return Response.json(r.results);
  }

  if (path === "tren-penerimaan") {
    const r = await env.DB.prepare(
      `
      SELECT strftime('%Y-%m', tanggal_bayar) as bulan,
             SUM(pokok_bayar + jasa_bayar) as penerimaan
      FROM penerimaan_angsuran
      GROUP BY bulan ORDER BY bulan DESC LIMIT 6
    `,
    ).all();
    return Response.json((r.results as any[]).reverse());
  }

  if (path === "rekap") {
    const [saldo, penerimaan, nasabah] = await Promise.all([
      env.DB.prepare(
        'SELECT COALESCE(SUM(saldo_pinjaman),0) as c FROM kontrak WHERE status = "aktif"',
      ).first(),
      env.DB.prepare(
        `SELECT COALESCE(SUM(pokok_bayar + jasa_bayar),0) as c FROM penerimaan_angsuran WHERE strftime('%Y-%m',tanggal_bayar) = strftime('%Y-%m','now')`,
      ).first(),
      env.DB.prepare(
        'SELECT COUNT(*) as c FROM nasabah WHERE status = "aktif"',
      ).first(),
    ]);
    return Response.json({
      saldo_pinjaman: saldo?.c,
      penerimaan_bulan_ini: penerimaan?.c,
      nasabah_aktif: nasabah?.c,
    });
  }

  return new Response("Not found", { status: 404 });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const path = (params.route as string[]).join("/");

  // ---- Masuk & keluar (tidak memerlukan sesi sebelumnya) ----
  if (path === "auth/login") {
    const kredensial = (await context.request.json().catch(() => ({}))) as any;
    const email = String(kredensial?.email || "").trim().toLowerCase();
    const password = String(kredensial?.password || "");
    if (!email || !password)
      return galatJson(400, "Email dan kata sandi wajib diisi");
    const user = (await env.DB.prepare(
      "SELECT id, email, password_hash, nama, role, status FROM users WHERE email = ?",
    )
      .bind(email)
      .first()) as any;
    if (!user || user.status !== "aktif")
      return galatJson(401, "Email atau kata sandi salah");
    const cocok = await verifikasiPassword(password, user.password_hash);
    if (!cocok) return galatJson(401, "Email atau kata sandi salah");
    const payload: SesiPayload = {
      sub: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + MASA_SESI_DETIK,
    };
    const token = await buatToken(payload, rahasia(env));
    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": serialisasiCookie(context.request, token, MASA_SESI_DETIK),
        },
      },
    );
  }

  if (path === "auth/logout") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": serialisasiCookie(context.request, "", 0),
      },
    });
  }

  // ---- Semua rute POST lain wajib memiliki sesi yang sah ----
  const sesi = await bacaSesi(context.request, env);
  if (!sesi) return galatJson(401, "Belum masuk");

  const body = (await context.request.json()) as any;

  if (path === "produk") {
    if (sesi.role !== "admin")
      return galatJson(403, "Hanya admin yang boleh menambah produk");
    const nama = String(body?.nama || "").trim();
    const kategori = String(body?.kategori || "").trim();
    const hargaJual = Math.round(Number(body?.harga_jual));
    const stok = Math.round(Number(body?.stok ?? 0));
    if (!nama) return galatJson(400, "Nama produk wajib diisi");
    if (!Number.isFinite(hargaJual) || hargaJual < 0)
      return galatJson(400, "Harga jual tidak valid");
    if (!Number.isFinite(stok) || stok < 0)
      return galatJson(400, "Stok tidak valid");
    const id = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO produk (id, nama, harga_jual, stok, kategori) VALUES (?,?,?,?,?)",
    )
      .bind(id, nama, hargaJual, stok, kategori || null)
      .run();
    return Response.json({
      id,
      nama,
      harga_jual: hargaJual,
      stok,
      kategori,
      status: "aktif",
    });
  }

  if (path === "nasabah") {
    const id = crypto.randomUUID();
    const no = String(Date.now()).slice(-4);
    await env.DB.prepare(
      "INSERT INTO nasabah (id, no_nasabah, nama, nik, alamat, telepon, pekerjaan) VALUES (?,?,?,?,?,?,?)",
    )
      .bind(
        id,
        no,
        body.nama,
        body.nik,
        body.alamat,
        body.telepon,
        body.pekerjaan,
      )
      .run();
    return Response.json({ id, no_nasabah: no, ...body });
  }

  // Update nasabah
  if (path.startsWith("nasabah/")) {
    const id = path.split("/")[1];
    if (!id) return galatJson(400, "ID nasabah wajib diisi");

    const existing = await env.DB.prepare("SELECT id FROM nasabah WHERE id = ?")
      .bind(id)
      .first();
    if (!existing) return galatJson(404, "Nasabah tidak ditemukan");

    const nama = String(body?.nama || "").trim();
    const nik = String(body?.nik || "").trim();
    const alamat = String(body?.alamat || "").trim();
    const telepon = String(body?.telepon || "").trim();
    const pekerjaan = String(body?.pekerjaan || "").trim();

    if (!nama) return galatJson(400, "Nama nasabah wajib diisi");
    if (!nik) return galatJson(400, "NIK wajib diisi");

    await env.DB.prepare(
      "UPDATE nasabah SET nama = ?, nik = ?, alamat = ?, telepon = ?, pekerjaan = ? WHERE id = ?",
    )
      .bind(nama, nik, alamat, telepon, pekerjaan, id)
      .run();

    return Response.json({ id, nama, nik, alamat, telepon, pekerjaan });
  }

  if (path === "kontrak") {
    const id = crypto.randomUUID();
    const noKontrak = `BF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    // Server menghitung, bukan peramban!
    const pokok = body.hargaJual - body.dp;
    const jasaTotal = Math.round(pokok * 0.015 * body.tenor);
    const total = pokok + jasaTotal;
    const angsuranBulanan = Math.round(total / body.tenor);
    const jasaBulanan = Math.round(jasaTotal / body.tenor);
    const pokokBulanan = Math.round(pokok / body.tenor);

    await env.DB.prepare(
      `INSERT INTO kontrak (id, no_kontrak, nasabah_id, produk_id, harga_jual, dp,
      pokok_pinjaman, tenor, persentase_jasa, jasa_total, angsuran_pokok_bulanan, jasa_bulanan,
      total_angsuran_bulanan, tanggal_akad, saldo_pinjaman) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
      .bind(
        id,
        noKontrak,
        body.nasabahId,
        body.produkId || null,
        body.hargaJual,
        body.dp,
        pokok,
        body.tenor,
        0.015,
        jasaTotal,
        pokokBulanan,
        jasaBulanan,
        angsuranBulanan,
        new Date().toISOString(),
        total,
      )
      .run();

    // Generate jadwal angsuran
    const baseDate = new Date();
    let sisa = total;
    for (let i = 1; i <= body.tenor; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      sisa -= pokokBulanan + jasaBulanan;
      await env.DB.prepare(
        "INSERT INTO jadwal_angsuran (id, kontrak_id, bulan_ke, tanggal_jatuh_tempo, angsuran_pokok, jasa, total_angsuran, sisa_saldo) VALUES (?,?,?,?,?,?,?,?)",
      )
        .bind(
          crypto.randomUUID(),
          id,
          i,
          dueDate.toISOString().split("T")[0],
          pokokBulanan,
          jasaBulanan,
          pokokBulanan + jasaBulanan,
          Math.max(0, sisa),
        )
        .run();
    }

    if (body.produkId) {
      await env.DB.prepare(
        "UPDATE produk SET stok = stok - 1 WHERE id = ? AND stok > 0",
      )
        .bind(body.produkId)
        .run();
    }
    return Response.json({ id, no_kontrak: noKontrak });
  }

  if (path === "angsuran") {
    const kontrak = (await env.DB.prepare("SELECT * FROM kontrak WHERE id = ?")
      .bind(body.kontrakId)
      .first()) as any;
    if (!kontrak) return new Response("Kontrak not found", { status: 404 });
    // Validasi: cegah pembayaran melebihi tenor
    if (kontrak.angsuran_terbayar >= kontrak.tenor) {
      return galatJson(400, "Tenor sudah lunas, tidak bisa menerima angsuran lagi");
    }
    // Server menghitung split pokok vs jasa
    const pokokBayar = kontrak.angsuran_pokok_bulanan;
    const jasaBayar = kontrak.jasa_bulanan;
    const totalBayar = pokokBayar + jasaBayar;
    const id = crypto.randomUUID();

    await env.DB.prepare(
      "INSERT INTO penerimaan_angsuran (id, kontrak_id, tanggal_bayar, jumlah_bayar, pokok_bayar, jasa_bayar, bulan_ke, kasir_id) VALUES (?,?,?,?,?,?,?,?)",
    )
      .bind(
        id,
        body.kontrakId,
        new Date().toISOString(),
        totalBayar,
        pokokBayar,
        jasaBayar,
        body.bulanBerjalan,
        sesi.sub,
      )
      .run();

    await env.DB.prepare(
      'UPDATE kontrak SET saldo_pinjaman = saldo_pinjaman - ?, angsuran_terbayar = angsuran_terbayar + ?, bulan_jasa_terbayar = bulan_jasa_terbayar + 1, updated_at = datetime("now") WHERE id = ?',
    )
      .bind(pokokBayar, 1, body.kontrakId)
      .run();

    await env.DB.prepare(
      'INSERT INTO kas_bank (id, tanggal, jenis, masuk, keterangan, referensi_id, referensi_tipe) VALUES (?,?,"kas",?,?,?,"angsuran")',
    )
      .bind(crypto.randomUUID(), new Date().toISOString(), totalBayar, "", id)
      .run();

    return Response.json({
      id,
      pokok_bayar: pokokBayar,
      jasa_bayar: jasaBayar,
      total: totalBayar,
    });
  }

  if (path === "pelunasan") {
    const kontrak = (await env.DB.prepare("SELECT * FROM kontrak WHERE id = ?")
      .bind(body.kontrakId)
      .first()) as any;
    if (!kontrak) return new Response("Kontrak not found", { status: 404 });
    const sisaBulan = kontrak.tenor - kontrak.angsuran_terbayar;
    const sisaPokok = kontrak.saldo_pinjaman;
    const jasaPelunasan = Math.round(
      sisaPokok * kontrak.persentase_jasa * sisaBulan,
    );
    const totalPelunasan = sisaPokok + jasaPelunasan;
    const id = crypto.randomUUID();

    await env.DB.prepare(
      "INSERT INTO pelunasan (id, kontrak_id, tanggal_pelunasan, sisa_pokok, jasa_pelunasan, total_pelunasan, kasir_id) VALUES (?,?,?,?,?,?,?)",
    )
      .bind(
        id,
        body.kontrakId,
        new Date().toISOString(),
        sisaPokok,
        jasaPelunasan,
        totalPelunasan,
        sesi.sub,
      )
      .run();
    await env.DB.prepare(
      'UPDATE kontrak SET status = "dipercepat", saldo_pinjaman = 0, updated_at = datetime("now") WHERE id = ?',
    )
      .bind(body.kontrakId)
      .run();

    return Response.json({
      id,
      sisa_pokok: sisaPokok,
      jasa_pelunasan: jasaPelunasan,
      total_pelunasan: totalPelunasan,
    });
  }

  return new Response("Not found", { status: 404 });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const path = (params.route as string[]).join("/");

  // Semua rute DELETE wajib memiliki sesi yang sah
  const sesi = await bacaSesi(context.request, env);
  if (!sesi) return galatJson(401, "Belum masuk");

  // Hapus kontrak
  if (path.startsWith("kontrak/")) {
    const id = path.split("/")[1];
    if (!id) return galatJson(400, "ID kontrak wajib diisi");

    const kontrak = (await env.DB.prepare(
      "SELECT * FROM kontrak WHERE id = ?"
    )
      .bind(id)
      .first()) as any;
    if (!kontrak) return galatJson(404, "Kontrak tidak ditemukan");

    // Cek apakah sudah ada pembayaran
    const jumlahBayar = (await env.DB.prepare(
      "SELECT COUNT(*) as c FROM penerimaan_angsuran WHERE kontrak_id = ?"
    )
      .bind(id)
      .first()) as any;
    if (jumlahBayar && jumlahBayar.c > 0) {
      return galatJson(400, "Kontrak sudah memiliki pembayaran, tidak bisa dihapus. Hapus angsuran terlebih dahulu.");
    }

    // Hapus semua data terkait dalam urutan yang benar
    await env.DB.prepare("DELETE FROM jadwal_angsuran WHERE kontrak_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM penerimaan_angsuran WHERE kontrak_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM kas_bank WHERE referensi_id IN (SELECT id FROM penerimaan_angsuran WHERE kontrak_id = ?) AND referensi_tipe = 'angsuran'").bind(id).run();
    await env.DB.prepare("DELETE FROM pelunasan WHERE kontrak_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM kolektibilitas WHERE kontrak_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM kontrak WHERE id = ?").bind(id).run();

    // Kembalikan stok produk jika ada
    if (kontrak.produk_id) {
      await env.DB.prepare("UPDATE produk SET stok = stok + 1 WHERE id = ?").bind(kontrak.produk_id).run();
    }

    return Response.json({
      ok: true,
      message: "Kontrak berhasil dihapus",
      deleted: {
        id: kontrak.id,
        no_kontrak: kontrak.no_kontrak,
      },
    });
  }

  // Hapus angsuran
  if (path.startsWith("angsuran/")) {
    const id = path.split("/")[1];
    if (!id) return galatJson(400, "ID angsuran wajib diisi");

    // Ambil data angsuran
    const angsuran = (await env.DB.prepare(
      "SELECT * FROM penerimaan_angsuran WHERE id = ?"
    )
      .bind(id)
      .first()) as any;
    if (!angsuran) return galatJson(404, "Data angsuran tidak ditemukan");

    // Ambil data kontrak
    const kontrak = (await env.DB.prepare(
      "SELECT * FROM kontrak WHERE id = ?"
    )
      .bind(angsuran.kontrak_id)
      .first()) as any;
    if (!kontrak) return galatJson(404, "Kontrak tidak ditemukan");

    // Hapus record penerimaan_angsuran
    await env.DB.prepare("DELETE FROM penerimaan_angsuran WHERE id = ?")
      .bind(id)
      .run();

    // Restore saldo pinjaman (tambah kembali pokok yang sudah dibayar)
    await env.DB.prepare(
      'UPDATE kontrak SET saldo_pinjaman = saldo_pinjaman + ?, angsuran_terbayar = angsuran_terbayar - 1, bulan_jasa_terbayar = bulan_jasa_terbayar - 1, updated_at = datetime("now") WHERE id = ?'
    )
      .bind(angsuran.pokok_bayar, angsuran.kontrak_id)
      .run();

    // Hapus record kas_bank yang terkait
    await env.DB.prepare(
      "DELETE FROM kas_bank WHERE referensi_id = ? AND referensi_tipe = 'angsuran'"
    )
      .bind(id)
      .run();

    return Response.json({
      ok: true,
      message: "Angsuran berhasil dihapus dan data kontrak dipulihkan",
      deleted: {
        id: angsuran.id,
        pokok_bayar: angsuran.pokok_bayar,
        jasa_bayar: angsuran.jasa_bayar,
        total: angsuran.pokok_bayar + angsuran.jasa_bayar,
      },
    });
  }

  return new Response("Not found", { status: 404 });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const path = (params.route as string[]).join("/");

  const sesi = await bacaSesi(context.request, env);
  if (!sesi) return galatJson(401, "Belum masuk");

  const body = (await context.request.json()) as any;

  // Update kontrak
  if (path.startsWith("kontrak/")) {
    const id = path.split("/")[1];
    if (!id) return galatJson(400, "ID kontrak wajib diisi");

    const existing = (await env.DB.prepare(
      "SELECT * FROM kontrak WHERE id = ?"
    )
      .bind(id)
      .first()) as any;
    if (!existing) return galatJson(404, "Kontrak tidak ditemukan");

    // Hanya bisa edit kontrak yang belum ada pembayaran
    if (existing.angsuran_terbayar > 0) {
      return galatJson(400, "Kontrak sudah memiliki pembayaran, tidak bisa diedit");
    }

    const nasabahId = String(body?.nasabahId || existing.nasabah_id).trim();
    const hargaJual = Math.round(Number(body?.hargaJual ?? existing.harga_jual));
    const dp = Math.round(Number(body?.dp ?? existing.dp));
    const tenor = Math.round(Number(body?.tenor ?? existing.tenor));
    const produkId = body?.produkId !== undefined ? (body.produkId || null) : existing.produk_id;

    if (!nasabahId) return galatJson(400, "Nasabah wajib diisi");
    if (!Number.isFinite(hargaJual) || hargaJual < 0)
      return galatJson(400, "Harga jual tidak valid");
    if (!Number.isFinite(tenor) || tenor < 1)
      return galatJson(400, "Tenor tidak valid");

    // Hitung ulang
    const pokok = hargaJual - dp;
    const jasaTotal = Math.round(pokok * 0.015 * tenor);
    const total = pokok + jasaTotal;
    const angsuranBulanan = Math.round(total / tenor);
    const jasaBulanan = Math.round(jasaTotal / tenor);
    const pokokBulanan = Math.round(pokok / tenor);

    await env.DB.prepare(
      `UPDATE kontrak SET nasabah_id = ?, produk_id = ?, harga_jual = ?, dp = ?,
      pokok_pinjaman = ?, tenor = ?, jasa_total = ?, angsuran_pokok_bulanan = ?,
      jasa_bulanan = ?, total_angsuran_bulanan = ?, saldo_pinjaman = ?,
      updated_at = datetime('now') WHERE id = ?`,
    )
      .bind(
        nasabahId,
        produkId,
        hargaJual,
        dp,
        pokok,
        tenor,
        jasaTotal,
        pokokBulanan,
        jasaBulanan,
        angsuranBulanan,
        total,
        id,
      )
      .run();

    // Regenerate jadwal angsuran
    await env.DB.prepare("DELETE FROM jadwal_angsuran WHERE kontrak_id = ?").bind(id).run();
    const baseDate = new Date();
    let sisa = total;
    for (let i = 1; i <= tenor; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      sisa -= pokokBulanan + jasaBulanan;
      await env.DB.prepare(
        "INSERT INTO jadwal_angsuran (id, kontrak_id, bulan_ke, tanggal_jatuh_tempo, angsuran_pokok, jasa, total_angsuran, sisa_saldo) VALUES (?,?,?,?,?,?,?,?)",
      )
        .bind(
          crypto.randomUUID(),
          id,
          i,
          dueDate.toISOString().split("T")[0],
          pokokBulanan,
          jasaBulanan,
          pokokBulanan + jasaBulanan,
          Math.max(0, sisa),
        )
        .run();
    }

    return Response.json({
      id,
      no_kontrak: existing.no_kontrak,
      nasabah_id: nasabahId,
      produk_id: produkId,
      harga_jual: hargaJual,
      dp,
      pokok_pinjaman: pokok,
      tenor,
      jasa_total: jasaTotal,
      angsuran_pokok_bulanan: pokokBulanan,
      jasa_bulanan: jasaBulanan,
      total_angsuran_bulanan: angsuranBulanan,
      saldo_pinjaman: total,
    });
  }

  return new Response("Not found", { status: 404 });
};
