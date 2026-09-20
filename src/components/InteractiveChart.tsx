import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Transaksi } from '../types';
import { formatRupiah, formatRupiahSimple } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  LineChart as LineChartIcon,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface InteractiveChartProps {
  transaksiList: Transaksi[];
}

interface MonthlyStat {
  monthKey: string; // "2026-04"
  label: string; // "Apr 2026"
  shortLabel: string; // "Apr"
  pemasukan: number;
  pengeluaran: number;
  saldoBersih: number;
  saldoKumulatif: number;
  trxMasukCount: number;
  trxKeluarCount: number;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ transaksiList }) => {
  const [chartView, setChartView] = useState<'comparison' | 'trend' | 'net'>('comparison');
  const [periodOption, setPeriodOption] = useState<'6m' | 'ytd'>('6m');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  // Process and compute monthly data
  const monthlyData: MonthlyStat[] = useMemo(() => {
    const monthsToGenerate = periodOption === '6m' ? 6 : 9;
    const targetYear = 2026;
    const targetMonth = 9; // Sep 2026

    const result: MonthlyStat[] = [];

    // First find initial base balance prior to the start of this window
    // Calculate running balance accurately
    let runningBalance = 0;
    // Get all transactions sorted chronologically
    const sortedAll = [...transaksiList].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );

    // Compute month keys
    const keys: { monthKey: string; m: number; y: number }[] = [];
    for (let i = monthsToGenerate - 1; i >= 0; i--) {
      let m = targetMonth - i;
      let y = targetYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      keys.push({
        monthKey: `${y}-${m.toString().padStart(2, '0')}`,
        m,
        y,
      });
    }

    const firstWindowKey = keys[0].monthKey;

    // Prior transactions running balance
    sortedAll.forEach((t) => {
      const tMonthKey = t.tanggal.substring(0, 7);
      if (tMonthKey < firstWindowKey) {
        if (t.tipe === 'PEMASUKAN') runningBalance += t.nominal;
        else runningBalance -= t.nominal;
      }
    });

    keys.forEach(({ monthKey, m, y }) => {
      const trxInMonth = transaksiList.filter((t) => t.tanggal.startsWith(monthKey));
      const masukTrx = trxInMonth.filter((t) => t.tipe === 'PEMASUKAN');
      const keluarTrx = trxInMonth.filter((t) => t.tipe === 'PENGELUARAN');

      const pemasukan = masukTrx.reduce((acc, curr) => acc + curr.nominal, 0);
      const pengeluaran = keluarTrx.reduce((acc, curr) => acc + curr.nominal, 0);
      const saldoBersih = pemasukan - pengeluaran;
      runningBalance += saldoBersih;

      result.push({
        monthKey,
        label: `${monthNames[m - 1]} ${y}`,
        shortLabel: `${shortMonths[m - 1]} '${y.toString().slice(2)}`,
        pemasukan,
        pengeluaran,
        saldoBersih,
        saldoKumulatif: runningBalance,
        trxMasukCount: masukTrx.length,
        trxKeluarCount: keluarTrx.length,
      });
    });

    return result;
  }, [transaksiList, periodOption]);

  // Aggregate statistics
  const totalMasuk = monthlyData.reduce((acc, curr) => acc + curr.pemasukan, 0);
  const totalKeluar = monthlyData.reduce((acc, curr) => acc + curr.pengeluaran, 0);
  const avgMasuk = Math.round(totalMasuk / (monthlyData.length || 1));
  const avgKeluar = Math.round(totalKeluar / (monthlyData.length || 1));
  const netPeriode = totalMasuk - totalKeluar;

  // Highest income month
  const peakIncomeMonth = useMemo(() => {
    return [...monthlyData].sort((a, b) => b.pemasukan - a.pemasukan)[0];
  }, [monthlyData]);

  // Custom Neo-Brutalist Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyStat = payload[0].payload;
      return (
        <div className="bg-black text-white border-2 border-[#FFE600] p-3 shadow-[4px_4px_0_0_#FFE600] text-xs font-bold min-w-[220px]">
          <div className="border-b border-neutral-700 pb-1.5 mb-2 flex items-center justify-between">
            <span className="text-[#FFE600] font-black text-sm">{data.label}</span>
            <span
              className={`text-[9px] font-black px-1.5 py-0.5 border ${
                data.saldoBersih >= 0
                  ? 'bg-[#00F59B] text-black border-black'
                  : 'bg-[#FF4B4B] text-white border-white'
              }`}
            >
              {data.saldoBersih >= 0 ? 'SURPLUS' : 'DEFISIT'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2.5 h-2.5 bg-[#00F59B] border border-black inline-block"></span>
                Pemasukan:
              </span>
              <span className="text-[#00F59B] font-black">
                {formatRupiah(data.pemasukan)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2.5 h-2.5 bg-[#FF4B4B] border border-black inline-block"></span>
                Pengeluaran:
              </span>
              <span className="text-[#FF4B4B] font-black">
                {formatRupiah(data.pengeluaran)}
              </span>
            </div>

            <div className="pt-1.5 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-400">Selisih Kas (Net):</span>
              <span
                className={`font-black ${
                  data.saldoBersih >= 0 ? 'text-[#00F59B]' : 'text-[#FF4B4B]'
                }`}
              >
                {data.saldoBersih >= 0 ? '+' : ''}
                {formatRupiah(data.saldoBersih)}
              </span>
            </div>

            <div className="pt-1 border-t border-dashed border-neutral-800 flex items-center justify-between text-[#00E5FF]">
              <span>Posisi Saldo Kumulatif:</span>
              <span className="font-black">{formatRupiah(data.saldoKumulatif)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="neo-box p-4 sm:p-5 bg-white border-3 border-black">
      {/* Top Header & Interactive Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-black">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFE600] px-2 py-0.5 border border-black inline-block mb-1">
            Visualisasi &amp; Analitik Arus Kas
          </span>
          <h3 className="font-display font-black text-lg sm:text-xl text-black">
            Grafik Realistis Keuangan Kas RT
          </h3>
          <p className="text-xs font-bold text-neutral-600">
            Pergerakan arus kas riil berdasarkan pembukuan mutasi pemasukan &amp; pengeluaran operasional.
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex border-2 border-black bg-neutral-100 p-0.5 shadow-[2px_2px_0_0_#000]">
            <button
              onClick={() => setPeriodOption('6m')}
              className={`px-2 py-1 text-[11px] font-black transition-all cursor-pointer ${
                periodOption === '6m' ? 'bg-black text-white' : 'text-neutral-700 hover:text-black'
              }`}
            >
              6 Bulan
            </button>
            <button
              onClick={() => setPeriodOption('ytd')}
              className={`px-2 py-1 text-[11px] font-black transition-all cursor-pointer ${
                periodOption === 'ytd' ? 'bg-black text-white' : 'text-neutral-700 hover:text-black'
              }`}
            >
              Tahun 2026
            </button>
          </div>

          {/* Chart type toggle */}
          <div className="flex border-2 border-black bg-neutral-100 p-0.5 shadow-[2px_2px_0_0_#000]">
            <button
              onClick={() => setChartView('comparison')}
              title="Grafik Batang Perbandingan Masuk vs Keluar"
              className={`px-2.5 py-1 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                chartView === 'comparison'
                  ? 'bg-[#00F59B] text-black border border-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Pemasukan vs Pengeluaran</span>
              <span className="sm:hidden">Masuk/Keluar</span>
            </button>

            <button
              onClick={() => setChartView('trend')}
              title="Grafik Kurva Akumulasi Saldo Kas"
              className={`px-2.5 py-1 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                chartView === 'trend'
                  ? 'bg-[#00E5FF] text-black border border-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Kurva Tren Saldo</span>
              <span className="sm:hidden">Tren Saldo</span>
            </button>

            <button
              onClick={() => setChartView('net')}
              title="Grafik Surplus / Defisit Bersih Per Bulan"
              className={`px-2.5 py-1 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                chartView === 'net'
                  ? 'bg-[#FFE600] text-black border border-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Surplus / Defisit</span>
              <span className="sm:hidden">Net Kas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Legend with Live Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold mb-4 bg-neutral-50 p-2.5 border-2 border-black">
        <div className="flex flex-wrap items-center gap-4">
          {chartView === 'comparison' && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#00F59B] border-2 border-black inline-block"></span>
                <span>Pemasukan Kas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#FF4B4B] border-2 border-black inline-block"></span>
                <span>Pengeluaran Operasional</span>
              </div>
            </>
          )}

          {chartView === 'trend' && (
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#00E5FF] border-2 border-black inline-block"></span>
              <span>Posisi Saldo Kas Nyata (Akumulatif)</span>
            </div>
          )}

          {chartView === 'net' && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#00E5FF] border-2 border-black inline-block"></span>
                <span>Surplus Bersih (Masuk &gt; Keluar)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#FF90E8] border-2 border-black inline-block"></span>
                <span>Defisit Bersih (Keluar &gt; Masuk)</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-black">
          <span className="text-[#008f51] flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            Rata-rata: {formatRupiahSimple(avgMasuk)}/bln
          </span>
          <span className="text-[#d11a2a] flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3" />
            Beban: {formatRupiahSimple(avgKeluar)}/bln
          </span>
        </div>
      </div>

      {/* Main Responsive Recharts Container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'comparison' ? (
            <BarChart
              data={monthlyData}
              margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: '#000', fontSize: 11, fontWeight: 800 }}
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
                tickLine={{ stroke: '#000', strokeWidth: 1.5 }}
              />
              <YAxis
                tickFormatter={(val) => formatRupiahSimple(val)}
                tick={{ fill: '#555', fontSize: 10, fontWeight: 700 }}
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
                tickLine={{ stroke: '#000', strokeWidth: 1.5 }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="pemasukan"
                name="Pemasukan"
                fill="#00F59B"
                stroke="#000"
                strokeWidth={2}
                radius={[0, 0, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="pengeluaran"
                name="Pengeluaran"
                fill="#FF4B4B"
                stroke="#000"
                strokeWidth={2}
                radius={[0, 0, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          ) : chartView === 'trend' ? (
            <AreaChart
              data={monthlyData}
              margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: '#000', fontSize: 11, fontWeight: 800 }}
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
                tickLine={{ stroke: '#000', strokeWidth: 1.5 }}
              />
              <YAxis
                tickFormatter={(val) => formatRupiahSimple(val)}
                tick={{ fill: '#555', fontSize: 10, fontWeight: 700 }}
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
                tickLine={{ stroke: '#000', strokeWidth: 1.5 }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="saldoKumulatif"
                name="Saldo Kas"
                stroke="#000"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSaldo)"
                dot={{
                  r: 5,
                  fill: '#FFE600',
                  stroke: '#000',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: '#00F59B',
                  stroke: '#000',
                  strokeWidth: 2.5,
                }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={monthlyData}
              margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: '#000', fontSize: 11, fontWeight: 800 }}
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
                tickLine={{ stroke: '#000', strokeWidth: 1.5 }}
              />
              <YAxis
                tickFormatter={(val) => formatRupiahSimple(val)}
                tick={{ fill: '#555', fontSize: 10, fontWeight: 700 }}
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
                tickLine={{ stroke: '#000', strokeWidth: 1.5 }}
                width={70}
              />
              <ReferenceLine y={0} stroke="#000" strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="saldoBersih"
                name="Surplus / Defisit"
                stroke="#000"
                strokeWidth={2}
                maxBarSize={44}
                shape={(props: any) => {
                  const { fill, x, y, width, height, value } = props;
                  const isPositive = value >= 0;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={isPositive ? '#00E5FF' : '#FF90E8'}
                      stroke="#000"
                      strokeWidth={2}
                      className="transition-all hover:opacity-90"
                    />
                  );
                }}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Realistic Financial Insights Bar */}
      <div className="mt-4 pt-3 border-t-2 border-black grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-neutral-50 border-2 border-black p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-neutral-500 block">
              Puncak Pemasukan
            </span>
            <div className="font-black text-black">
              {peakIncomeMonth ? `${peakIncomeMonth.label}` : '-'}
            </div>
          </div>
          <span className="font-display font-black text-sm text-[#008f51] bg-[#00F59B]/20 border border-black px-1.5 py-0.5">
            {peakIncomeMonth ? formatRupiahSimple(peakIncomeMonth.pemasukan) : '-'}
          </span>
        </div>

        <div className="bg-neutral-50 border-2 border-black p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-neutral-500 block">
              Net Arus Kas Periode Ini
            </span>
            <div className="font-black text-black">
              {monthlyData.length} Bulan Terakhir
            </div>
          </div>
          <span
            className={`font-display font-black text-sm border border-black px-1.5 py-0.5 ${
              netPeriode >= 0
                ? 'text-[#008f51] bg-[#00F59B]/20'
                : 'text-[#d11a2a] bg-[#FF4B4B]/20'
            }`}
          >
            {netPeriode >= 0 ? '+' : ''}
            {formatRupiah(netPeriode)}
          </span>
        </div>

        <div className="bg-neutral-50 border-2 border-black p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-neutral-500 block">
              Status Ketahanan Kas
            </span>
            <div className="font-black text-black flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#008f51]" />
              <span>Likuid &amp; Mandiri</span>
            </div>
          </div>
          <span className="text-[10px] font-black bg-[#FFE600] text-black border border-black px-2 py-0.5">
            SEHAT
          </span>
        </div>
      </div>
    </div>
  );
};
