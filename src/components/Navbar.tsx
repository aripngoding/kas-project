import React from 'react';
import { 
  Building2, 
  Wallet, 
  Users, 
  Receipt, 
  BellRing, 
  FileDown, 
  Eye, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { ProfilRT } from '../types';
import { formatRupiah } from '../utils/formatters';

interface NavbarProps {
  profilRT: ProfilRT;
  saldoKas: number;
  activeTab: 'dashboard' | 'transaksi' | 'iuran' | 'warga';
  setActiveTab: (tab: 'dashboard' | 'transaksi' | 'iuran' | 'warga') => void;
  isModeWarga: boolean;
  setIsModeWarga: (val: boolean) => void;
  onOpenExportModal: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profilRT,
  saldoKas,
  activeTab,
  setActiveTab,
  isModeWarga,
  setIsModeWarga,
  onOpenExportModal,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7] border-b-4 border-black shadow-[0_4px_0_0_#000]">
      {/* Top Banner Notice */}
      <div className="bg-[#FFE600] border-b-2 border-black px-4 py-1.5 text-xs font-bold flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-black text-[#FFE600] px-2 py-0.5 text-[11px] font-black tracking-wider uppercase">
            Sistem Transparansi
          </span>
          <span className="truncate">
            {profilRT.namaRT} • {profilRT.lingkungan}, {profilRT.kelurahan}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModeWarga(!isModeWarga)}
            id="toggle-mode-warga-btn"
            className={`px-2.5 py-0.5 text-[11px] font-extrabold border-2 border-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isModeWarga
                ? 'bg-[#00E5FF] text-black shadow-[2px_2px_0_0_#000]'
                : 'bg-white text-black shadow-[2px_2px_0_0_#000]'
            }`}
          >
            {isModeWarga ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Mode: Warga (Transparansi Publik)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mode: Pengurus / Bendahara</span>
              </>
            )}
          </button>

          <button
            onClick={onResetData}
            title="Muat Ulang Data Bawaan / Demo"
            className="hover:underline flex items-center gap-1 text-[11px] text-neutral-800 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-11 h-11 bg-[#00F59B] border-3 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center font-black text-xl">
            <Building2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-xl sm:text-2xl leading-none tracking-tight">
                KAS RT <span className="bg-[#FFE600] px-1.5 py-0.5 border-2 border-black text-sm">ONLINE</span>
              </h1>
            </div>
            <p className="text-xs font-bold text-neutral-700 leading-tight">
              Portal Keuangan Warga Transparan & Akuntabel
            </p>
          </div>
        </div>

        {/* Saldo Badge Neo-Brutalism */}
        <div className="flex items-center gap-2">
          <div className="bg-[#00E5FF] border-3 border-black px-3.5 py-1.5 shadow-[3px_3px_0_0_#000] flex items-center gap-2">
            <div className="p-1 bg-black text-[#00E5FF]">
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-black leading-none">
                Saldo Kas RT Aktif
              </div>
              <div className="font-display font-extrabold text-base sm:text-lg leading-tight text-black">
                {formatRupiah(saldoKas)}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenExportModal}
            id="export-nav-button"
            className="hidden sm:flex items-center gap-1.5 bg-[#FF4B4B] text-white px-3 py-2 text-xs font-black border-2 border-black shadow-[3px_3px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000] active:translate-x-0 active:translate-y-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4 stroke-[2.5]" />
            <span>EXPORT LAPORAN</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-2 pb-2.5 pt-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          id="tab-dashboard"
          className={`px-4 py-2 text-xs sm:text-sm font-black border-2 border-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'bg-[#FFE600] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5'
              : 'bg-white text-neutral-800 hover:bg-neutral-100 shadow-[2px_2px_0_0_#000]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>RINGKASAN &amp; GRAFIK</span>
        </button>

        <button
          onClick={() => setActiveTab('iuran')}
          id="tab-iuran"
          className={`px-4 py-2 text-xs sm:text-sm font-black border-2 border-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'iuran'
              ? 'bg-[#00F59B] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5'
              : 'bg-white text-neutral-800 hover:bg-neutral-100 shadow-[2px_2px_0_0_#000]'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>IURAN &amp; NOTIFIKASI BULANAN</span>
        </button>

        <button
          onClick={() => setActiveTab('transaksi')}
          id="tab-transaksi"
          className={`px-4 py-2 text-xs sm:text-sm font-black border-2 border-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'transaksi'
              ? 'bg-[#00E5FF] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5'
              : 'bg-white text-neutral-800 hover:bg-neutral-100 shadow-[2px_2px_0_0_#000]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>RIWAYAT TRANSAKSI KAS</span>
        </button>

        <button
          onClick={() => setActiveTab('warga')}
          id="tab-warga"
          className={`px-4 py-2 text-xs sm:text-sm font-black border-2 border-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'warga'
              ? 'bg-[#FF90E8] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5'
              : 'bg-white text-neutral-800 hover:bg-neutral-100 shadow-[2px_2px_0_0_#000]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>DATA WARGA BERFOTO</span>
        </button>
      </div>
    </header>
  );
};
