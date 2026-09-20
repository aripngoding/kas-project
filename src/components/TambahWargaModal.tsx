import React, { useState } from 'react';
import { Warga, StatusKependudukan } from '../types';
import { X, UserPlus, Upload, Check } from 'lucide-react';

interface TambahWargaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warga: Warga) => void;
  editingWarga?: Warga | null;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
];

export const TambahWargaModal: React.FC<TambahWargaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingWarga,
}) => {
  const [nama, setNama] = useState(editingWarga?.nama || '');
  const [blokRumah, setBlokRumah] = useState(editingWarga?.blokRumah || '');
  const [noHp, setNoHp] = useState(editingWarga?.noHp || '');
  const [email, setEmail] = useState(editingWarga?.email || '');
  const [statusKependudukan, setStatusKependudukan] = useState<StatusKependudukan>(
    editingWarga?.statusKependudukan || 'Warga Tetap'
  );
  const [fotoUrl, setFotoUrl] = useState(
    editingWarga?.fotoUrl || PRESET_AVATARS[0]
  );
  const [jumlahAnggotaKeluarga, setJumlahAnggotaKeluarga] = useState(
    editingWarga?.jumlahAnggotaKeluarga || 3
  );
  const [catatan, setCatatan] = useState(editingWarga?.catatan || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setErrorMsg('Nama warga wajib diisi');
      return;
    }
    if (!blokRumah.trim()) {
      setErrorMsg('Nomor Blok / Rumah wajib diisi');
      return;
    }
    if (!noHp.trim()) {
      setErrorMsg('Nomor WhatsApp wajib diisi');
      return;
    }

    const wargaData: Warga = {
      id: editingWarga ? editingWarga.id : `w-${Date.now()}`,
      nama: nama.trim(),
      blokRumah: blokRumah.trim(),
      noHp: noHp.trim(),
      email: email.trim() || undefined,
      statusKependudukan,
      fotoUrl,
      jumlahAnggotaKeluarga: Number(jumlahAnggotaKeluarga) || 1,
      tanggalBergabung: editingWarga?.tanggalBergabung || new Date().toISOString().split('T')[0],
      catatan: catatan.trim() || undefined,
    };

    onSave(wargaData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="neo-box max-w-lg w-full bg-[#FFFDF7] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#FF90E8] border-b-3 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 stroke-[2.5]" />
            <h2 className="font-display font-black text-lg sm:text-xl text-black">
              {editingWarga ? 'Edit Profil Warga' : 'Tambah Data Warga Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white border-2 border-black hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="bg-[#FFE600] border-2 border-black p-2 text-xs font-black">
              {errorMsg}
            </div>
          )}

          {/* Foto Profil Selector */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1.5">
              Foto Profil Warga *
            </label>
            <div className="flex items-center gap-3 mb-2.5">
              <img
                src={fotoUrl}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-16 h-16 border-3 border-black object-cover bg-white"
              />
              <div>
                <label className="neo-btn bg-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto Custom</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] font-bold text-neutral-600 block mt-1">
                  Atau pilih avatar siap pakai di bawah ini:
                </span>
              </div>
            </div>

            {/* Avatar presets */}
            <div className="flex flex-wrap gap-2">
              {PRESET_AVATARS.map((avUrl, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setFotoUrl(avUrl)}
                  className={`relative border-2 border-black w-10 h-10 overflow-hidden cursor-pointer ${
                    fotoUrl === avUrl ? 'ring-3 ring-[#FFE600] shadow-[2px_2px_0_0_#000]' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={avUrl} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                  {fotoUrl === avUrl && (
                    <div className="absolute inset-0 bg-[#FFE600]/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-black stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Nama Lengkap (Kepala Keluarga / Warga) *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Bpk. Bambang Wijaya"
              className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0_0_#000]"
            />
          </div>

          {/* Blok & No Rumah + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Blok &amp; No. Rumah *
              </label>
              <input
                type="text"
                required
                value={blokRumah}
                onChange={(e) => setBlokRumah(e.target.value)}
                placeholder="Contoh: Blok B2 No. 04"
                className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0_0_#000]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Status Kependudukan *
              </label>
              <select
                value={statusKependudukan}
                onChange={(e) => setStatusKependudukan(e.target.value as StatusKependudukan)}
                className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0_0_#000]"
              >
                <option value="Warga Tetap">Warga Tetap</option>
                <option value="Warga Kontrak / Kos">Warga Kontrak / Kos</option>
              </select>
            </div>
          </div>

          {/* No WhatsApp & Anggota Keluarga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                No. WhatsApp / HP *
              </label>
              <input
                type="text"
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0_0_#000]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Jumlah Jiwa / Anggota Keluarga
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={jumlahAnggotaKeluarga}
                onChange={(e) => setJumlahAnggotaKeluarga(Number(e.target.value))}
                className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0_0_#000]"
              />
            </div>
          </div>

          {/* Email (Opsional) */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Email (Opsional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="warga@email.com"
              className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0_0_#000]"
            />
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Catatan / Keterangan Warga
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Koordinator Pos Kamling, pemilik warung, dll."
              className="w-full bg-white border-2 border-black p-2.5 text-xs sm:text-sm font-bold text-black shadow-[2px_2px_0_0_#000]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 border-t-2 border-black flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn bg-white px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="neo-btn bg-[#FF90E8] text-black px-5 py-2 text-xs font-black cursor-pointer"
            >
              {editingWarga ? 'Simpan Perubahan' : 'Tambahkan ke Data Warga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
