export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

export function formatRupiahSimple(angka: number): string {
  if (angka >= 1_000_000) {
    const jutaan = (angka / 1_000_000).toFixed(1).replace('.0', '');
    return `Rp ${jutaan} Jt`;
  }
  if (angka >= 1_000) {
    const ribuan = (angka / 1_000).toFixed(0);
    return `Rp ${ribuan} Rb`;
  }
  return formatRupiah(angka);
}

export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatBulanTahun(bulanTahunStr: string): string {
  // Format input: "2026-09"
  if (!bulanTahunStr || !bulanTahunStr.includes('-')) return bulanTahunStr;
  const [tahun, bulan] = bulanTahunStr.split('-');
  const bulanIndex = parseInt(bulan, 10) - 1;
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${namaBulan[bulanIndex] || bulan} ${tahun}`;
}

export function cleanPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function generateWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function generateKuitansi(tipe: 'PEMASUKAN' | 'PENGELUARAN'): string {
  const prefix = tipe === 'PEMASUKAN' ? 'KM' : 'KK'; // Kas Masuk / Kas Keluar
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${yearMonth}-${random}`;
}
