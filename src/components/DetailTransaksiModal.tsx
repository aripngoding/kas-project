import React from 'react';
import { Transaksi } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { X, Receipt, CheckCircle, ArrowUpRight, ArrowDownRight, User, Calendar, Tag } from 'lucide-react';

interface DetailTransaksiModalProps {
  transaksi: Transaksi | null;
  onClose: () => void;
}

export const DetailTransaksiModal: React.FC<DetailTransaksiModalProps> = ({
  transaksi,
  onClose,
}) => {
  if (!transaksi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="neo-box max-w-md w-full bg-[#FFFDF7] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div
          className={`border-b-3 border-black p-4 flex items-center justify-between ${
            transaksi.tipe === 'PEMASUKAN' ? 'bg-[#00F59B]' : 'bg-[#FF4B4B] text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 stroke-[2.5]" />
            <h3 className="font-display font-black text-lg">
              Bukti Transaksi Kas RT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-white text-black border-2 border-black hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Top Receipt Slip Banner */}
          <div className="border-2 border-dashed border-black p-3.5 bg-white text-center">
            <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">
              Nomor Kuitansi Resmi
            </span>
            <div className="font-mono font-black text-base text-black mt-0.5">
              {transaksi.nomorKuitansi}
            </div>
            <div className="mt-2 pt-2 border-t border-neutral-200">
              <span className="text-xs font-bold text-neutral-600 block">
                Total Nominal Transaksi
              </span>
              <div
                className={`font-display font-black text-2xl mt-0.5 ${
                  transaksi.tipe === 'PEMASUKAN' ? 'text-[#008f51]' : 'text-[#d11a2a]'
                }`}
              >
                {transaksi.tipe === 'PEMASUKAN' ? '+' : '-'} {formatRupiah(transaksi.nominal)}
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2.5 text-xs font-bold">
            <div className="flex items-start justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Jenis Kas:
              </span>
              <span
                className={`px-2 py-0.5 border border-black text-[11px] font-black ${
                  transaksi.tipe === 'PEMASUKAN'
                    ? 'bg-[#00F59B] text-black'
                    : 'bg-[#FF4B4B] text-white'
                }`}
              >
                {transaksi.tipe === 'PEMASUKAN' ? 'Kas Masuk' : 'Kas Keluar'}
              </span>
            </div>

            <div className="flex items-start justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500">Kategori:</span>
              <span className="text-black font-black text-right max-w-[200px]">
                {transaksi.kategori}
              </span>
            </div>

            <div className="flex items-start justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Tanggal Transaksi:
              </span>
              <span className="text-black font-black">
                {formatTanggalIndo(transaksi.tanggal)}
              </span>
            </div>

            <div className="flex items-start justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Penanggung Jawab:
              </span>
              <span className="text-black font-black">
                {transaksi.penanggungJawab}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 block mb-1">Uraian / Keterangan:</span>
              <div className="p-2.5 bg-neutral-50 border-2 border-black text-black">
                {transaksi.deskripsi}
              </div>
            </div>

            {/* Photo receipt proof */}
            {transaksi.buktiFotoUrl && (
              <div>
                <span className="text-neutral-500 block mb-1">
                  Foto Nota / Struk Fisik:
                </span>
                <div className="border-2 border-black overflow-hidden bg-neutral-100">
                  <img
                    src={transaksi.buktiFotoUrl}
                    alt="Nota Bukti"
                    className="w-full h-auto max-h-60 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-100 border-t-3 border-black p-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="neo-btn bg-black text-white px-5 py-1.5 text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
