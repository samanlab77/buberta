/// <reference types="@cloudflare/workers-types" />

/**
 * Buberta Finance — Pages Functions API
 * Runtime: Cloudflare Workers (via Pages Functions)
 * Variable name binding: DB (D1Database)
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const path = (params.route as string[]).join("/");

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
  const body = (await context.request.json()) as any;

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
      total_angsuran_bulanan, tanggal_akad, saldo_pinjaman) VALUES (?,?,?,?,?,?,?,?,0.015,?,?,?,?,?,?)`,
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
        "user-kasir",
      )
      .run();

    await env.DB.prepare(
      'UPDATE kontrak SET saldo_pinjaman = saldo_pinjaman - ?, angsuran_terbayar = angsuran_terbayar + ?, bulan_jasa_terbayar = bulan_jasa_terbayar + 1, updated_at = datetime("now") WHERE id = ?',
    )
      .bind(pokokBayar, 1, body.kontrakId)
      .run();

    await env.DB.prepare(
      'INSERT INTO kas_bank (id, tanggal, jenis, masuk, keterangan, referensi_id, referensi_tipe) VALUES (?,?,"kas",?,?,"angsuran")',
    )
      .bind(crypto.randomUUID(), new Date().toISOString(), totalBayar, id)
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
        "user-kasir",
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
