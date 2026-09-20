import React, { useState, useMemo } from 'react';
import { Transaksi, TipeTransaksi } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  FileDown, 
  Trash2, 
  Eye, 
  Calendar,
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface TransaksiViewProps {
  transaksiList: Transaksi[];
  onOpenCatatTrx: (tipe: 'PEMASUKAN' | 'PENGELUARAN') => void;
  onOpenExport: () => void;
  onDeleteTrx: (id: string) => void;
  onViewDetail: (trx: Transaksi) => void;
  isModeWarga: boolean;
}

export const TransaksiView: React.FC<TransaksiViewProps> = ({
  transaksiList,
  onOpenCatatTrx,
  onOpenExport,
  onDeleteTrx,
  onViewDetail,
  isModeWarga,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipe, setFilterTipe] = useState<'SEMUA' | TipeTransaksi>('SEMUA');
  const [filterKategori, setFilterKategori] = useState('SEMUA');
  const [filterBulan, setFilterBulan] = useState('SEMUA');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transaksiList.forEach((t) => set.add(t.kategori));
    return Array.from(set).sort();
  }, [transaksiList]);

  // Extract unique months
  const months = useMemo(() => {
    const set = new Set<string>();
    transaksiList.forEach((t) => {
      if (t.tanggal) {
        set.add(t.tanggal.substring(0, 7)); // "2026-09"
      }
    });
    return Array.from(set).sort().reverse();
  }, [transaksiList]);

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transaksiList.filter((trx) => {
      // Type
      if (filterTipe !== 'SEMUA' && trx.tipe !== filterTipe) return false;

      // Category
      if (filterKategori !== 'SEMUA' && trx.kategori !== filterKategori) return false;

      // Month
      if (filterBulan !== 'SEMUA' && !trx.tanggal.startsWith(filterBulan)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = trx.deskripsi.toLowerCase().includes(q);
        const matchKuitansi = trx.nomorKuitansi.toLowerCase().includes(q);
        const matchPJ = trx.penanggungJawab.toLowerCase().includes(q);
        const matchCat = trx.kategori.toLowerCase().includes(q);
        if (!matchDesc && !matchKuitansi && !matchPJ && !matchCat) return false;
      }

      return true;
    });
  }, [transaksiList, filterTipe, filterKategori, filterBulan, searchQuery]);

  // Computations on filtered list
  const totalIn = filteredList
    .filter((t) => t.tipe === 'PEMASUKAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalOut = filteredList
    .filter((t) => t.tipe === 'PENGELUARAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const netBalance = totalIn - totalOut;

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-[#00E5FF] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0_0_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-black text-[#00E5FF] text-[10px] font-black px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
            Buku Kas Transparan
          </span>
          <h2 className="font-display font-black text-xl sm:text-2xl text-black">
            Riwayat Lengkap Transaksi Kas RT
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-800">
            Pencatatan real-time seluruh arus kas masuk &amp; keluar untuk pertanggungjawaban warga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isModeWarga && (
            <>
              <button
                onClick={() => onOpenCatatTrx('PEMASUKAN')}
                className="neo-btn bg-[#00F59B] text-black px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>+ Pemasukan</span>
              </button>
              <button
                onClick={() => onOpenCatatTrx('PENGELUARAN')}
                className="neo-btn bg-[#FF4B4B] text-white px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>- Pengeluaran</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenExport}
            className="neo-btn bg-[#FFE600] text-black px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4 stroke-[2.5]" />
            <span>Export PDF / Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="neo-box p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari uraian, kuitansi, nama..."
              className="w-full bg-white border-2 border-black pl-9 pr-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0_0_#000] focus:outline-hidden"
            />
          </div>

          {/* Type Filter */}
          <div className="flex border-2 border-black bg-neutral-100 p-0.5">
            {(['SEMUA', 'PEMASUKAN', 'PENGELUARAN'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTipe(t)}
                className={`flex-1 py-1.5 text-[11px] font-black transition-all cursor-pointer ${
                  filterTipe === t
                    ? t === 'PEMASUKAN'
                      ? 'bg-[#00F59B] text-black'
                      : t === 'PENGELUARAN'
                      ? 'bg-[#FF4B4B] text-white'
                      : 'bg-black text-white'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                {t === 'SEMUA' ? 'Semua' : t === 'PEMASUKAN' ? 'Masuk' : 'Keluar'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0_0_#000]"
            >
              <option value="SEMUA">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0_0_#000]"
            >
              <option value="SEMUA">Semua Periode</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  Bulan {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Metrics */}
        <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-neutral-600">
            <span>Ditemukan:</span>
            <span className="bg-black text-white px-2 py-0.2 font-black">
              {filteredList.length} transaksi
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-black">
            <span className="text-[#008f51] flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Masuk: {formatRupiah(totalIn)}
            </span>
            <span className="text-[#d11a2a] flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Keluar: {formatRupiah(totalOut)}
            </span>
            <span className="text-black bg-[#FFE600] px-2 py-0.5 border border-black">
              Net Kas: {formatRupiah(netBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table / Card List */}
      <div className="neo-box overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-900 text-white text-[11px] font-black uppercase tracking-wider border-b-3 border-black">
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Tanggal &amp; Kuitansi</th>
                <th className="p-3">Uraian / Keterangan</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Penanggung Jawab</th>
                <th className="p-3 text-right">Nominal</th>
                <th className="p-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-bold text-neutral-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500 font-bold">
                    Tidak ada transaksi yang cocok dengan kriteria pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((trx, idx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-amber-50/60 transition-colors"
                  >
                    <td className="p-3 text-center font-black text-neutral-600">
                      {idx + 1}
                    </td>

                    <td className="p-3">
                      <div className="font-extrabold text-black">
                        {formatTanggalIndo(trx.tanggal)}
                      </div>
                      <div className="text-[10px] text-neutral-600 font-mono">
                        {trx.nomorKuitansi}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-black text-sm text-black">
                        {trx.deskripsi}
                      </div>
                      {trx.buktiFotoUrl && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 border border-amber-400 px-1.5 py-0.2 mt-0.5">
                          ✓ Ada Bukti Nota/Struk
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className="bg-neutral-100 border border-black px-2 py-0.5 text-[11px] font-extrabold text-black inline-block">
                        {trx.kategori}
                      </span>
                    </td>

                    <td className="p-3 text-neutral-700">
                      {trx.penanggungJawab}
                    </td>

                    <td className="p-3 text-right">
                      <span
                        className={`font-display font-black text-sm ${
                          trx.tipe === 'PEMASUKAN'
                            ? 'text-[#008f51]'
                            : 'text-[#d11a2a]'
                        }`}
                      >
                        {trx.tipe === 'PEMASUKAN' ? '+' : '-'} {formatRupiah(trx.nominal)}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewDetail(trx)}
                          title="Lihat Detail Transaksi"
                          className="p-1.5 bg-white border border-black hover:bg-neutral-100 shadow-[1px_1px_0_0_#000] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-black" />
                        </button>

                        {!isModeWarga && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus transaksi "${trx.deskripsi}"?`)) {
                                onDeleteTrx(trx.id);
                              }
                            }}
                            title="Hapus Transaksi"
                            className="p-1.5 bg-white border border-black hover:bg-red-50 text-red-600 shadow-[1px_1px_0_0_#000] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
