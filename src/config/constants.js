// Konstanta aplikasi (daftar ruangan, bidang, RKBMD, masa manfaat)

const ROOM_LIST = [
  "Ruang Kerja Kepala Dinas", "Ruang Rapat Kepala Dinas", "Ruang Receptionist Kepala Dinas",
  "Ruang Kerja Sekretaris Dinas", "Ruang Rapat lantai 1/ ruang rapat kakao", "Ruang Sub Bagian Umum",
  "Ruang Penyusunan Program Anggaran", "Ruang Bagian Keuangan", "Ruang Record Center",
  "Ruang Aset", "Ruang Perpustakaan", "Ruang Transit Dharmawanita Dinas Perkebunan",
  "Ruang Rapat APBN", "Ruang Rapat lantai 3/ Ruang Rapat Tebu",
  "Ruang Kepala Bidang 1 (Bidang Produksi dan Pemasaran Hasil)", "Ruang Bidang 1 (Bidang Produksi dan Pemasaran Hasil)", "Ruang Rapat Bidang 1 (Bidang Produksi dan Pemasaran Hasil)",
  "Ruang Kepala Bidang 2 (Bidang Perlindungan)", "Ruang Bidang 2 (Bidang Perlindungan)", "Ruang Rapat Bidang 2 (Bidang Perlindungan)",
  "Ruang Kepala Bidang 3 (Bidang Tanaman Semusim)", "Ruang Bidang 3 (Bidang Tanaman Semusim)", "Ruang Rapat Bidang 3 (Bidang Proteksi Tanaman Tahunan)",
  "Ruang Kepala Bidang 4 (Bidang Proteksi Tanaman Tahunan)", "Ruang Bidang 4 (Bidang Proteksi Tanaman Tahunan)", "Ruang Rapat Bidang 4 (Bidang Proteksi Tanaman Tahunan)"
];

const ALL_BIDANG_RKBMD = [
  "Bidang Produksi dan Pemasaran Hasil (PPH)", 
  "Bidang Perlindungan", 
  "Bidang Tanaman Semusim", 
  "Bidang Proteksi Tanaman Tahunan", 
  "Sekretariat",
  "UPT P2BTP",
  "UPT PSBP"
];

const JENIS_USULAN_RKBMD = ["Usulan RKBMD Pengadaan", "Usulan RKBMD Pemindahtanganan", "Usulan RKBMD Pemeliharaan"];

const BIDANG_PUSAT_LIST = [
  "Sekretariat",
  "Bidang Perlindungan Perkebunan",
  "Bidang Pengolahan dan Pemasaran Hasil",
  "Bidang Produksi Tanaman Semusim",
  "Bidang Proteksi Tanaman Tahunan"
];

const DEFAULT_MASA_MANFAAT = [
  { kode: '1.3.2.01', nama: 'Alat Besar Darat', masa_manfaat: 10 },
  { kode: '1.3.2.02', nama: 'Alat Besar Apung', masa_manfaat: 8 },
  { kode: '1.3.2.03', nama: 'Alat Bantu', masa_manfaat: 7 },
  { kode: '1.3.2.04', nama: 'Kendaraan Bermotor Penumpang', masa_manfaat: 7 },
  { kode: '1.3.2.05', nama: 'Kendaraan Bermotor Angkutan', masa_manfaat: 7 },
  { kode: '1.3.2.06', nama: 'Peralatan Bengkel', masa_manfaat: 5 },
  { kode: '1.3.2.07', nama: 'Alat Ukur', masa_manfaat: 5 },
  { kode: '1.3.2.08', nama: 'Alat Pertanian', masa_manfaat: 5 },
  { kode: '1.3.2.09', nama: 'Peralatan Kantor', masa_manfaat: 5 },
  { kode: '1.3.2.10', nama: 'Perlengkapan Kantor', masa_manfaat: 5 },
  { kode: '1.3.2.11', nama: 'Komputer', masa_manfaat: 4 },
  { kode: '1.3.2.12', nama: 'Meja / Kursi / Mebeulair', masa_manfaat: 5 },
  { kode: '1.3.2.13', nama: 'Peralatan Dapur', masa_manfaat: 4 },
  { kode: '1.3.2.14', nama: 'Penghias Ruangan', masa_manfaat: 5 },
  { kode: '1.3.2.16', nama: 'Alat Fotografi', masa_manfaat: 5 },
  { kode: '1.3.3.01', nama: 'Bangunan Gedung', masa_manfaat: 50 },
  { kode: '1.3.3.02', nama: 'Monumen', masa_manfaat: 50 },
  { kode: '1.3.4.01', nama: 'Jalan dan Jembatan', masa_manfaat: 10 },
  { kode: '1.3.5', nama: 'Aset Tetap Lainnya', masa_manfaat: 4 },
];

export { ROOM_LIST, ALL_BIDANG_RKBMD, JENIS_USULAN_RKBMD, BIDANG_PUSAT_LIST, DEFAULT_MASA_MANFAAT };
