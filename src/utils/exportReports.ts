import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaksi, TagihanIuran, Warga, ProfilRT } from '../types';
import { formatRupiah, formatTanggalIndo } from './formatters';

interface ExportParams {
  profilRT: ProfilRT;
  transaksiList: Transaksi[];
  tagihanList: TagihanIuran[];
  wargaList: Warga[];
  periodeLabel: string;
}

export function exportKeuanganPDF({
  profilRT,
  transaksiList,
  tagihanList,
  wargaList,
  periodeLabel,
}: ExportParams): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Kop Surat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text(`PENGURUS ${profilRT.namaRT.toUpperCase()}`, pageWidth / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `${profilRT.lingkungan}, KELURAHAN ${profilRT.kelurahan.toUpperCase()}, KEC. ${profilRT.kecamatan.toUpperCase()}`,
    pageWidth / 2,
    23,
    { align: 'center' }
  );
  doc.setFontSize(9);
  doc.text(
    `${profilRT.kota.toUpperCase()} - ${profilRT.provinsi.toUpperCase()} ${profilRT.kodePos} | Kontak: ${profilRT.kontakRT}`,
    pageWidth / 2,
    28,
    { align: 'center' }
  );

  // Garis Kop Surat
  doc.setLineWidth(0.8);
  doc.setDrawColor(0, 0, 0);
  doc.line(14, 31, pageWidth - 14, 31);
  doc.setLineWidth(0.2);
  doc.line(14, 32.5, pageWidth - 14, 32.5);

  // 2. Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('LAPORAN KAS & PERTANGGUNGJAWABAN KEUANGAN', pageWidth / 2, 40, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text(`Periode: ${periodeLabel} | Dicetak pada: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`, pageWidth / 2, 45, {
    align: 'center',
  });

  // 3. Ringkasan Saldo
  const totalPemasukan = transaksiList
    .filter((t) => t.tipe === 'PEMASUKAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPengeluaran = transaksiList
    .filter((t) => t.tipe === 'PENGELUARAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoBersih = totalPemasukan - totalPengeluaran;

  // Box Rekap Saldo
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(0, 0, 0);
  doc.rect(14, 50, pageWidth - 28, 20, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  doc.text(`Total Pemasukan: ${formatRupiah(totalPemasukan)}`, 20, 58);

  doc.setTextColor(180, 0, 0);
  doc.text(`Total Pengeluaran: ${formatRupiah(totalPengeluaran)}`, 20, 65);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Saldo Akhir Kas:`, pageWidth - 80, 58);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(saldoBersih), pageWidth - 80, 65);

  // 4. Tabel Transaksi
  const tableData = transaksiList.map((t, index) => [
    (index + 1).toString(),
    formatTanggalIndo(t.tanggal),
    t.nomorKuitansi,
    t.deskripsi,
    t.kategori,
    t.tipe === 'PEMASUKAN' ? formatRupiah(t.nominal) : '-',
    t.tipe === 'PENGELUARAN' ? formatRupiah(t.nominal) : '-',
  ]);

  autoTable(doc, {
    startY: 74,
    head: [['No', 'Tanggal', 'No. Bukti', 'Keterangan / Uraian', 'Kategori', 'Pemasukan', 'Pengeluaran']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 24 },
      2: { cellWidth: 26 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 32 },
      5: { halign: 'right', cellWidth: 24, textColor: [16, 120, 50] },
      6: { halign: 'right', cellWidth: 24, textColor: [180, 20, 20] },
    },
    foot: [
      [
        '',
        '',
        '',
        'TOTAL PERIODE INI',
        '',
        formatRupiah(totalPemasukan),
        formatRupiah(totalPengeluaran),
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'right',
    },
  });

  // Tanda Tangan
  // @ts-ignore
  let finalY = doc.lastAutoTable?.finalY || 180;
  if (finalY > 230) {
    doc.addPage();
    finalY = 30;
  }

  const signY = finalY + 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  // Kiri: Bendahara
  doc.text(`Mengetahui & Membukukan,`, 30, signY, { align: 'center' });
  doc.text(`Bendahara ${profilRT.namaRT}`, 30, signY + 5, { align: 'center' });
  doc.text(`( ${profilRT.namaBendahara} )`, 30, signY + 28, { align: 'center' });

  // Kanan: Ketua RT
  doc.text(`${profilRT.kota}, ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`, pageWidth - 45, signY, { align: 'center' });
  doc.text(`Ketua ${profilRT.namaRT}`, pageWidth - 45, signY + 5, { align: 'center' });
  doc.text(`( ${profilRT.namaKetuaRT} )`, pageWidth - 45, signY + 28, { align: 'center' });

  // Download File
  doc.save(`Laporan_Kas_${profilRT.namaRT.replace(/[^a-zA-Z0-9]/g, '_')}_${periodeLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export function exportKeuanganExcel({
  profilRT,
  transaksiList,
  tagihanList,
  wargaList,
  periodeLabel,
}: ExportParams): void {
  const wb = XLSX.utils.book_new();

  // 1. Data Transaksi
  const trxRows = transaksiList.map((t, idx) => ({
    No: idx + 1,
    Tanggal: t.tanggal,
    'No. Bukti / Kuitansi': t.nomorKuitansi,
    Tipe: t.tipe,
    Kategori: t.kategori,
    Uraian: t.deskripsi,
    'Pemasukan (Rp)': t.tipe === 'PEMASUKAN' ? t.nominal : 0,
    'Pengeluaran (Rp)': t.tipe === 'PENGELUARAN' ? t.nominal : 0,
    'Penanggung Jawab': t.penanggungJawab,
  }));

  const wsTrx = XLSX.utils.json_to_sheet(trxRows);
  XLSX.utils.book_append_sheet(wb, wsTrx, 'Riwayat Transaksi');

  // 2. Data Status Iuran Warga
  const wargaMap = new Map(wargaList.map((w) => [w.id, w]));
  const tagihanRows = tagihanList.map((tag, idx) => {
    const warga = wargaMap.get(tag.wargaId);
    return {
      No: idx + 1,
      Bulan: tag.bulan,
      'Nama Warga': warga?.nama || 'Unknown',
      'Blok / Rumah': warga?.blokRumah || '-',
      'No. WhatsApp': warga?.noHp || '-',
      'Status Kependudukan': warga?.statusKependudukan || '-',
      'Nominal Tagihan (Rp)': tag.nominal,
      'Status Pembayaran': tag.status,
      'Tanggal Bayar': tag.tanggalBayar || '-',
      'Metode Bayar': tag.metodeBayar || '-',
      Catatan: tag.catatan || '-',
    };
  });

  const wsTagihan = XLSX.utils.json_to_sheet(tagihanRows);
  XLSX.utils.book_append_sheet(wb, wsTagihan, 'Status Iuran Warga');

  // 3. Ringkasan Kas
  const totalPemasukan = transaksiList
    .filter((t) => t.tipe === 'PEMASUKAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPengeluaran = transaksiList
    .filter((t) => t.tipe === 'PENGELUARAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const rekapRows = [
    { Parameter: 'Nama Rukun Tetangga', Nilai: profilRT.namaRT },
    { Parameter: 'Kelurahan / Wilayah', Nilai: `${profilRT.kelurahan}, ${profilRT.kecamatan}, ${profilRT.kota}` },
    { Parameter: 'Ketua RT', Nilai: profilRT.namaKetuaRT },
    { Parameter: 'Bendahara RT', Nilai: profilRT.namaBendahara },
    { Parameter: 'Periode Laporan', Nilai: periodeLabel },
    { Parameter: 'Total Transaksi Dicatat', Nilai: transaksiList.length },
    { Parameter: 'Total Pemasukan Kas', Nilai: totalPemasukan },
    { Parameter: 'Total Pengeluaran Kas', Nilai: totalPengeluaran },
    { Parameter: 'Saldo Bersih Kas', Nilai: totalPemasukan - totalPengeluaran },
    { Parameter: 'Rekening Resmi RT', Nilai: `${profilRT.bankPenerima.namaBank} - ${profilRT.bankPenerima.nomorRekening} a.n ${profilRT.bankPenerima.atasNama}` },
  ];

  const wsRekap = XLSX.utils.json_to_sheet(rekapRows);
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Ringkasan Eksekutif');

  // Simpan file Excel
  XLSX.writeFile(wb, `Laporan_Kas_${profilRT.namaRT.replace(/[^a-zA-Z0-9]/g, '_')}_${periodeLabel.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}
