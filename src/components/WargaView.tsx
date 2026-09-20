import React, { useState, useMemo } from 'react';
import { Warga, TagihanIuran, StatusKependudukan, ProfilRT } from '../types';
import { formatRupiah, formatTanggalIndo, generateWhatsAppLink } from '../utils/formatters';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Home, 
  Edit3, 
  Trash2, 
  History, 
  X, 
  CheckCircle, 
  AlertCircle,
  Mail,
  UserCheck
} from 'lucide-react';

interface WargaViewProps {
  wargaList: Warga[];
  tagihanList: TagihanIuran[];
  profilRT: ProfilRT;
  onOpenTambahWarga: () => void;
  onEditWarga: (warga: Warga) => void;
  onDeleteWarga: (wargaId: string) => void;
  isModeWarga: boolean;
}

export const WargaView: React.FC<WargaViewProps> = ({
  wargaList,
  tagihanList,
  profilRT,
  onOpenTambahWarga,
  onEditWarga,
  onDeleteWarga,
  isModeWarga,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlok, setFilterBlok] = useState('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [selectedWargaHistory, setSelectedWargaHistory] = useState<Warga | null>(null);

  // Extract blocks (e.g., Blok A, Blok B, Blok C)
  const blockOptions = useMemo(() => {
    const set = new Set<string>();
    wargaList.forEach((w) => {
      const match = w.blokRumah.match(/Blok\s*([A-Z0-9]+)/i);
      if (match) {
        set.add(`Blok ${match[1].toUpperCase()}`);
      }
    });
    return Array.from(set).sort();
  }, [wargaList]);

  // Filtered residents
  const filteredWarga = useMemo(() => {
    return wargaList.filter((w) => {
      // Status
      if (filterStatus !== 'SEMUA' && w.statusKependudukan !== filterStatus) return false;

      // Blok
      if (filterBlok !== 'SEMUA' && !w.blokRumah.toLowerCase().includes(filterBlok.toLowerCase())) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = w.nama.toLowerCase().includes(q);
        const matchBlok = w.blokRumah.toLowerCase().includes(q);
        const matchHp = w.noHp.includes(q);
        if (!matchNama && !matchBlok && !matchHp) return false;
      }

      return true;
    });
  }, [wargaList, filterStatus, filterBlok, searchQuery]);

  // Aggregate metrics
  const totalWarga = wargaList.length;
  const totalJiwa = wargaList.reduce((acc, curr) => acc + (curr.jumlahAnggotaKeluarga || 1), 0);
  const totalTetap = wargaList.filter((w) => w.statusKependudukan === 'Warga Tetap').length;
  const totalKontrak = wargaList.filter((w) => w.statusKependudukan === 'Warga Kontrak / Kos').length;

  // Dues for selected resident
  const residentDues = selectedWargaHistory
    ? tagihanList.filter((t) => t.wargaId === selectedWargaHistory.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#FF90E8] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0_0_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-black text-[#FF90E8] text-[10px] font-black px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
            Direktori Lingkungan
          </span>
          <h2 className="font-display font-black text-xl sm:text-2xl text-black">
            Manajemen Data &amp; Profil Foto Warga
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-800">
            Database profil warga RT berbasis foto, kontak WhatsApp, dan riwayat iuran keluarga.
          </p>
        </div>

        {!isModeWarga && (
          <button
            onClick={onOpenTambahWarga}
            className="neo-btn bg-[#FFE600] text-black px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Tambah Data Warga</span>
          </button>
        )}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="neo-box p-3 sm:p-4 bg-white">
          <span className="text-[10px] font-black uppercase text-neutral-600 block">
            Total Kepala Keluarga
          </span>
          <div className="font-display font-black text-xl sm:text-2xl text-black mt-1">
            {totalWarga} KK
          </div>
          <span className="text-[11px] font-bold text-neutral-500 block mt-1">
            Terdaftar di {profilRT.namaRT}
          </span>
        </div>

        <div className="neo-box p-3 sm:p-4 bg-white">
          <span className="text-[10px] font-black uppercase text-neutral-600 block">
            Populasi Lingkungan
          </span>
          <div className="font-display font-black text-xl sm:text-2xl text-[#008f51] mt-1">
            {totalJiwa} Jiwa
          </div>
          <span className="text-[11px] font-bold text-neutral-500 block mt-1">
            Rerata {(totalJiwa / (totalWarga || 1)).toFixed(1)} jiwa / KK
          </span>
        </div>

        <div className="neo-box p-3 sm:p-4 bg-white">
          <span className="text-[10px] font-black uppercase text-neutral-600 block">
            Warga Tetap
          </span>
          <div className="font-display font-black text-xl sm:text-2xl text-black mt-1">
            {totalTetap} KK
          </div>
          <span className="text-[11px] font-bold text-neutral-500 block mt-1">
            Kepemilikan Rumah Pribadi
          </span>
        </div>

        <div className="neo-box p-3 sm:p-4 bg-white">
          <span className="text-[10px] font-black uppercase text-neutral-600 block">
            Warga Kontrak / Kos
          </span>
          <div className="font-display font-black text-xl sm:text-2xl text-[#0080ff] mt-1">
            {totalKontrak} KK
          </div>
          <span className="text-[11px] font-bold text-neutral-500 block mt-1">
            Penyewa / Kontrak aktif
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="neo-box p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, blok rumah, HP..."
              className="w-full bg-white border-2 border-black pl-9 pr-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0_0_#000] focus:outline-hidden"
            />
          </div>

          {/* Filter Blok */}
          <div>
            <select
              value={filterBlok}
              onChange={(e) => setFilterBlok(e.target.value)}
              className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0_0_#000]"
            >
              <option value="SEMUA">Semua Blok Perumahan</option>
              {blockOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Kependudukan */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0_0_#000]"
            >
              <option value="SEMUA">Semua Status Kependudukan</option>
              <option value="Warga Tetap">Warga Tetap</option>
              <option value="Warga Kontrak / Kos">Warga Kontrak / Kos</option>
            </select>
          </div>
        </div>

        <div className="pt-1 text-xs font-bold text-neutral-600 flex items-center justify-between">
          <span>Menampilkan {filteredWarga.length} data warga</span>
          <span className="text-black font-black">* Klik profil untuk melihat riwayat pembayaran iuran</span>
        </div>
      </div>

      {/* Citizen Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWarga.length === 0 ? (
          <div className="col-span-full neo-box p-10 text-center text-neutral-600 font-bold bg-white">
            Tidak ada warga yang sesuai dengan kata kunci pencarian.
          </div>
        ) : (
          filteredWarga.map((warga) => {
            const currentTag = tagihanList.find(
              (t) => t.wargaId === warga.id && t.bulan === '2026-09'
            );
            const isLunasThisMonth = currentTag?.status === 'LUNAS';
            const waUrl = generateWhatsAppLink(
              warga.noHp,
              `Halo Bpk/Ibu ${warga.nama}, salam dari Pengurus ${profilRT.namaRT}.`
            );

            return (
              <div
                key={warga.id}
                className="neo-box p-4 bg-white flex flex-col justify-between hover:-translate-y-0.5 transition-all"
              >
                <div>
                  {/* Top Photo & Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative shrink-0">
                      <img
                        src={warga.fotoUrl}
                        alt={warga.nama}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 border-3 border-black object-cover rounded-none bg-neutral-100 shadow-[2px_2px_0_0_#000]"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-[#FFE600] text-black border border-black text-[9px] font-black px-1">
                        {warga.jumlahAnggotaKeluarga} Jiwa
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-black text-base text-black truncate">
                        {warga.nama}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="bg-[#00E5FF] text-black text-[10px] font-black px-1.5 border border-black">
                          {warga.blokRumah}
                        </span>
                        <span
                          className={`text-[9px] font-black px-1 border border-black uppercase ${
                            warga.statusKependudukan === 'Warga Tetap'
                              ? 'bg-neutral-100 text-black'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {warga.statusKependudukan === 'Warga Tetap' ? 'TETAP' : 'KONTRAK'}
                        </span>
                      </div>

                      {/* Dues Status Sep 2026 */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-neutral-600">
                          Iuran Sep 2026:
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 border border-black uppercase ${
                            isLunasThisMonth
                              ? 'bg-[#00F59B] text-black'
                              : 'bg-[#FF4B4B] text-white'
                          }`}
                        >
                          {isLunasThisMonth ? 'LUNAS' : 'BELUM BAYAR'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="bg-neutral-50 border-2 border-black p-2.5 space-y-1 text-xs font-bold text-neutral-700 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 text-[11px]">WhatsApp:</span>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-black font-extrabold flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3 text-green-600" />
                        <span>{warga.noHp}</span>
                      </a>
                    </div>
                    {warga.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-[11px]">Email:</span>
                        <span className="text-neutral-800 text-[11px] truncate max-w-[160px]">
                          {warga.email}
                        </span>
                      </div>
                    )}
                    {warga.catatan && (
                      <p className="text-[11px] text-neutral-600 italic pt-1 border-t border-neutral-200">
                        {warga.catatan}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions footer */}
                <div className="pt-2 border-t-2 border-black flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setSelectedWargaHistory(warga)}
                    className="neo-btn bg-white px-2.5 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-blue-600" />
                    <span>Riwayat Iuran</span>
                  </button>

                  {!isModeWarga && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditWarga(warga)}
                        title="Edit Profil"
                        className="p-1.5 bg-white border border-black hover:bg-neutral-100 shadow-[1px_1px_0_0_#000] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-black" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus data warga ${warga.nama}?`)) {
                            onDeleteWarga(warga.id);
                          }
                        }}
                        title="Hapus Warga"
                        className="p-1.5 bg-white border border-black hover:bg-red-50 text-red-600 shadow-[1px_1px_0_0_#000] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Riwayat Iuran Pribadi Warga */}
      {selectedWargaHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="neo-box max-w-lg w-full bg-[#FFFDF7] p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="border-b-3 border-black pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedWargaHistory.fotoUrl}
                  alt={selectedWargaHistory.nama}
                  className="w-10 h-10 border-2 border-black object-cover"
                />
                <div>
                  <h3 className="font-display font-black text-base text-black">
                    {selectedWargaHistory.nama}
                  </h3>
                  <span className="text-xs font-bold text-neutral-600">
                    {selectedWargaHistory.blokRumah} • Riwayat Pembayaran Iuran
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedWargaHistory(null)}
                className="p-1 bg-white border-2 border-black hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {residentDues.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 font-bold text-xs">
                  Belum ada catatan tagihan untuk warga ini.
                </div>
              ) : (
                residentDues.map((tag) => (
                  <div
                    key={tag.id}
                    className="p-3 bg-white border-2 border-black flex items-center justify-between gap-2 shadow-[2px_2px_0_0_#000]"
                  >
                    <div>
                      <div className="font-black text-xs text-black">
                        Bulan {tag.bulan}
                      </div>
                      <span className="text-[11px] text-neutral-600 font-bold block">
                        Nominal: {formatRupiah(tag.nominal)}
                      </span>
                      {tag.tanggalBayar && (
                        <span className="text-[10px] text-green-700 font-extrabold block">
                          Dibayar: {formatTanggalIndo(tag.tanggalBayar)} ({tag.metodeBayar})
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 border border-black uppercase ${
                        tag.status === 'LUNAS'
                          ? 'bg-[#00F59B] text-black'
                          : 'bg-[#FF4B4B] text-white'
                      }`}
                    >
                      {tag.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t-2 border-black flex justify-end">
              <button
                onClick={() => setSelectedWargaHistory(null)}
                className="neo-btn bg-black text-white px-4 py-1.5 text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
