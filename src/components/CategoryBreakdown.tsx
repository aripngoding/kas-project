import React, { useState } from 'react';
import { Transaksi } from '../types';
import { formatRupiah, formatRupiahSimple } from '../utils/formatters';
import { PieChart, ListFilter, Donut } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface CategoryBreakdownProps {
  transaksiList: Transaksi[];
  bulanFilter?: string; // e.g. "2026-09" or undefined for all
}

const CATEGORY_HEX_COLORS = [
  '#FFE600',
  '#00F59B',
  '#00E5FF',
  '#FF90E8',
  '#FFB800',
  '#9945FF',
  '#FF5C00',
  '#00C2FF',
];

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  transaksiList,
  bulanFilter,
}) => {
  const [viewStyle, setViewStyle] = useState<'donut' | 'bars'>('donut');

  // Filter for pengeluaran
  const expenses = transaksiList.filter((t) => {
    if (t.tipe !== 'PENGELUARAN') return false;
    if (bulanFilter && bulanFilter !== 'all') {
      return t.tanggal.startsWith(bulanFilter);
    }
    return true;
  });

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.nominal, 0);

  // Group by category
  const mapCat = new Map<string, number>();
  expenses.forEach((t) => {
    mapCat.set(t.kategori, (mapCat.get(t.kategori) || 0) + t.nominal);
  });

  const sortedCategories = Array.from(mapCat.entries())
    .map(([kategori, total], index) => ({
      name: kategori,
      kategori,
      value: total,
      total,
      percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
      color: CATEGORY_HEX_COLORS[index % CATEGORY_HEX_COLORS.length],
    }))
    .sort((a, b) => b.total - a.total);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black text-white border-2 border-[#FFE600] p-2.5 shadow-[3px_3px_0_0_#FFE600] text-xs font-bold">
          <div className="text-[#FFE600] font-black">{data.kategori}</div>
          <div className="text-white mt-1">{formatRupiah(data.total)}</div>
          <div className="text-[#00E5FF] text-[10px]">
            Porsi: {data.percentage.toFixed(1)}% dari total pengeluaran
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="neo-box p-4 sm:p-5 bg-white border-3 border-black">
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b-2 border-black">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#FF90E8] border-2 border-black">
            <PieChart className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-display font-black text-base sm:text-lg text-black leading-tight">
              Alokasi Pengeluaran Kas
            </h3>
            <span className="text-[10px] font-bold text-neutral-600">
              Distribusi pos biaya operasional
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex border-2 border-black bg-neutral-100 p-0.5">
            <button
              onClick={() => setViewStyle('donut')}
              title="Tampilan Donut Chart"
              className={`p-1 cursor-pointer transition-all ${
                viewStyle === 'donut' ? 'bg-black text-white' : 'text-neutral-700 hover:text-black'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewStyle('bars')}
              title="Tampilan Bar Persentase"
              className={`p-1 cursor-pointer transition-all ${
                viewStyle === 'bars' ? 'bg-black text-white' : 'text-neutral-700 hover:text-black'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs font-black bg-black text-white px-2 py-0.5">
            {formatRupiah(totalExpense)}
          </span>
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-6 text-neutral-500 font-bold text-sm">
          Belum ada data pengeluaran pada periode ini.
        </div>
      ) : (
        <div className="space-y-3">
          {viewStyle === 'donut' ? (
            <div className="h-44 w-full flex items-center justify-center relative my-1">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={sortedCategories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    stroke="#000"
                    strokeWidth={2}
                  >
                    {sortedCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black uppercase text-neutral-500">
                  Total
                </span>
                <span className="font-display font-black text-xs text-black">
                  {formatRupiahSimple(totalExpense)}
                </span>
              </div>
            </div>
          ) : (
            /* Segmented Visual Bar */
            <div className="w-full h-5 border-2 border-black flex overflow-hidden bg-neutral-200">
              {sortedCategories.map((item) => (
                <div
                  key={item.kategori}
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  title={`${item.kategori}: ${item.percentage.toFixed(1)}%`}
                  className="border-r border-black h-full transition-all"
                />
              ))}
            </div>
          )}

          {/* List of items */}
          <div className="space-y-1.5 pt-1 max-h-56 overflow-y-auto pr-1">
            {sortedCategories.map((item) => (
              <div
                key={item.kategori}
                className="flex items-center justify-between gap-2 text-xs font-bold border-b border-neutral-200 pb-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    style={{ backgroundColor: item.color }}
                    className="w-3 h-3 border border-black shrink-0"
                  ></span>
                  <span className="truncate text-black">{item.kategori}</span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-neutral-600 font-extrabold text-[11px]">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="text-black font-black">
                    {formatRupiah(item.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
