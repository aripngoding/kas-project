import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TagihanIuran, Warga, ProfilRT, StatusIuran } from '../types';
import { formatRupiah, formatBulanTahun, generateWhatsAppLink } from '../utils/formatters';
import { 
  BellRing, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  Calendar,
  Smartphone,
  Check,
  Eye,
  Filter,
  CreditCard
} from 'lucide-react';

interface IuranTagihanViewProps {
  profilRT: ProfilRT;
  tagihanList: TagihanIuran[];
  wargaList: Warga[];
  onUpdateTagihanStatus: (
    tagihanId: string,
    status: StatusIuran,
    metodeBayar?: 'Transfer Bank' | 'Tunai ke Bendahara' | 'QRIS RT',
    catatan?: string
  ) => void;
  onGenerateMonthlyBills: (bulan: string) => void;
  onOpenNotifikasi: () => void;
  isModeWarga: boolean;
}

export const IuranTagihanView: React.FC<IuranTagihanViewProps> = ({
  profilRT,
  tagihanList,
  wargaList,
  onUpdateTagihanStatus,
  onGenerateMonthlyBills,
  onOpenNotifikasi,
  isModeWarga,
}) => {
  const [selectedBulan, setSelectedBulan] = useState<string>('2026-09');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [verifikasiModalTag, setVerifikasiModalTag] = useState<TagihanIuran | null>(null);
  const [selectedMetode, setSelectedMetode] = useState<'Transfer Bank' | 'Tunai ke Bendahara' | 'QRIS RT'>('Transfer Bank');

  const wargaMap = new Map(wargaList.map((w) => [w.id, w]));

  // Tagihan for selected month
  const currentMonthTags = tagihanList.filter((t) => t.bulan === selectedBulan);

  // Status counts
  const totalTags = currentMonthTags.length;
  const lunasTags = currentMonthTags.filter((t) => t.status === 'LUNAS');
  const belumBayarTags = currentMonthTags.filter((t) => t.status === 'BELUM_BAYAR');
  const menunggakTags = currentMonthTags.filter((t) => t.status === 'MENUNGGAK');
  const verifTags = currentMonthTags.filter((t) => t.status === 'MENUNGGU_VERIFIKASI');

  const totalNominalTagihan = currentMonthTags.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalTerkumpul = lunasTags.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalTunggakan = currentMonthTags
    .filter((t) => t.status !== 'LUNAS')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const persentaseLunas = totalTags > 0 ? Math.round((lunasTags.length / totalTags) * 100) : 0;

  // Filtered
  const filteredTags = currentMonthTags.filter((t) => {
    if (filterStatus !== 'SEMUA' && t.status !== filterStatus) return false;
    return true;
  });

  const handleConfirmLunas = (tag: TagihanIuran) => {
    onUpdateTagihanStatus(
      tag.id,
      'LUNAS',
      selectedMetode,
      `Diverifikasi oleh ${profilRT.namaBendahara}`
    );
    setVerifikasiModalTag(null);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-[#00F59B] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0_0_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-black text-[#00F59B] text-[10px] font-black px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
            Manajemen Iuran &amp; Penagihan
          </span>
          <h2 className="font-display font-black text-xl sm:text-2xl text-black">
            Pencatatan Iuran &amp; Notifikasi Bulanan
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-800">
            Sistem otomatisasi penagihan dan notifikasi tagihan warga via WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-white border-2 border-black p-1 shadow-[2px_2px_0_0_#000]">
            <Calendar className="w-4 h-4 ml-1 text-black" />
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="bg-transparent text-xs font-black text-black pr-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-07">Juli 2026</option>
            </select>
          </div>

          {!isModeWarga && (
            <button
              onClick={() => onGenerateMonthlyBills(selectedBulan)}
              title="Generate Otomatis Tagihan untuk Semua Warga Terdaftar"
              className="neo-btn bg-white text-black px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Generate Tagihan Bulan Ini</span>
            </button>
          )}

          <button
            onClick={onOpenNotifikasi}
            className="neo-btn bg-[#FFE600] text-black px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <BellRing className="w-4 h-4 stroke-[2.5]" />
            <span>Kirim Notifikasi WA ({belumBayarTags.length + menunggakTags.length})</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for Billing */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="neo-box p-3 sm:p-4 bg-white">
          <span className="text-[10px] font-black uppercase text-neutral-600 block">
            Target Tagihan {formatBulanTahun(selectedBulan)}
          </span>
          <div className="font-display font-black text-lg sm:text-xl text-black mt-1">
            {formatRupiah(totalNominalTagihan)}
          </div>
          <span className="text-[11px] font-bold text-neutral-500 block mt-1">
            Total {totalTags} Kartu Keluarga
          </span>
        </div>

        <div className="neo-box p-3 sm:p-4 bg-white">
          <span className="text-[10px] font-black uppercase text-neutral-600 block">
            Terkumpul (Lunas)
          </span>
          <div className="font-display font-black text-lg sm:text-xl text-[#008f51] mt-1">
            {formatRupiah(totalTerkumpul)}
          </div>
          <span className="text-[11px] font-extrabold text-[#008f51] block mt-1">
            {lunasTags.length} KK ({persentaseLunas}%)
          </span>
        </div>

        <div className="neo-box p-3 sm:p-4 bg-white">
          <span className="text-[10px] font-black uppercase text-neutral-600 block">
            Sisa Tunggakan
          </span>
          <div className="font-display font-black text-lg sm:text-xl text-[#d11a2a] mt-1">
            {formatRupiah(totalTunggakan)}
          </div>
          <span className="text-[11px] font-extrabold text-[#d11a2a] block mt-1">
            {belumBayarTags.length + menunggakTags.length} KK Belum Bayar
          </span>
        </div>

        <div className="neo-box p-3 sm:p-4 bg-white">
          <span className="text-[10px] font-black uppercase text-neutral-600 block">
            Perlu Verifikasi Bukti
          </span>
          <div className="font-display font-black text-lg sm:text-xl text-[#0080ff] mt-1">
            {verifTags.length} Warga
          </div>
          <span className="text-[11px] font-bold text-neutral-600 block mt-1">
            Bukti transfer diunggah
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="neo-box p-3 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          {[
            { id: 'SEMUA', label: `Semua (${currentMonthTags.length})` },
            { id: 'LUNAS', label: `Lunas (${lunasTags.length})`, color: 'bg-[#00F59B]' },
            { id: 'BELUM_BAYAR', label: `Belum Bayar (${belumBayarTags.length})`, color: 'bg-[#FFE600]' },
            { id: 'MENUNGGAK', label: `Menunggak (${menunggakTags.length})`, color: 'bg-[#FF4B4B] text-white' },
            { id: 'MENUNGGU_VERIFIKASI', label: `Perlu Verifikasi (${verifTags.length})`, color: 'bg-[#00E5FF]' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 border-2 border-black transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? `${tab.color || 'bg-black text-white'} shadow-[2px_2px_0_0_#000] font-black -translate-y-0.5`
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-black text-neutral-700">
          Tarif Standar: Rp 100.000 / KK / Bulan (Wajib 50k, Kebersihan 25k, Keamanan 25k)
        </div>
      </div>

      {/* Dues List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.length === 0 ? (
          <div className="col-span-full neo-box p-10 text-center text-neutral-600 font-bold bg-white">
            Tidak ada data tagihan untuk filter yang dipilih pada periode ini.
          </div>
        ) : (
          filteredTags.map((tag) => {
            const warga = wargaMap.get(tag.wargaId);
            const isLunas = tag.status === 'LUNAS';
            const isMenunggak = tag.status === 'MENUNGGAK';
            const isVerif = tag.status === 'MENUNGGU_VERIFIKASI';

            const waMsg = `Halo ${warga?.nama || 'Bapak/Ibu'}, mengingatkan Iuran RT ${profilRT.namaRT} bulan ${formatBulanTahun(tag.bulan)} sebesar ${formatRupiah(tag.nominal)} belum tercatat lunas. Mohon transfer ke ${profilRT.bankPenerima.namaBank} ${profilRT.bankPenerima.nomorRekening}. Terima kasih!`;
            const waUrl = warga ? generateWhatsAppLink(warga.noHp, waMsg) : '#';

            return (
              <div
                key={tag.id}
                className="neo-box p-4 bg-white flex flex-col justify-between transition-all hover:-translate-y-0.5"
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={warga?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={warga?.nama}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 border-2 border-black object-cover rounded-none"
                      />
                      <div>
                        <h4 className="font-display font-black text-sm text-black leading-tight">
                          {warga?.nama || 'Warga'}
                        </h4>
                        <span className="inline-block bg-[#FFE600] text-black text-[10px] font-black px-1.5 border border-black mt-0.5">
                          {warga?.blokRumah}
                        </span>
                        <div className="text-[11px] font-bold text-neutral-500 mt-0.5">
                          {warga?.statusKependudukan}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase ${
                        isLunas
                          ? 'bg-[#00F59B] text-black'
                          : isMenunggak
                          ? 'bg-[#FF4B4B] text-white'
                          : isVerif
                          ? 'bg-[#00E5FF] text-black'
                          : 'bg-[#FFE600] text-black'
                      }`}
                    >
                      {tag.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Nominal & Breakdown */}
                  <div className="bg-neutral-50 border-2 border-black p-2.5 mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                      <span>Total Tagihan:</span>
                      <span className="text-black font-black text-sm">
                        {formatRupiah(tag.nominal)}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-200 grid grid-cols-3 gap-1 text-center">
                      <div>Wajib: 50k</div>
                      <div>Bersih: 25k</div>
                      <div>Aman: 25k</div>
                    </div>
                  </div>

                  {/* Payment details if paid or notes */}
                  {isLunas && (
                    <div className="text-[11px] bg-green-50 border border-green-300 p-2 text-green-900 font-bold mb-3">
                      ✓ Lunas tgl: {tag.tanggalBayar || '-'} ({tag.metodeBayar || 'Kas RT'})
                      {tag.catatan && <div className="text-[10px] text-neutral-600 mt-0.5">{tag.catatan}</div>}
                    </div>
                  )}

                  {isVerif && tag.buktiTransferUrl && (
                    <div className="text-[11px] bg-cyan-50 border border-cyan-300 p-2 text-cyan-900 font-bold mb-3 flex items-center justify-between">
                      <span>Warga unggah bukti transfer</span>
                      <a
                        href={tag.buktiTransferUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-black text-cyan-800"
                      >
                        Lihat Struk
                      </a>
                    </div>
                  )}

                  {tag.catatan && !isLunas && (
                    <p className="text-[11px] font-bold text-neutral-600 italic mb-3">
                      Catatan: {tag.catatan}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t-2 border-black flex items-center justify-between gap-2">
                  {!isLunas ? (
                    <>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neo-btn bg-[#FFE600] text-black px-2.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer no-underline"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </a>

                      {!isModeWarga && (
                        <button
                          onClick={() => setVerifikasiModalTag(tag)}
                          className="neo-btn bg-[#00F59B] text-black px-3 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Tandai Lunas</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs text-neutral-600 font-bold">
                      <span className="flex items-center gap-1 text-[#008f51] font-black">
                        <CheckCircle className="w-4 h-4" />
                        Tercatat di Kas
                      </span>
                      {!isModeWarga && (
                        <button
                          onClick={() => {
                            if (confirm('Ubah status kembali menjadi Belum Bayar?')) {
                              onUpdateTagihanStatus(tag.id, 'BELUM_BAYAR');
                            }
                          }}
                          className="hover:underline text-[10px] text-neutral-500 cursor-pointer"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Verifikasi / Tandai Lunas */}
      {verifikasiModalTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="neo-box max-w-md w-full bg-[#FFFDF7] p-5 space-y-4">
            <div className="border-b-2 border-black pb-2 flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-black">
                Konfirmasi Pembayaran Iuran
              </h3>
              <button
                onClick={() => setVerifikasiModalTag(null)}
                className="text-black font-black hover:underline cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-neutral-700">
                Warga:{' '}
                <span className="font-black text-black">
                  {wargaMap.get(verifikasiModalTag.wargaId)?.nama}
                </span>{' '}
                ({wargaMap.get(verifikasiModalTag.wargaId)?.blokRumah})
              </p>
              <p className="text-xs font-bold text-neutral-700 mt-1">
                Nominal Iuran:{' '}
                <span className="font-black text-black">
                  {formatRupiah(verifikasiModalTag.nominal)}
                </span>{' '}
                ({formatBulanTahun(verifikasiModalTag.bulan)})
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Metode Pembayaran *
              </label>
              <select
                value={selectedMetode}
                onChange={(e) => setSelectedMetode(e.target.value as any)}
                className="w-full bg-white border-2 border-black p-2 text-xs font-bold shadow-[2px_2px_0_0_#000]"
              >
                <option value="Transfer Bank">Transfer Bank ({profilRT.bankPenerima.namaBank})</option>
                <option value="Tunai ke Bendahara">Tunai Langsung ke Bendahara RT</option>
                <option value="QRIS RT">QRIS Standar RT</option>
              </select>
            </div>

            <div className="text-[11px] font-bold text-neutral-600 bg-amber-50 p-2.5 border border-amber-300">
              💡 Sistem akan menandai iuran lunas dan otomatis mencatat transaksi Kas Masuk (Pemasukan) sebesar {formatRupiah(verifikasiModalTag.nominal)}.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-black">
              <button
                onClick={() => setVerifikasiModalTag(null)}
                className="neo-btn bg-white px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirmLunas(verifikasiModalTag)}
                className="neo-btn bg-[#00F59B] text-black px-4 py-1.5 text-xs font-black cursor-pointer"
              >
                Konfirmasi Lunas &amp; Masuk Kas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
