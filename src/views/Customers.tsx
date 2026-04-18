import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, QrCode, X, Edit2, Eye, MessageCircle, Trash2, AlertTriangle, Phone, MapPin, Activity, Calendar, TrendingUp, Download, Printer, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSettings } from '../context/SettingsContext';
import { useData, Customer, HistoryRecord } from '../context/DataContext';

export default function Customers() {
  const { settings } = useSettings();
  const { customers, addCustomer, updateCustomer, deleteCustomer, history } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', block: '', number: '', phone: '', category: 'Rumah Tangga', initialMeter: 0 });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomerState, setDeleteCustomerState] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.block || !newCustomer.number) return;
    
    if (editCustomer) {
      updateCustomer(editCustomer.id, {
        name: newCustomer.name,
        block: `${newCustomer.block}-${newCustomer.number}`,
        category: newCustomer.category,
        phone: newCustomer.phone,
        initialMeter: Number(newCustomer.initialMeter) || 0
      });
      setEditCustomer(null);
    } else {
      addCustomer({ 
        name: newCustomer.name, 
        block: `${newCustomer.block}-${newCustomer.number}`, 
        category: newCustomer.category,
        initialMeter: Number(newCustomer.initialMeter) || 0,
        phone: newCustomer.phone
      });
    }
    
    setShowAddModal(false);
    setNewCustomer({ name: '', block: '', number: '', phone: '', category: 'Rumah Tangga', initialMeter: 0 });
  };

  const handleDeleteCustomer = () => {
    if (deleteCustomerState) {
      deleteCustomer(deleteCustomerState.id);
      setDeleteCustomerState(null);
    }
  };

  const handleSendWA = (customer: Customer) => {
    const message = `Halo Bapak/Ibu *${customer.name}*,

Ini adalah pesan dari pengurus *${settings.appName}*.
Kami ingin menginformasikan terkait data warga Anda di Blok *${customer.block}*.

Terima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    const phone = customer.phone || '6281234567890'; 
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau blok rumah..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#1A237E] rounded-xl hover:bg-gray-50 transition-colors font-medium">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A237E] text-white rounded-xl hover:bg-[#283593] transition-colors font-medium shadow-lg shadow-[#1A237E]/20"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map((customer, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={customer.id} 
            className="glass-card p-5 group hover:border-[#D4AF37]/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-[#1A237E]/10 to-[#1A237E]/5 flex flex-col items-center justify-center text-[#1A237E] font-bold border border-[#1A237E]/10 leading-tight">
                  <span className="text-[10px] opacity-60 uppercase tracking-tighter">{customer.block.split('-')[0]}</span>
                  <span className="text-base">{customer.block.split('-')[1]}</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A237E] text-lg">{customer.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider mt-1 ${
                    customer.category === 'Niaga' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {customer.category}
                  </span>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdownId(openDropdownId === customer.id ? null : customer.id)}
                  className="p-1 text-gray-400 hover:text-[#1A237E] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {openDropdownId === customer.id && (
                    <motion.div 
                      ref={dropdownRef}
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20"
                    >
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            setViewCustomer(customer);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                          Lihat Detail
                        </button>
                        <button 
                          onClick={() => {
                            const blockParts = customer.block.split('-');
                            setNewCustomer({
                              name: customer.name,
                              block: blockParts[0] || '',
                              number: blockParts[1] || '',
                              phone: customer.phone || '',
                              category: customer.category,
                              initialMeter: customer.initialMeter || 0
                            });
                            setEditCustomer(customer);
                            setShowAddModal(true);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                          Edit Data Warga
                        </button>
                        <button 
                          onClick={() => {
                            handleSendWA(customer);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          Kirim Pesan WA
                        </button>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                          onClick={() => {
                            setDeleteCustomerState(customer);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                          Hapus Warga
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium">Meter Awal</p>
                <p className="font-mono font-semibold text-[#1A237E] mt-0.5">{customer.initialMeter} m³</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Status</p>
                <p className="font-semibold text-green-600 mt-0.5 text-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktif
                </p>
              </div>
            </div>

            <div className="mt-2 pt-3 border-t border-gray-100 flex justify-between items-center">
              <button 
                onClick={() => setHistoryCustomer(customer)}
                className="text-sm text-[#1A237E] font-medium hover:underline"
              >
                Lihat Riwayat
              </button>
              <button 
                onClick={() => setSelectedQR(customer.block)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors text-sm font-medium border border-gray-200"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedQR(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-heading font-bold text-[#1A237E]">QR Code Rumah</h3>
                <p className="text-gray-500 text-sm mt-1">Blok {selectedQR}</p>
              </div>

              <div className="flex justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <QRCodeSVG 
                  value={`aquasmart://meter/${selectedQR}`} 
                  size={200}
                  level="H"
                  fgColor="#1A237E"
                  imageSettings={{
                    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'></path></svg>",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 py-2.5 bg-[#1A237E] text-white rounded-xl font-medium hover:bg-[#283593] transition-colors">
                  Cetak
                </button>
                <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Bagikan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-heading font-bold text-[#1A237E] text-lg">
                  {editCustomer ? 'Edit Data Warga' : 'Tambah Data Warga'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditCustomer(null);
                    setNewCustomer({ name: '', block: '', number: '', phone: '', category: 'Rumah Tangga' });
                  }} 
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Budi Santoso"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Default</label>
                  <input 
                    type="text" 
                    value="Perum. Puri Nirwana Residence"
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blok</label>
                    <input 
                      type="text" 
                      placeholder="A"
                      value={newCustomer.block}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
                        setNewCustomer({...newCustomer, block: value});
                      }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-mono uppercase text-center"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor</label>
                    <input 
                      type="text" 
                      placeholder="01"
                      value={newCustomer.number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setNewCustomer({...newCustomer, number: value});
                      }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-mono text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
                    <select 
                      value={newCustomer.category}
                      onChange={(e) => setNewCustomer({...newCustomer, category: e.target.value})}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    >
                      <option value="Rumah Tangga">Rumah Tangga</option>
                      <option value="Niaga">Niaga</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. WhatsApp</label>
                    <input 
                      type="tel" 
                      placeholder="Contoh: 081234567890"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meter Awal (m³)</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newCustomer.initialMeter}
                      onChange={(e) => setNewCustomer({...newCustomer, initialMeter: Number(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">No. WhatsApp digunakan untuk mengirim notifikasi tagihan otomatis.</p>
              </div>
              
              <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditCustomer(null);
                    setNewCustomer({ name: '', block: '', number: '', phone: '', category: 'Rumah Tangga' });
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAddCustomer}
                  disabled={!newCustomer.name || !newCustomer.block || !newCustomer.number}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#1A237E] hover:bg-[#283593] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md shadow-[#1A237E]/20"
                >
                  {editCustomer ? 'Simpan Perubahan' : 'Simpan Data'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {viewCustomer && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-heading font-bold text-[#1A237E] text-lg">Detail Profil Warga</h3>
                <button onClick={() => setViewCustomer(null)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 shrink-0 rounded-full bg-gradient-to-br from-[#1A237E]/10 to-[#1A237E]/5 flex flex-col items-center justify-center text-[#1A237E] font-bold border border-[#1A237E]/10 leading-tight">
                    <span className="text-sm opacity-60 uppercase tracking-wider">{viewCustomer.block.split('-')[0]}</span>
                    <span className="text-2xl">{viewCustomer.block.split('-')[1]}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{viewCustomer.name}</h2>
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider mt-1.5 ${
                      viewCustomer.category === 'Niaga' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {viewCustomer.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Alamat Lengkap</p>
                      <p className="text-gray-900 font-medium mt-0.5">{settings.address}, Blok {viewCustomer.block}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nomor WhatsApp</p>
                      <p className="text-gray-900 font-medium mt-0.5">{viewCustomer.phone || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Meteran Awal</p>
                      <p className="text-gray-900 font-mono font-medium mt-0.5">{viewCustomer.initialMeter} m³</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-gray-100 flex justify-end bg-gray-50">
                <button 
                  onClick={() => setViewCustomer(null)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#1A237E] hover:bg-[#283593] rounded-xl transition-colors shadow-md shadow-[#1A237E]/20"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteCustomerState && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-xl mb-2">Hapus Data Warga?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Anda yakin ingin menghapus data warga <strong>{deleteCustomerState.name}</strong> (Blok {deleteCustomerState.block})? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteCustomerState(null)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteCustomer}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md shadow-red-600/20"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {historyCustomer && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#1A237E]/10 to-[#1A237E]/5 flex flex-col items-center justify-center text-[#1A237E] font-bold border border-[#1A237E]/10 leading-tight">
                    <span className="text-[10px] opacity-60 uppercase tracking-tighter">{historyCustomer.block.split('-')[0]}</span>
                    <span className="text-base">{historyCustomer.block.split('-')[1]}</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#1A237E] text-lg leading-tight">{historyCustomer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                        historyCustomer.category === 'Niaga' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {historyCustomer.category}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 font-medium">{historyCustomer.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-[#1A237E] hover:bg-gray-100 rounded-lg transition-colors" title="Download Laporan">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#1A237E] hover:bg-gray-100 rounded-lg transition-colors" title="Cetak">
                    <Printer className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-gray-200 mx-1"></div>
                  <button 
                    onClick={() => setHistoryCustomer(null)} 
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Activity className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Total Pemakaian</p>
                    </div>
                    <p className="text-2xl font-bold text-[#1A237E]">{(history[historyCustomer.id] || []).reduce((acc, curr) => acc + curr.usage, 0)} <span className="text-sm font-normal text-blue-400">m³</span></p>
                    <p className="text-[10px] text-blue-500 mt-1">Total sejak awal pemasangan</p>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Rata-rata/Bulan</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">
                      {((history[historyCustomer.id] || []).reduce((acc, curr) => acc + curr.usage, 0) / Math.max(1, (history[historyCustomer.id] || []).length)).toFixed(1)} 
                      <span className="text-sm font-normal text-emerald-400">m³</span>
                    </p>
                    <p className="text-[10px] text-emerald-500 mt-1">Berdasarkan data yang tersedia</p>
                  </div>

                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Tagihan Tertunda</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-700">{(history[historyCustomer.id] || []).filter(h => h.status === 'Belum Bayar').length} <span className="text-sm font-normal text-amber-400">Bulan</span></p>
                    <p className="text-[10px] text-amber-500 mt-1">
                      {(history[historyCustomer.id] || []).find(h => h.status === 'Belum Bayar')?.period || '-'}
                    </p>
                  </div>

                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Activity className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Meter Terakhir</p>
                    </div>
                    <p className="text-2xl font-bold text-indigo-700">{historyCustomer.lastMeterReading || historyCustomer.initialMeter} <span className="text-sm font-normal text-indigo-400">m³</span></p>
                    <p className="text-[10px] text-indigo-500 mt-1">Update: {historyCustomer.lastReadingDate || '-'}</p>
                  </div>
                </div>

                {/* Usage Chart */}
                <div className="glass-card p-5">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-[#1A237E] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                      Tren Pemakaian Air (m³)
                    </h4>
                    <select className="text-xs border-none bg-gray-100 rounded-lg px-2 py-1 outline-none font-medium text-gray-600">
                      <option>6 Bulan Terakhir</option>
                      <option>1 Tahun Terakhir</option>
                    </select>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(history[historyCustomer.id] || []).slice(0, 6).reverse().map(h => ({ name: h.period.split(' ')[0], usage: h.usage }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f9fafb' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="usage" radius={[4, 4, 0, 0]} barSize={40}>
                          {(history[historyCustomer.id] || []).slice(0, 6).reverse().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === (history[historyCustomer.id] || []).length - 1 ? '#D4AF37' : '#1A237E'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* History Table */}
                <div className="glass-card overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="font-bold text-[#1A237E] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      Riwayat Tagihan & Pembayaran
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Periode</th>
                          <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Meter (Awal-Akhir)</th>
                          <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Pakai</th>
                          <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Tagihan</th>
                          <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                          <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tgl Bayar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(history[historyCustomer.id] || []).map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="p-4">
                              <p className="text-sm font-bold text-gray-800">{record.period}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">ID: {record.id}</p>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                {record.startMeter} - {record.endMeter}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-sm font-bold text-[#1A237E]">{record.usage} <span className="text-[10px] font-normal text-gray-400">m³</span></span>
                            </td>
                            <td className="p-4 text-right">
                              <p className="text-sm font-bold text-gray-800">Rp {record.amount.toLocaleString('id-ID')}</p>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                record.status === 'Lunas' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {record.status === 'Lunas' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {record.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="text-xs text-gray-600">{record.date}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <p className="text-[10px] text-gray-400 italic">* Data diperbarui secara otomatis setiap kali ada pencatatan meter baru.</p>
                <button 
                  onClick={() => setHistoryCustomer(null)}
                  className="px-6 py-2 bg-[#1A237E] text-white rounded-xl text-sm font-bold hover:bg-[#283593] transition-all shadow-lg shadow-[#1A237E]/20"
                >
                  Tutup Riwayat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
