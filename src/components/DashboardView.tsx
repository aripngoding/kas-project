import React from 'react';
import { Transaksi, TagihanIuran, Warga, ProfilRT } from '../types';
import { formatRupiah, formatTanggalIndo, formatBulanTahun, generateWhatsAppLink } from '../utils/formatters';
import { InteractiveChart } from './InteractiveChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  FileText, 
  BellRing,
  Send,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  profilRT: ProfilRT;
  transaksiList: Transaksi[];
  tagihanList: TagihanIuran[];
  wargaList: Warga[];
  onOpenCatatTrx: (tipe: 'PEMASUKAN' | 'PENGELUARAN') => void;
  onOpenNotifikasi: () => void;
  onOpenExport: () => void;
  onOpenTambahWarga: () => void;
  onSelectTab: (tab: 'transaksi' | 'iuran' | 'warga') => void;
  onViewTrxDetail: (trx: Transaksi) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profilRT,
  transaksiList,
  tagihanList,
  wargaList,
  onOpenCatatTrx,
  onOpenNotifikasi,
  onOpenExport,
  onOpenTambahWarga,
  onSelectTab,
  onViewTrxDetail,
}) => {
  // Compute Real-time metrics
  const totalPemasukanAll = transaksiList
    .filter((t) => t.tipe === 'PEMASUKAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPengeluaranAll = transaksiList
    .filter((t) => t.tipe === 'PENGELUARAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoKas = totalPemasukanAll - totalPengeluaranAll;

  // Current month (Sep 2026)
  const currentMonthKey = '2026-09';
  const trxThisMonth = transaksiList.filter((t) => t.tanggal.startsWith(currentMonthKey));
  const inThisMonth = trxThisMonth
    .filter((t) => t.tipe === 'PEMASUKAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const outThisMonth = trxThisMonth
    .filter((t) => t.tipe === 'PENGELUARAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  // Billing status this month
  const tagihanThisMonth = tagihanList.filter((t) => t.bulan === currentMonthKey);
  const totalKK = wargaList.length;
  const lunasCount = tagihanThisMonth.filter((t) => t.status === 'LUNAS').length;
  const belumBayarCount = tagihanThisMonth.filter(
    (t) => t.status === 'BELUM_BAYAR' || t.status === 'MENUNGGAK'
  ).length;
  const verifCount = tagihanThisMonth.filter((t) => t.status === 'MENUNGGU_VERIFIKASI').length;
  const complianceRate = totalKK > 0 ? Math.round((lunasCount / totalKK) * 100) : 0;

  // Unpaid citizens for quick action
  const wargaMap = new Map(wargaList.map((w) => [w.id, w]));
  const unpaidItems = tagihanThisMonth.filter(
    (t) => t.status === 'BELUM_BAYAR' || t.status === 'MENUNGGAK'
  );

  // Recent 5 transactions
  const recentTransactions = [...transaksiList]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-[#FFE600] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0_0_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-black text-[#FFE600] text-[10px] font-black px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
            Dashboard Utama
          </span>
          <h2 className="font-display font-black text-xl sm:text-2xl text-black">
            Selamat Datang di Portal Kas {profilRT.namaRT}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-800">
            Transparansi keuangan lingkungan, pencatatan iuran otomatis, dan akuntabilitas warga.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
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

          <button
            onClick={onOpenNotifikasi}
            className="neo-btn bg-[#00E5FF] text-black px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <BellRing className="w-4 h-4 stroke-[2.5]" />
            <span>Kirim Notifikasi WA</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Real-Time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Kas */}
        <div className="neo-box p-4 bg-white border-3 border-black">
          <div className="flex items-center justify-between text-neutral-700 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black">
              Total Saldo Kas RT
            </span>
            <div className="p-1.5 bg-[#FFE600] border-2 border-black">
              <Wallet className="w-4 h-4 stroke-[2.5] text-black" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-black">
            {formatRupiah(saldoKas)}
          </div>
          <div className="mt-2 text-[11px] font-bold text-neutral-600 flex items-center justify-between border-t border-neutral-200 pt-1.5">
            <span>Rek: {profilRT.bankPenerima.namaBank}</span>
            <span className="text-black font-extrabold">{profilRT.bankPenerima.nomorRekening}</span>
          </div>
        </div>

        {/* Card 2: Pemasukan Bulan Ini */}
        <div className="neo-box p-4 bg-white border-3 border-black">
          <div className="flex items-center justify-between text-neutral-700 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black">
              Pemasukan (Sep 2026)
            </span>
            <div className="p-1.5 bg-[#00F59B] border-2 border-black">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5] text-black" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-[#008f51]">
            {formatRupiah(inThisMonth)}
          </div>
          <div className="mt-2 text-[11px] font-bold text-neutral-600 flex items-center justify-between border-t border-neutral-200 pt-1.5">
            <span>Total Transaksi Masuk</span>
            <span className="text-black font-extrabold">
              {trxThisMonth.filter((t) => t.tipe === 'PEMASUKAN').length} transaksi
            </span>
          </div>
        </div>

        {/* Card 3: Pengeluaran Bulan Ini */}
        <div className="neo-box p-4 bg-white border-3 border-black">
          <div className="flex items-center justify-between text-neutral-700 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black">
              Pengeluaran (Sep 2026)
            </span>
            <div className="p-1.5 bg-[#FF4B4B] border-2 border-black">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5] text-white" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-[#d11a2a]">
            {formatRupiah(outThisMonth)}
          </div>
          <div className="mt-2 text-[11px] font-bold text-neutral-600 flex items-center justify-between border-t border-neutral-200 pt-1.5">
            <span>Satpam, Sampah, Lampu</span>
            <span className="text-black font-extrabold">
              {trxThisMonth.filter((t) => t.tipe === 'PENGELUARAN').length} pos biaya
            </span>
          </div>
        </div>

        {/* Card 4: Kepatuhan Iuran */}
        <div className="neo-box p-4 bg-white border-3 border-black">
          <div className="flex items-center justify-between text-neutral-700 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black">
              Kepatuhan Iuran (Sep 2026)
            </span>
            <div className="p-1.5 bg-[#00E5FF] border-2 border-black">
              <Users className="w-4 h-4 stroke-[2.5] text-black" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="font-display font-black text-2xl text-black">
              {complianceRate}%
            </div>
            <span className="text-xs font-bold text-neutral-600">
              ({lunasCount}/{totalKK} KK Lunas)
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-neutral-200 border border-black h-2.5 overflow-hidden">
            <div
              style={{ width: `${complianceRate}%` }}
              className="bg-[#00F59B] h-full"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Interactive Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InteractiveChart transaksiList={transaksiList} />
        </div>
        <div className="lg:col-span-1">
          <CategoryBreakdown transaksiList={transaksiList} bulanFilter={currentMonthKey} />
        </div>
      </div>

      {/* Row 3: Action Needed (Unpaid Dues Alert) & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Dues Box */}
        <div className="neo-box p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#FF4B4B] text-white border-2 border-black">
                <AlertCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-base sm:text-lg text-black">
                Tunggakan Iuran Bulan Ini ({unpaidItems.length} KK)
              </h3>
            </div>
            <button
              onClick={onOpenNotifikasi}
              className="neo-btn bg-[#FFE600] px-2.5 py-1 text-[11px] font-black flex items-center gap-1 cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Kirim Tagihan</span>
            </button>
          </div>

          <p className="text-xs text-neutral-700 font-bold mb-3">
            Warga berikut belum menyelesaikan iuran periode {formatBulanTahun(currentMonthKey)}. Kirim pesan pengingat WhatsApp sekali klik:
          </p>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72 pr-1">
            {unpaidItems.length === 0 ? (
              <div className="text-center py-8 text-neutral-600 font-bold text-sm">
                🎉 Luar biasa! Seluruh warga telah melunasi iuran bulan ini.
              </div>
            ) : (
              unpaidItems.map((tag) => {
                const warga = wargaMap.get(tag.wargaId);
                const waUrl = warga
                  ? generateWhatsAppLink(
                      warga.noHp,
                      `Halo ${warga.nama}, mengingatkan tagihan Iuran Kas ${profilRT.namaRT} bulan ${formatBulanTahun(tag.bulan)} sebesar ${formatRupiah(tag.nominal)} belum tercatat. Mohon transfer ke ${profilRT.bankPenerima.namaBank} ${profilRT.bankPenerima.nomorRekening}. Terima kasih!`
                    )
                  : '#';

                return (
                  <div
                    key={tag.id}
                    className="p-2.5 bg-neutral-50 border-2 border-black flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={warga?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={warga?.nama}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 border border-black object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-black truncate">
                            {warga?.nama}
                          </span>
                          <span className="bg-[#FFE600] text-black text-[10px] font-black px-1 border border-black shrink-0">
                            {warga?.blokRumah}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-600 font-bold block">
                          Tagihan: {formatRupiah(tag.nominal)}
                        </span>
                      </div>
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn bg-[#00F59B] text-black px-2.5 py-1 text-[11px] font-black flex items-center gap-1 shrink-0 no-underline cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Ingatkan WA</span>
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Transactions Box */}
        <div className="neo-box p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00E5FF] text-black border-2 border-black">
                <FileText className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-base sm:text-lg text-black">
                Transaksi Kas Terbaru
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('transaksi')}
              className="text-xs font-black hover:underline flex items-center gap-0.5 text-black cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72 pr-1">
            {recentTransactions.map((trx) => (
              <div
                key={trx.id}
                onClick={() => onViewTrxDetail(trx)}
                className="p-2.5 bg-white border-2 border-black hover:bg-neutral-50 transition-colors cursor-pointer flex items-center justify-between gap-2 shadow-[2px_2px_0_0_#000]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 border border-black ${
                        trx.tipe === 'PEMASUKAN'
                          ? 'bg-[#00F59B] text-black'
                          : 'bg-[#FF4B4B] text-white'
                      }`}
                    >
                      {trx.tipe === 'PEMASUKAN' ? 'MASUK' : 'KELUAR'}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-500">
                      {formatTanggalIndo(trx.tanggal)}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-black truncate">
                    {trx.deskripsi}
                  </h4>
                  <span className="text-[10px] text-neutral-600 font-bold block">
                    Kategori: {trx.kategori}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-display font-black text-sm ${
                      trx.tipe === 'PEMASUKAN' ? 'text-[#008f51]' : 'text-[#d11a2a]'
                    }`}
                  >
                    {trx.tipe === 'PEMASUKAN' ? '+' : '-'} {formatRupiah(trx.nominal)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-bold block">
                    {trx.nomorKuitansi}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
