import React, { useState } from 'react';
import { TagihanIuran, Warga, ProfilRT } from '../types';
import { formatRupiah, formatBulanTahun, generateWhatsAppLink } from '../utils/formatters';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone,
  Sparkles
} from 'lucide-react';

interface NotifikasiTagihanModalProps {
  isOpen: boolean;
  onClose: () => void;
  tagihanList: TagihanIuran[];
  wargaList: Warga[];
  profilRT: ProfilRT;
  selectedBulan: string;
}

export const NotifikasiTagihanModal: React.FC<NotifikasiTagihanModalProps> = ({
  isOpen,
  onClose,
  tagihanList,
  wargaList,
  profilRT,
  selectedBulan,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSimulatingBlast, setIsSimulatingBlast] = useState(false);
  const [sentTagihanIds, setSentTagihanIds] = useState<Set<string>>(new Set());
  const [progressCount, setProgressCount] = useState(0);

  if (!isOpen) return null;

  const wargaMap = new Map(wargaList.map((w) => [w.id, w]));

  // Filter tagihan for selected month that are BELUM_BAYAR or MENUNGGAK
  const unpaidTagihan = tagihanList.filter(
    (t) =>
      t.bulan === selectedBulan &&
      (t.status === 'BELUM_BAYAR' || t.status === 'MENUNGGAK')
  );

  const buildNotificationText = (tag: TagihanIuran, warga?: Warga): string => {
    const namaWarga = warga?.nama || 'Warga RT 05';
    const blok = warga?.blokRumah || '';
    const bulanStr = formatBulanTahun(tag.bulan);

    return `Yth. ${namaWarga} (${blok})

Salam hormat dari Pengurus ${profilRT.namaRT} ${profilRT.lingkungan}.

Mengingatkan tagihan *Iuran Kas RT Periode ${bulanStr}* sebesar *${formatRupiah(tag.nominal)}* saat ini belum tercatat lunas.

*Rincian Tagihan:*
• Iuran Wajib: ${formatRupiah(tag.rincian.wajib)}
• Iuran Kebersihan: ${formatRupiah(tag.rincian.kebersihan)}
• Iuran Keamanan: ${formatRupiah(tag.rincian.keamanan)}

*Rekening Pembayaran Resmi:*
🏦 *${profilRT.bankPenerima.namaBank}*
No. Rekening: *${profilRT.bankPenerima.nomorRekening}*
A.n: *${profilRT.bankPenerima.atasNama}*

Atau tunai langsung ke Bendahara (${profilRT.namaBendahara}).
Setelah transfer, mohon konfirmasi atau kirimkan bukti transfer.

Terima kasih banyak atas partisipasi aktif Bapak/Ibu dalam menjaga kenyamanan dan keamanan lingkungan kita bersama. 🙏`;
  };

  const handleCopy = (tag: TagihanIuran, warga?: Warga) => {
    const text = buildNotificationText(tag, warga);
    navigator.clipboard.writeText(text);
    setCopiedId(tag.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateBlast = () => {
    setIsSimulatingBlast(true);
    setProgressCount(0);
    const newSent = new Set(sentTagihanIds);

    unpaidTagihan.forEach((tag, idx) => {
      setTimeout(() => {
        newSent.add(tag.id);
        setSentTagihanIds(new Set(newSent));
        setProgressCount(idx + 1);

        if (idx === unpaidTagihan.length - 1) {
          setIsSimulatingBlast(false);
        }
      }, (idx + 1) * 600);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="neo-box max-w-2xl w-full max-h-[90vh] flex flex-col bg-[#FFFDF7] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#FFE600] border-b-3 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-[#FFE600]">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-black leading-tight">
                Notifikasi Tagihan Otomatis Bulanan
              </h2>
              <p className="text-xs font-bold text-neutral-800">
                Periode: {formatBulanTahun(selectedBulan)} • Siap dikirim ke WhatsApp warga
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white border-2 border-black hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Status Alert Banner */}
          <div className="bg-[#00E5FF] border-2 border-black p-3 shadow-[2px_2px_0_0_#000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 stroke-[2.5] text-black" />
              <div>
                <span className="font-black text-sm text-black block">
                  {unpaidTagihan.length} Warga Belum Melunasi Iuran
                </span>
                <span className="text-xs text-neutral-800 font-bold">
                  Sistem otomatis menyiapkan draf pesan WhatsApp resmi siap kirim
                </span>
              </div>
            </div>

            {unpaidTagihan.length > 0 && (
              <button
                disabled={isSimulatingBlast}
                onClick={handleSimulateBlast}
                className="neo-btn bg-[#FF4B4B] text-white px-3 py-1.5 text-xs font-black flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isSimulatingBlast
                    ? `Mengirim (${progressCount}/${unpaidTagihan.length})...`
                    : 'Kirim Notifikasi Otomatis ke Semua'}
                </span>
              </button>
            )}
          </div>

          {/* Progress bar if blasting */}
          {isSimulatingBlast && (
            <div className="w-full bg-neutral-200 border-2 border-black h-4 overflow-hidden">
              <div
                style={{ width: `${(progressCount / unpaidTagihan.length) * 100}%` }}
                className="bg-[#00F59B] h-full transition-all duration-300"
              />
            </div>
          )}

          {/* List of Unpaid Warga */}
          <div className="space-y-3">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-black">
              Daftar Tagihan &amp; Tindakan Notifikasi
            </h3>

            {unpaidTagihan.length === 0 ? (
              <div className="neo-box p-6 text-center bg-[#00F59B]/20 border-2 border-black">
                <CheckCircle2 className="w-10 h-10 text-green-700 mx-auto mb-2 stroke-[2.5]" />
                <h4 className="font-display font-black text-lg text-black">
                  Luar Biasa! Semua Warga Sudah Lunas
                </h4>
                <p className="text-xs font-bold text-neutral-700 mt-1">
                  Tidak ada tunggakan iuran untuk periode {formatBulanTahun(selectedBulan)}.
                </p>
              </div>
            ) : (
              unpaidTagihan.map((tag) => {
                const warga = wargaMap.get(tag.wargaId);
                const isSent = sentTagihanIds.has(tag.id);
                const waUrl = warga
                  ? generateWhatsAppLink(warga.noHp, buildNotificationText(tag, warga))
                  : '#';

                return (
                  <div
                    key={tag.id}
                    className={`neo-box-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isSent ? 'bg-green-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={warga?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={warga?.nama}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 border-2 border-black object-cover rounded-none"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm text-black">
                            {warga?.nama || 'Warga'}
                          </span>
                          <span className="bg-[#FFE600] text-black text-[10px] font-black px-1.5 border border-black">
                            {warga?.blokRumah}
                          </span>
                          <span className="bg-[#FF4B4B] text-white text-[10px] font-black px-1.5 border border-black uppercase">
                            {tag.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-neutral-600 flex items-center gap-2 mt-0.5">
                          <Smartphone className="w-3 h-3" />
                          <span>{warga?.noHp || '-'}</span>
                          <span>•</span>
                          <span className="text-black font-extrabold">
                            Tagihan: {formatRupiah(tag.nominal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(tag, warga)}
                        title="Salin Teks WhatsApp"
                        className="neo-btn bg-white px-2.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === tag.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-700 font-black">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          const n = new Set(sentTagihanIds);
                          n.add(tag.id);
                          setSentTagihanIds(n);
                        }}
                        className="neo-btn bg-[#00F59B] text-black px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer no-underline"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 border-t-3 border-black p-3.5 flex items-center justify-between text-xs font-bold text-neutral-700">
          <span>* Pengiriman langsung membuka obrolan WhatsApp dengan nomor warga</span>
          <button
            onClick={onClose}
            className="neo-btn bg-black text-white px-4 py-1.5 text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
