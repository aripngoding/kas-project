import React, { useState, useEffect } from 'react';
import { 
  Warga, 
  TagihanIuran, 
  Transaksi, 
  ProfilRT, 
  StatusIuran, 
  TipeTransaksi 
} from './types';
import { 
  loadWarga, 
  saveWarga, 
  loadTagihan, 
  saveTagihan, 
  loadTransaksi, 
  saveTransaksi, 
  loadProfilRT, 
  saveProfilRT, 
  resetAllData 
} from './utils/storage';
import { generateKuitansi, formatBulanTahun, formatRupiah } from './utils/formatters';
import { initialWarga, initialTagihan, initialTransaksi, initialProfilRT } from './data/initialData';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransaksiView } from './components/TransaksiView';
import { IuranTagihanView } from './components/IuranTagihanView';
import { WargaView } from './components/WargaView';
import { PortalWargaBar } from './components/PortalWargaBar';
import { CatatTransaksiModal } from './components/CatatTransaksiModal';
import { TambahWargaModal } from './components/TambahWargaModal';
import { NotifikasiTagihanModal } from './components/NotifikasiTagihanModal';
import { LaporanExportModal } from './components/LaporanExportModal';
import { DetailTransaksiModal } from './components/DetailTransaksiModal';

export default function App() {
  const [wargaList, setWargaList] = useState<Warga[]>(() => loadWarga());
  const [tagihanList, setTagihanList] = useState<TagihanIuran[]>(() => loadTagihan());
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(() => loadTransaksi());
  const [profilRT, setProfilRT] = useState<ProfilRT>(() => loadProfilRT());

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transaksi' | 'iuran' | 'warga'>('dashboard');
  const [isModeWarga, setIsModeWarga] = useState<boolean>(false);

  // Modals state
  const [isCatatTrxOpen, setIsCatatTrxOpen] = useState(false);
  const [catatTrxTipe, setCatatTrxTipe] = useState<TipeTransaksi>('PENGELUARAN');
  const [isNotifikasiOpen, setIsNotifikasiOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTambahWargaOpen, setIsTambahWargaOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState<Warga | null>(null);
  const [detailTrx, setDetailTrx] = useState<Transaksi | null>(null);

  // Save on state change
  useEffect(() => {
    saveWarga(wargaList);
  }, [wargaList]);

  useEffect(() => {
    saveTagihan(tagihanList);
  }, [tagihanList]);

  useEffect(() => {
    saveTransaksi(transaksiList);
  }, [transaksiList]);

  useEffect(() => {
    saveProfilRT(profilRT);
  }, [profilRT]);

  // Compute live Saldo Kas
  const totalIn = transaksiList
    .filter((t) => t.tipe === 'PEMASUKAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalOut = transaksiList
    .filter((t) => t.tipe === 'PENGELUARAN')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const saldoKas = totalIn - totalOut;

  // Handlers
  const handleOpenCatatTrx = (tipe: TipeTransaksi) => {
    setCatatTrxTipe(tipe);
    setIsCatatTrxOpen(true);
  };

  const handleSaveTransaksi = (newTrx: Transaksi) => {
    setTransaksiList((prev) => [newTrx, ...prev]);
  };

  const handleDeleteTransaksi = (trxId: string) => {
    setTransaksiList((prev) => prev.filter((t) => t.id !== trxId));
  };

  const handleUpdateTagihanStatus = (
    tagihanId: string,
    status: StatusIuran,
    metodeBayar?: 'Transfer Bank' | 'Tunai ke Bendahara' | 'QRIS RT',
    catatan?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedNominal = 0;
    let targetWarga: Warga | undefined;
    let bulanTagihan = '';

    setTagihanList((prev) =>
      prev.map((tag) => {
        if (tag.id === tagihanId) {
          updatedNominal = tag.nominal;
          bulanTagihan = tag.bulan;
          targetWarga = wargaList.find((w) => w.id === tag.wargaId);
          return {
            ...tag,
            status,
            tanggalBayar: status === 'LUNAS' ? today : undefined,
            metodeBayar: status === 'LUNAS' ? metodeBayar || 'Transfer Bank' : undefined,
            catatan: catatan || tag.catatan,
          };
        }
        return tag;
      })
    );

    // If marked LUNAS, automatically record into cash ledger (Pemasukan)
    if (status === 'LUNAS' && targetWarga) {
      const namaWarga = targetWarga.nama;
      const blok = targetWarga.blokRumah;
      const newTrx: Transaksi = {
        id: `trx-iuran-${Date.now()}`,
        tipe: 'PEMASUKAN',
        kategori: 'Iuran Wajib Bulanan',
        nominal: updatedNominal,
        tanggal: today,
        deskripsi: `Iuran Kas RT ${formatBulanTahun(bulanTagihan)} - ${namaWarga} (${blok})`,
        penanggungJawab: profilRT.namaBendahara,
        nomorKuitansi: generateKuitansi('PEMASUKAN'),
        wargaId: targetWarga.id,
        tagihanId,
      };
      setTransaksiList((prev) => [newTrx, ...prev]);
    }
  };

  const handleGenerateMonthlyBills = (bulan: string) => {
    const existingForMonth = new Set(
      tagihanList.filter((t) => t.bulan === bulan).map((t) => t.wargaId)
    );

    const newBills: TagihanIuran[] = [];
    wargaList.forEach((w) => {
      if (!existingForMonth.has(w.id)) {
        const total = profilRT.tarifIuran.wajib + profilRT.tarifIuran.kebersihan + profilRT.tarifIuran.keamanan;
        newBills.push({
          id: `tag-${bulan}-${w.id}`,
          wargaId: w.id,
          bulan,
          tahun: parseInt(bulan.split('-')[0], 10),
          nominal: total,
          rincian: {
            wajib: profilRT.tarifIuran.wajib,
            kebersihan: profilRT.tarifIuran.kebersihan,
            keamanan: profilRT.tarifIuran.keamanan,
          },
          status: 'BELUM_BAYAR',
        });
      }
    });

    if (newBills.length > 0) {
      setTagihanList((prev) => [...prev, ...newBills]);
      alert(`Berhasil membuat ${newBills.length} tagihan iuran baru untuk periode ${formatBulanTahun(bulan)}!`);
    } else {
      alert(`Seluruh warga sudah memiliki data tagihan untuk periode ${formatBulanTahun(bulan)}.`);
    }
  };

  const handleSaveWarga = (warga: Warga) => {
    setWargaList((prev) => {
      const index = prev.findIndex((w) => w.id === warga.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = warga;
        return copy;
      }
      return [warga, ...prev];
    });

    // Also auto-generate September bill if not existing
    const hasTagihan = tagihanList.some((t) => t.wargaId === warga.id && t.bulan === '2026-09');
    if (!hasTagihan) {
      const total = profilRT.tarifIuran.wajib + profilRT.tarifIuran.kebersihan + profilRT.tarifIuran.keamanan;
      const newTag: TagihanIuran = {
        id: `tag-2026-09-${warga.id}`,
        wargaId: warga.id,
        bulan: '2026-09',
        tahun: 2026,
        nominal: total,
        rincian: {
          wajib: profilRT.tarifIuran.wajib,
          kebersihan: profilRT.tarifIuran.kebersihan,
          keamanan: profilRT.tarifIuran.keamanan,
        },
        status: 'BELUM_BAYAR',
      };
      setTagihanList((prev) => [...prev, newTag]);
    }

    setEditingWarga(null);
  };

  const handleDeleteWarga = (wargaId: string) => {
    setWargaList((prev) => prev.filter((w) => w.id !== wargaId));
    setTagihanList((prev) => prev.filter((t) => t.wargaId !== wargaId));
  };

  const handleUploadBuktiTransfer = (tagihanId: string, buktiUrl: string) => {
    setTagihanList((prev) =>
      prev.map((t) =>
        t.id === tagihanId
          ? {
              ...t,
              status: 'MENUNGGU_VERIFIKASI',
              buktiTransferUrl: buktiUrl,
              catatan: 'Bukti transfer diunggah oleh warga (menunggu verifikasi bendahara)',
            }
          : t
      )
    );
  };

  const handleResetData = () => {
    if (confirm('Muat ulang seluruh data demo ke kondisi bawaan? Data input lokal akan direset.')) {
      resetAllData();
      setWargaList(initialWarga);
      setTagihanList(initialTagihan);
      setTransaksiList(initialTransaksi);
      setProfilRT(initialProfilRT);
      alert('Data demo berhasil dimuat ulang!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-black flex flex-col font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Neo-Brutalist Navbar */}
      <Navbar
        profilRT={profilRT}
        saldoKas={saldoKas}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isModeWarga={isModeWarga}
        setIsModeWarga={setIsModeWarga}
        onOpenExportModal={() => setIsExportOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* If in Mode Warga, display the resident self-service check bar */}
        {isModeWarga && (
          <PortalWargaBar
            wargaList={wargaList}
            tagihanList={tagihanList}
            profilRT={profilRT}
            onUploadBuktiTransfer={handleUploadBuktiTransfer}
          />
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            profilRT={profilRT}
            transaksiList={transaksiList}
            tagihanList={tagihanList}
            wargaList={wargaList}
            onOpenCatatTrx={handleOpenCatatTrx}
            onOpenNotifikasi={() => setIsNotifikasiOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenTambahWarga={() => {
              setEditingWarga(null);
              setIsTambahWargaOpen(true);
            }}
            onSelectTab={setActiveTab}
            onViewTrxDetail={(trx) => setDetailTrx(trx)}
          />
        )}

        {/* Tab 2: Iuran & Tagihan */}
        {activeTab === 'iuran' && (
          <IuranTagihanView
            profilRT={profilRT}
            tagihanList={tagihanList}
            wargaList={wargaList}
            onUpdateTagihanStatus={handleUpdateTagihanStatus}
            onGenerateMonthlyBills={handleGenerateMonthlyBills}
            onOpenNotifikasi={() => setIsNotifikasiOpen(true)}
            isModeWarga={isModeWarga}
          />
        )}

        {/* Tab 3: Transaksi Kas */}
        {activeTab === 'transaksi' && (
          <TransaksiView
            transaksiList={transaksiList}
            onOpenCatatTrx={handleOpenCatatTrx}
            onOpenExport={() => setIsExportOpen(true)}
            onDeleteTrx={handleDeleteTransaksi}
            onViewDetail={(trx) => setDetailTrx(trx)}
            isModeWarga={isModeWarga}
          />
        )}

        {/* Tab 4: Data Warga */}
        {activeTab === 'warga' && (
          <WargaView
            wargaList={wargaList}
            tagihanList={tagihanList}
            profilRT={profilRT}
            onOpenTambahWarga={() => {
              setEditingWarga(null);
              setIsTambahWargaOpen(true);
            }}
            onEditWarga={(warga) => {
              setEditingWarga(warga);
              setIsTambahWargaOpen(true);
            }}
            onDeleteWarga={handleDeleteWarga}
            isModeWarga={isModeWarga}
          />
        )}
      </main>

      {/* Neo-Brutalist Footer */}
      <footer className="bg-white border-t-3 border-black py-6 px-4 text-center mt-12 shadow-[0_-4px_0_0_#000]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-neutral-700">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFE600] px-2 py-0.5 border border-black font-black text-black">
              {profilRT.namaRT}
            </span>
            <span>
              {profilRT.lingkungan}, Kelurahan {profilRT.kelurahan}, {profilRT.kota}
            </span>
          </div>
          <div>
            Sistem Kas RT Online • Transparan, Akuntabel, dan Terbuka untuk Seluruh Warga
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CatatTransaksiModal
        isOpen={isCatatTrxOpen}
        onClose={() => setIsCatatTrxOpen(false)}
        onSave={handleSaveTransaksi}
        defaultTipe={catatTrxTipe}
      />

      <TambahWargaModal
        isOpen={isTambahWargaOpen}
        onClose={() => {
          setIsTambahWargaOpen(false);
          setEditingWarga(null);
        }}
        onSave={handleSaveWarga}
        editingWarga={editingWarga}
      />

      <NotifikasiTagihanModal
        isOpen={isNotifikasiOpen}
        onClose={() => setIsNotifikasiOpen(false)}
        tagihanList={tagihanList}
        wargaList={wargaList}
        profilRT={profilRT}
        selectedBulan="2026-09"
      />

      <LaporanExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        profilRT={profilRT}
        transaksiList={transaksiList}
        tagihanList={tagihanList}
        wargaList={wargaList}
      />

      <DetailTransaksiModal
        transaksi={detailTrx}
        onClose={() => setDetailTrx(null)}
      />
    </div>
  );
}
