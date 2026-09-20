export type TipeTransaksi = 'PEMASUKAN' | 'PENGELUARAN';

export type KategoriPemasukan = 
  | 'Iuran Wajib Bulanan'
  | 'Iuran Keamanan'
  | 'Iuran Kebersihan'
  | 'Sumbangan Warga / Donasi'
  | 'Dana Sosial'
  | 'Penyewaan Fasilitas RT'
  | 'Lain-lain';

export type KategoriPengeluaran = 
  | 'Gaji Petugas Keamanan / Satpam'
  | 'Petugas Angkut Sampah'
  | 'Pemeliharaan Fasilitas & Taman'
  | 'Penerangan Jalan & Listrik Pos Ronda'
  | 'Kerja Bakti & Konsumsi Warga'
  | 'Bantuan Sosial / Santunan Warga'
  | 'Kegiatan Warga (17 Agustus / PHBI)'
  | 'Pengadaan Alat Kebersihan & RT'
  | 'Operasional Sekretariat RT';

export type KategoriTransaksi = KategoriPemasukan | KategoriPengeluaran | string;

export type StatusIuran = 'LUNAS' | 'BELUM_BAYAR' | 'MENUNGGAK' | 'MENUNGGU_VERIFIKASI';

export type StatusKependudukan = 'Warga Tetap' | 'Warga Kontrak / Kos';

export interface Warga {
  id: string;
  nik?: string;
  nama: string;
  blokRumah: string; // e.g. "Blok A1 No. 12"
  noHp: string; // e.g. "081234567890"
  email?: string;
  statusKependudukan: StatusKependudukan;
  fotoUrl: string;
  jumlahAnggotaKeluarga: number;
  tanggalBergabung: string;
  catatan?: string;
}

export interface TagihanIuran {
  id: string;
  wargaId: string;
  bulan: string; // "2026-09"
  tahun: number;
  nominal: number;
  rincian: {
    wajib: number;
    kebersihan: number;
    keamanan: number;
    sukarela?: number;
  };
  status: StatusIuran;
  tanggalBayar?: string;
  metodeBayar?: 'Transfer Bank' | 'Tunai ke Bendahara' | 'QRIS RT';
  buktiTransferUrl?: string;
  diverifikasiOleh?: string;
  catatan?: string;
}

export interface Transaksi {
  id: string;
  tipe: TipeTransaksi;
  kategori: KategoriTransaksi;
  nominal: number;
  tanggal: string; // ISO date "2026-09-15"
  deskripsi: string;
  penanggungJawab: string;
  nomorKuitansi: string;
  buktiFotoUrl?: string;
  wargaId?: string; // Optional if linked to citizen payment
  tagihanId?: string;
}

export interface ProfilRT {
  namaRT: string; // e.g. "RT 05 / RW 08"
  lingkungan: string; // e.g. "Perumahan Griya Indah Asri"
  kelurahan: string; // "Sukamaju"
  kecamatan: string; // "Cilodong"
  kota: string; // "Depok"
  provinsi: string; // "Jawa Barat"
  kodePos: string;
  namaKetuaRT: string;
  namaBendahara: string;
  kontakRT: string;
  bankPenerima: {
    namaBank: string;
    nomorRekening: string;
    atasNama: string;
    qrisUrl?: string;
  };
  tarifIuran: {
    wajib: number;
    kebersihan: number;
    keamanan: number;
  };
}

export interface FilterTransaksi {
  searchQuery: string;
  tipe: 'SEMUA' | 'PEMASUKAN' | 'PENGELUARAN';
  kategori: string;
  bulan: string; // "all" or "YYYY-MM"
  tahun: string; // "all" or "YYYY"
}
