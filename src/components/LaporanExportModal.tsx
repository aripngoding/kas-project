import React, { useState } from 'react';
import { Transaksi, TagihanIuran, Warga, ProfilRT } from '../types';
import { exportKeuanganPDF, exportKeuanganExcel } from '../utils/exportReports';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { X, FileText, FileSpreadsheet, Download, CheckCircle, Calendar } from 'lucide-react';

interface LaporanExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profilRT: ProfilRT;
  transaksiList: Transaksi[];
  tagihanList: TagihanIuran[];
  wargaList: Warga[];
}

export const LaporanExportModal: React.FC<LaporanExportModalProps> = ({
  isOpen,
  onClose,
  profilRT,
  transaksiList,
  tagihanList,
  wargaList,
}) => {
  const [periode, setPeriode] = useState<'2026-09' | '3-bulan' | '2026' | 'all'>('2026-09');
  const [formatType, setFormatType] = useState<'pdf' | 'excel'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter transactions according to selected period
  const getFilteredTransactions = (): { list: Transaksi[]; label: string } => {
    if (periode === '2026-09') {
      return {
        list: transaksiList.filter((t) => t.tanggal.startsWith('2026-09')),
        label: 'September 2026',
      };
    }
    if (periode === '3-bulan') {
      return {
        list: transaksiList.filter((t) =>
          ['2026-07', '2026-08', '2026-09'].some((m) => t.tanggal.startsWith(m))
        ),
        label: 'Triwulan III 2026 (Juli - September)',
      };
    }
    if (periode === '2026') {
      return {
        list: transaksiList.filter((t) => t.tanggal.startsWith('2026')),
        label: 'Tahun 2026',
      };
    }
    return {
      list: transaksiList,
      label: 'Seluruh Riwayat Kas',
    };
  };

  const { list: filteredTrx, label: periodeLabel } = getFilteredTransactions();

  const totalIn = filteredTrx
    .filter((t) => t.tipe === 'PEMASUKAN')
    .reduce((a, b) => a + b.nominal, 0);

  const totalOut = filteredTrx
    .filter((t) => t.tipe === 'PENGELUARAN')
    .reduce((a, b) => a + b.nominal, 0);

  const saldo = totalIn - totalOut;

  const handleExport = () => {
    setIsExporting(true);
    try {
      if (formatType === 'pdf') {
        exportKeuanganPDF({
          profilRT,
          transaksiList: filteredTrx,
          tagihanList,
          wargaList,
          periodeLabel,
        });
      } else {
        exportKeuanganExcel({
          profilRT,
          transaksiList: filteredTrx,
          tagihanList,
          wargaList,
          periodeLabel,
        });
      }
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="neo-box max-w-lg w-full bg-[#FFFDF7] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#FFE600] border-b-3 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 stroke-[2.5]" />
            <h2 className="font-display font-black text-lg sm:text-xl text-black">
              Export Laporan Keuangan Kas RT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white border-2 border-black hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1.5">
              1. Pilih Format Laporan *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormatType('pdf')}
                className={`p-3 border-2 border-black flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                  formatType === 'pdf'
                    ? 'bg-[#FF4B4B] text-white shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                    : 'bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0_0_#000]'
                }`}
              >
                <FileText className="w-6 h-6 stroke-[2.5]" />
                <span className="font-black text-xs">PDF Resmi (Kop Surat)</span>
                <span className={`text-[10px] ${formatType === 'pdf' ? 'text-white/80' : 'text-neutral-500'}`}>
                  Siap cetak &amp; tanda tangan
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormatType('excel')}
                className={`p-3 border-2 border-black flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                  formatType === 'excel'
                    ? 'bg-[#00F59B] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                    : 'bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0_0_#000]'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 stroke-[2.5]" />
                <span className="font-black text-xs">Excel (.xlsx)</span>
                <span className={`text-[10px] ${formatType === 'excel' ? 'text-black/80' : 'text-neutral-500'}`}>
                  Multi-sheet &amp; bisa diedit
                </span>
              </button>
            </div>
          </div>

          {/* Periode Selection */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1.5">
              2. Pilih Periode Laporan *
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {[
                { id: '2026-09', title: 'Bulan Ini (Sep 2026)' },
                { id: '3-bulan', title: '3 Bulan Terakhir (Q3)' },
                { id: '2026', title: 'Tahun 2026 Penuh' },
                { id: 'all', title: 'Semua Riwayat Data' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPeriode(p.id as any)}
                  className={`p-2 border-2 border-black text-left transition-all cursor-pointer ${
                    periode === p.id
                      ? 'bg-[#00E5FF] text-black shadow-[2px_2px_0_0_#000] font-black'
                      : 'bg-white text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{p.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Ringkasan */}
          <div className="neo-box-sm p-3.5 bg-neutral-50 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-600 block">
              Ringkasan Data yang Akan Diekspor ({periodeLabel})
            </span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white border border-black p-2">
                <span className="text-[10px] font-bold text-neutral-600 block">Pemasukan</span>
                <span className="font-black text-xs text-[#00a86b]">{formatRupiah(totalIn)}</span>
              </div>
              <div className="bg-white border border-black p-2">
                <span className="text-[10px] font-bold text-neutral-600 block">Pengeluaran</span>
                <span className="font-black text-xs text-[#d11a2a]">{formatRupiah(totalOut)}</span>
              </div>
              <div className="bg-white border border-black p-2">
                <span className="text-[10px] font-bold text-neutral-600 block">Saldo Bersih</span>
                <span className="font-black text-xs text-black">{formatRupiah(saldo)}</span>
              </div>
            </div>
            <div className="text-[11px] font-bold text-neutral-600 text-center">
              Total {filteredTrx.length} item transaksi tercakup
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 border-t-3 border-black p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="neo-btn bg-white px-4 py-2 text-xs font-bold cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className={`neo-btn px-5 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer ${
              formatType === 'pdf' ? 'bg-[#FF4B4B] text-white' : 'bg-[#00F59B] text-black'
            }`}
          >
            {exportSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Berhasil Diunduh!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Memproses File...' : `Download ${formatType.toUpperCase()}`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
