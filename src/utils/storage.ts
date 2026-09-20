import { Warga, TagihanIuran, Transaksi, ProfilRT } from '../types';
import { initialWarga, initialTagihan, initialTransaksi, initialProfilRT } from '../data/initialData';

const STORAGE_KEYS = {
  WARGA: 'kas_rt_warga_v1',
  TAGIHAN: 'kas_rt_tagihan_v1',
  TRANSAKSI: 'kas_rt_transaksi_v2',
  PROFIL: 'kas_rt_profil_v1',
};

export function loadWarga(): Warga[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WARGA);
    if (!data) {
      saveWarga(initialWarga);
      return initialWarga;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load warga:', e);
    return initialWarga;
  }
}

export function saveWarga(data: Warga[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save warga:', e);
  }
}

export function loadTagihan(): TagihanIuran[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TAGIHAN);
    if (!data) {
      saveTagihan(initialTagihan);
      return initialTagihan;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load tagihan:', e);
    return initialTagihan;
  }
}

export function saveTagihan(data: TagihanIuran[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TAGIHAN, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save tagihan:', e);
  }
}

export function loadTransaksi(): Transaksi[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSAKSI);
    if (!data) {
      saveTransaksi(initialTransaksi);
      return initialTransaksi;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load transaksi:', e);
    return initialTransaksi;
  }
}

export function saveTransaksi(data: Transaksi[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save transaksi:', e);
  }
}

export function loadProfilRT(): ProfilRT {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFIL);
    if (!data) {
      saveProfilRT(initialProfilRT);
      return initialProfilRT;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load profil RT:', e);
    return initialProfilRT;
  }
}

export function saveProfilRT(data: ProfilRT): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFIL, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save profil RT:', e);
  }
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.WARGA);
  localStorage.removeItem(STORAGE_KEYS.TAGIHAN);
  localStorage.removeItem(STORAGE_KEYS.TRANSAKSI);
  localStorage.removeItem(STORAGE_KEYS.PROFIL);
}
