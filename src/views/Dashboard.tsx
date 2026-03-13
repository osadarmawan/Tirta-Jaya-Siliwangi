import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Droplet, TrendingUp, AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const data = [
  { name: 'Jan', usage: 400 },
  { name: 'Feb', usage: 300 },
  { name: 'Mar', usage: 550 },
  { name: 'Apr', usage: 450 },
  { name: 'Mei', usage: 600 },
  { name: 'Jun', usage: 700 },
];

export default function Dashboard() {
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
              <h3 className="text-2xl font-bold text-[#1A237E] mt-1">Rp 12.450.000</h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>+12.5% dari bulan lalu</span>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D4AF37]/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tagihan Tertagih</p>
              <h3 className="text-2xl font-bold text-[#1A237E] mt-1">Rp 9.200.000</h3>
            </div>
            <div className="p-3 bg-blue-100 text-[#1A237E] rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span className="font-medium text-[#1A237E]">74%</span>&nbsp;telah membayar
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-[#D4AF37] h-1.5 rounded-full" style={{ width: '74%' }}></div>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tunggakan</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">Rp 3.250.000</h3>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-500 font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>12 Rumah belum bayar</span>
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              { title: 'Jatuh Tempo Mendekat', desc: '5 warga belum membayar tagihan bulan ini.', time: '2 jam lalu', type: 'warning' },
              { title: 'Pencatatan Selesai', desc: 'Blok A telah selesai dicatat oleh Petugas Budi.', time: '5 jam lalu', type: 'success' },
              { title: 'Meteran Anomali', desc: 'Penggunaan air Blok C-12 melonjak 300%.', time: '1 hari lalu', type: 'error' },
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
          <button className="w-full mt-4 py-2 text-sm font-medium text-[#1A237E] bg-[#1A237E]/5 hover:bg-[#1A237E]/10 rounded-lg transition-colors">
            Lihat Semua
          </button>
        </div>
      </div>
    </div>
  );
}
