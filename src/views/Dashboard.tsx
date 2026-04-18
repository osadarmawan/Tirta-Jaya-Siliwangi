import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, ArrowUpRight, CheckCircle2, Droplet } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Dashboard({ onViewChange }: { onViewChange: (view: any) => void }) {
  const { customers, history } = useData();

  const stats = useMemo(() => {
    let totalBillThisMonth = 0;
    let collectedBill = 0;
    let arrears = 0;
    let unpaidCount = 0;

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    Object.values(history as Record<string, any[]>).forEach(customerHistory => {
      customerHistory.forEach(record => {
        const recordDate = new Date(record.date);
        
        // Calculate total unpaid (arrears) across all time
        if (record.status === 'Belum Bayar' || record.status === 'Terlambat') {
          arrears += record.amount;
          unpaidCount++;
        }

        // Calculate stats for current month
        if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
          totalBillThisMonth += record.amount;
          if (record.status === 'Lunas') {
            collectedBill += record.amount;
          }
        }
      });
    });

    const collectionRate = totalBillThisMonth > 0 
      ? Math.round((collectedBill / totalBillThisMonth) * 100) 
      : 0;

    return {
      totalBillThisMonth,
      collectedBill,
      arrears,
      unpaidCount,
      collectionRate
    };
  }, [history]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        name: months[d.getMonth()],
        month: d.getMonth(),
        year: d.getFullYear(),
        usage: 0
      });
    }

    Object.values(history as Record<string, any[]>).forEach(customerHistory => {
      customerHistory.forEach(record => {
        const recordDate = new Date(record.date);
        const monthIndex = last6Months.findIndex(m => 
          m.month === recordDate.getMonth() && m.year === recordDate.getFullYear()
        );
        if (monthIndex !== -1) {
          last6Months[monthIndex].usage += record.usage;
        }
      });
    });

    return last6Months;
  }, [history]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-6 border-l-4 border-l-[#D4AF37]">
        <h2 className="text-2xl font-heading font-bold text-[#1A237E]">Selamat Datang, Admin!</h2>
        <p className="text-gray-600 mt-1">Berikut adalah ringkasan penggunaan air perumahan bulan ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#1A237E]/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tagihan (Bulan Ini)</p>
              <h3 className="text-2xl font-bold text-[#1A237E] mt-1">Rp {stats.totalBillThisMonth.toLocaleString('id-ID')}</h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Update real-time</span>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D4AF37]/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tagihan Tertagih</p>
              <h3 className="text-2xl font-bold text-[#1A237E] mt-1">Rp {stats.collectedBill.toLocaleString('id-ID')}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-[#1A237E] rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span className="font-medium text-[#1A237E]">{stats.collectionRate}%</span>&nbsp;telah membayar
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-[#D4AF37] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${stats.collectionRate}%` }}></div>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tunggakan</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">Rp {stats.arrears.toLocaleString('id-ID')}</h3>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-500 font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>{stats.unpaidCount} Tagihan belum lunas</span>
          </div>
        </div>
      </div>

      {/* Charts & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-heading font-bold text-[#1A237E]">Grafik Penggunaan Air</h3>
              <p className="text-sm text-gray-500">Total volume (m³) dalam 6 bulan terakhir</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] p-2 outline-none">
              <option>Tahun 2026</option>
              <option>Tahun 2025</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A237E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1A237E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1A237E', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="usage" stroke="#1A237E" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Notifications */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-heading font-bold text-[#1A237E] mb-4">Notifikasi Sistem</h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {[
              { title: 'Jatuh Tempo Mendekat', desc: `${stats.unpaidCount} warga belum membayar tagihan bulan ini.`, time: 'Baru saja', type: 'warning' },
              { title: 'Pencatatan Selesai', desc: 'Sistem telah memperbarui data penggunaan air terbaru.', time: '5 jam lalu', type: 'success' },
              { title: 'Meteran Anomali', desc: 'Pengecekan rutin disarankan untuk penggunaan melonjak.', time: '1 hari lalu', type: 'error' },
              { title: 'Sistem Update', desc: 'Pembaruan tarif dasar air berhasil diterapkan.', time: '2 hari lalu', type: 'info' },
            ].map((notif, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  notif.type === 'warning' ? 'bg-[#D4AF37]' :
                  notif.type === 'success' ? 'bg-green-500' :
                  notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div>
                  <h4 className="text-sm font-semibold text-[#1A237E]">{notif.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onViewChange('notifications')}
            className="w-full mt-4 py-2 text-sm font-medium text-[#1A237E] bg-[#1A237E]/5 hover:bg-[#1A237E]/10 rounded-lg transition-colors"
          >
            Lihat Semua
          </button>
        </div>
      </div>
    </div>
  );
}
