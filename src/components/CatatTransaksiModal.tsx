import React, { useState } from 'react';
import { Transaksi, TipeTransaksi, KategoriTransaksi } from '../types';
import { generateKuitansi } from '../utils/formatters';
import { X, PlusCircle, Upload, Check } from 'lucide-react';

interface CatatTransaksiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaksi: Transaksi) => void;
  defaultTipe?: TipeTransaksi;
}

const KATEGORI_PEMASUKAN_LIST = [
  'Iuran Wajib Bulanan',
  'Iuran Keamanan',
  'Iuran Kebersihan',
  'Sumbangan Warga / Donasi',
  'Dana Sosial',
  'Penyewaan Fasilitas RT',
  'Lain-lain',
];

const KATEGORI_PENGELUARAN_LIST = [
  'Gaji Petugas Keamanan / Satpam',
  'Petugas Angkut Sampah',
  'Pemeliharaan Fasilitas & Taman',
  'Penerangan Jalan & Listrik Pos Ronda',
  'Kerja Bakti & Konsumsi Warga',
  'Bantuan Sosial / Santunan Warga',
  'Kegiatan Warga (17 Agustus / PHBI)',
  'Pengadaan Alat Kebersihan & RT',
  'Operasional Sekretariat RT',
  'Lain-lain',
];

export const CatatTransaksiModal: React.FC<CatatTransaksiModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultTipe = 'PENGELUARAN',
}) => {
  const [tipe, setTipe] = useState<TipeTransaksi>(defaultTipe);
  const [kategori, setKategori] = useState<KategoriTransaksi>(
    defaultTipe === 'PEMASUKAN' ? KATEGORI_PEMASUKAN_LIST[0] : KATEGORI_PENGELUARAN_LIST[0]
  );
  const [nominal, setNominal] = useState<number>(100000);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [penanggungJawab, setPenanggungJawab] = useState<string>('Ibu Sri Wahyuni (Bendahara)');
  const [nomorKuitansi, setNomorKuitansi] = useState<string>(() => generateKuitansi(defaultTipe));
  const [buktiFotoUrl, setBuktiFotoUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleTipeChange = (newTipe: TipeTransaksi) => {
    setTipe(newTipe);
    setKategori(newTipe === 'PEMASUKAN' ? KATEGORI_PEMASUKAN_LIST[0] : KATEGORI_PENGELUARAN_LIST[0]);
    setNomorKuitansi(generateKuitansi(newTipe));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || nominal <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari 0');
      return;
    }
    if (!deskripsi.trim()) {
      setErrorMsg('Keterangan / uraian transaksi wajib diisi');
      return;
    }

    const newTrx: Transaksi = {
      id: `trx-${Date.now()}`,
      tipe,
      kategori,
      nominal: Number(nominal),
      tanggal,
      deskripsi: deskripsi.trim(),
      penanggungJawab: penanggungJawab.trim() || 'Bendahara RT',
      nomorKuitansi: nomorKuitansi.trim() || generateKuitansi(tipe),
      buktiFotoUrl: buktiFotoUrl || undefined,
    };

    onSave(newTrx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="neo-box max-w-lg w-full bg-[#FFFDF7] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div
          className={`border-b-3 border-black p-4 flex items-center justify-between ${
            tipe === 'PEMASUKAN' ? 'bg-[#00F59B]' : 'bg-[#FF4B4B] text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            <h2 className="font-display font-black text-lg sm:text-xl">
              Catat {tipe === 'PEMASUKAN' ? 'Pemasukan Kas (Kas Masuk)' : 'Pengeluaran Kas (Kas Keluar)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white text-black border-2 border-black hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="bg-[#FFE600] border-2 border-black p-2.5 text-xs font-black text-black">
              {errorMsg}
            </div>
          )}

          {/* Toggle Tipe */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTipeChange('PEMASUKAN')}
              className={`p-2 text-xs font-black border-2 border-black transition-all cursor-pointer ${
                tipe === 'PEMASUKAN'
                  ? 'bg-[#00F59B] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              + PEMASUKAN
            </button>
            <button
              type="button"
              onClick={() => handleTipeChange('PENGELUARAN')}
              className={`p-2 text-xs font-black border-2 border-black transition-all cursor-pointer ${
                tipe === 'PENGELUARAN'
                  ? 'bg-[#FF4B4B] text-white shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              - PENGELUARAN
            </button>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Nominal Transaksi (Rp) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-black text-neutral-600">Rp</span>
              <input
                type="number"
                required
                min={1000}
                step={1000}
                value={nominal || ''}
                onChange={(e) => setNominal(Number(e.target.value))}
                placeholder="100000"
                className="w-full bg-white border-2 border-black pl-11 pr-3 py-2 text-base font-black text-black shadow-[2px_2px_0_0_#000] focus:outline-hidden focus:bg-[#FFE600]/10"
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setNominal(amt)}
                  className="px-2 py-0.5 text-[11px] font-black bg-white border border-black hover:bg-[#FFE600] cursor-pointer"
                >
                  +{amt.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Kategori Transaksi *
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full bg-white border-2 border-black px-3 py-2 text-xs sm:text-sm font-bold text-black shadow-[2px_2px_0_0_#000] focus:outline-hidden"
            >
              {tipe === 'PEMASUKAN'
                ? KATEGORI_PEMASUKAN_LIST.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))
                : KATEGORI_PENGELUARAN_LIST.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
            </select>
          </div>

          {/* Tanggal & No Kuitansi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0_0_#000]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                No. Kuitansi / Bukti
              </label>
              <input
                type="text"
                value={nomorKuitansi}
                onChange={(e) => setNomorKuitansi(e.target.value)}
                className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0_0_#000]"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Uraian / Keterangan Transaksi *
            </label>
            <textarea
              required
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Contoh: Honor satpam bulan September, beli kabel lampu penerangan jalan..."
              className="w-full bg-white border-2 border-black p-2.5 text-xs sm:text-sm font-bold text-black shadow-[2px_2px_0_0_#000] focus:outline-hidden"
            />
          </div>

          {/* Penanggung Jawab */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Penanggung Jawab / Saksi
            </label>
            <input
              type="text"
              value={penanggungJawab}
              onChange={(e) => setPenanggungJawab(e.target.value)}
              placeholder="Nama bendahara atau seksi terkait"
              className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0_0_#000]"
            />
          </div>

          {/* Upload Foto Struk / Nota Bukti */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Foto Nota / Kuitansi / Bukti Pembayaran (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <label className="neo-btn bg-white px-3 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Pilih Foto Nota / Struk</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {buktiFotoUrl && (
                <div className="relative border-2 border-black w-12 h-12 bg-neutral-100">
                  <img
                    src={buktiFotoUrl}
                    alt="Bukti Struk"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 border-t-2 border-black flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn bg-white text-black px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`neo-btn px-5 py-2 text-xs font-black cursor-pointer ${
                tipe === 'PEMASUKAN'
                  ? 'bg-[#00F59B] text-black'
                  : 'bg-[#FF4B4B] text-white'
              }`}
            >
              Simpan Transaksi Kas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
