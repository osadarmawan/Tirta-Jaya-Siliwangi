import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Info, 
  Check, Search, Filter, Trash2, MoreVertical, Bell
} from 'lucide-react';
import { motion } from 'motion/react';

export default function NotificationsView({ notifications, setNotifications }: any) {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = ['Semua', 'Belum Dibaca', 'Pembayaran', 'Sistem', 'Peringatan'];

  const markAllAsRead = () => {
    setNotifications(notifications.map((n: any) => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n: any) => n.id !== id));
  };

  // Filter logic
  const filteredNotifications = notifications.filter((notif: any) => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          notif.desc.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (activeTab) {
      case 'Belum Dibaca': return notif.unread;
      case 'Pembayaran': return notif.type === 'success';
      case 'Sistem': return notif.type === 'info';
      case 'Peringatan': return notif.type === 'warning' || notif.type === 'error';
      default: return true;
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-[#1A237E] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#D4AF37]" />
            Pusat Notifikasi
          </h2>
          <p className="text-gray-500 mt-1">Kelola dan lihat semua riwayat aktivitas sistem.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#1A237E] rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
        >
          <Check className="w-5 h-5 text-[#D4AF37]" />
          <span>Tandai Semua Dibaca</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-[#1A237E] text-white shadow-md' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari notifikasi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Notification List */}
      <div className="glass-card overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notif: any, index: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={notif.id} 
                className={`p-5 hover:bg-gray-50/80 transition-colors flex gap-4 group relative ${notif.unread ? 'bg-blue-50/20' : 'bg-white'}`}
              >
                {notif.unread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]"></div>
                )}
                
                <div className={`mt-1 p-3 rounded-full flex-shrink-0 h-fit ${
                  notif.type === 'success' ? 'bg-green-100 text-green-600' :
                  notif.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  notif.type === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {notif.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {notif.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                  {notif.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {notif.type === 'info' && <Info className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className={`text-base font-semibold ${notif.unread ? 'text-[#1A237E]' : 'text-gray-800'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                        {notif.time}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button 
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-[#1A237E] hover:bg-[#1A237E]/10 rounded-md transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Tidak ada notifikasi</h3>
            <p className="text-gray-500 mt-1 text-sm">Anda telah membaca semua pemberitahuan terbaru.</p>
          </div>
        )}
      </div>
    </div>
  );
}
