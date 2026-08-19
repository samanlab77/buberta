const penggunaData = [
  {
    nama: "Administrator",
    email: "admin@buberta.id",
    role: "admin",
    deskripsi: "Akses penuh sistem",
  },
  {
    nama: "Manager Buberta",
    email: "manager@buberta.id",
    role: "manager",
    deskripsi: "Persetujuan kredit & laporan",
  },
  {
    nama: "Kasir Bumdes",
    email: "kasir@buberta.id",
    role: "kasir",
    deskripsi: "Input transaksi harian",
  },
];

const roleChip: Record<string, string> = {
  admin: "bg-primary-container text-on-primary-container",
  manager: "bg-tertiary-container text-on-tertiary-container",
  kasir: "bg-secondary-container text-secondary-on-container",
};

export default function PenggunaPage() {
  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low rounded-xl shadow-md1 overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-surface-on">
              Manajemen Pengguna
            </h2>
            <p className="text-sm text-surface-on-variant">
              {penggunaData.length} pengguna terdaftar · 3 peran
            </p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-sm hover:opacity-90">
            + Tambah Pengguna
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-surface-on-variant">
                <th className="text-left py-3 px-4">Nama</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Peran</th>
                <th className="text-left py-3 px-4">Hak Akses</th>
                <th className="text-right py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {penggunaData.map((u) => (
                <tr
                  key={u.email}
                  className="border-b border-outline-variant/50 hover:bg-surface-container"
                >
                  <td className="py-3 px-4 font-medium">{u.nama}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium capitalize ${roleChip[u.role]}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-surface-on-variant">
                    {u.deskripsi}
                  </td>
                  <td className="text-right py-3 px-4">
                    <button className="text-primary font-medium hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-tertiary-container rounded-xl p-5">
        <div className="text-sm text-on-tertiary-container">
          ⚠️ Kata sandi awal semua akun:{" "}
          <code className="font-mono font-semibold">admin123</code>. Wajib
          diganti saat login pertama di lingkungan produksi.
        </div>
      </div>
    </div>
  );
}
