import React, { useState } from 'react';
import { Warga, TagihanIuran, ProfilRT } from '../types';
import { formatRupiah, formatBulanTahun } from '../utils/formatters';
import { Search, CheckCircle2, AlertCircle, Upload, Check, Building } from 'lucide-react';

interface PortalWargaBarProps {
  wargaList: Warga[];
  tagihanList: TagihanIuran[];
  profilRT: ProfilRT;
  onUploadBuktiTransfer: (tagihanId: string, buktiUrl: string) => void;
}

export const PortalWargaBar: React.FC<PortalWargaBarProps> = ({
  wargaList,
  tagihanList,
  profilRT,
  onUploadBuktiTransfer,
}) => {
  const [selectedWargaId, setSelectedWargaId] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const selectedWarga = wargaList.find((w) => w.id === selectedWargaId);
  const currentMonth = '2026-09';
  const tagihanWarga = selectedWarga
    ? tagihanList.find((t) => t.wargaId === selectedWarga.id && t.bulan === currentMonth)
    : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && tagihanWarga) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadBuktiTransfer(tagihanWarga.id, reader.result as string);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-[#FFE600] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0_0_#000] mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b-2 border-black">
        <div>
          <span className="bg-black text-[#FFE600] text-[10px] font-black px-2 py-0.5 uppercase tracking-wider inline-block mb-1">
            Portal Mandiri Warga RT
          </span>
          <h3 className="font-display font-black text-lg sm:text-xl text-black">
            Cek Status Iuran &amp; Konfirmasi Pembayaran Anda
          </h3>
        </div>

        <div className="text-xs font-bold text-neutral-800">
          Rekening RT: <span className="font-black">{profilRT.bankPenerima.namaBank} {profilRT.bankPenerima.nomorRekening}</span> a.n {profilRT.bankPenerima.atasNama}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        {/* Warga Selector */}
        <div>
          <label className="block text-xs font-black uppercase text-black mb-1">
            Pilih Nama Warga / Blok Rumah Anda:
          </label>
          <select
            value={selectedWargaId}
            onChange={(e) => setSelectedWargaId(e.target.value)}
            className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-black text-black shadow-[2px_2px_0_0_#000]"
          >
            <option value="">-- Pilih Nama Anda --</option>
            {wargaList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nama} - {w.blokRumah}
              </option>
            ))}
          </select>
        </div>

        {/* Status display */}
        {selectedWarga && tagihanWarga ? (
          <div className="md:col-span-2 bg-white border-2 border-black p-3 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0_0_#000]">
            <div className="flex items-center gap-3">
              <img
                src={selectedWarga.fotoUrl}
                alt={selectedWarga.nama}
                className="w-11 h-11 border-2 border-black object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-black">{selectedWarga.nama}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.2 border border-black uppercase ${
                      tagihanWarga.status === 'LUNAS'
                        ? 'bg-[#00F59B] text-black'
                        : 'bg-[#FF4B4B] text-white'
                    }`}
                  >
                    {tagihanWarga.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs font-bold text-neutral-600">
                  Tagihan {formatBulanTahun(tagihanWarga.bulan)}:{' '}
                  <span className="text-black font-black">
                    {formatRupiah(tagihanWarga.nominal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Upload transfer receipt if not lunas */}
            {tagihanWarga.status !== 'LUNAS' && (
              <div>
                <label className="neo-btn bg-[#00E5FF] text-black px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadSuccess ? 'Bukti Terkirim!' : 'Upload Bukti Transfer'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        ) : (
          <div className="md:col-span-2 text-xs font-bold text-neutral-700 bg-white/60 p-3 border-2 border-black">
            👈 Silakan pilih nama Anda pada menu dropdown untuk memeriksa tagihan bulanan dan mengunggah bukti transfer tanpa perlu login rumit.
          </div>
        )}
      </div>
    </div>
  );
};
