import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, QrCode, X, Edit2, Eye, MessageCircle, Trash2, AlertTriangle, Phone, MapPin, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { useSettings } from '../context/SettingsContext';

const mockCustomers = [
  { id: '1', name: 'Budi Santoso', block: 'A-01', category: 'Rumah Tangga', initialMeter: 120, phone: '081234567890' },
  { id: '2', name: 'Siti Aminah', block: 'A-02', category: 'Rumah Tangga', initialMeter: 85, phone: '081234567891' },
  { id: '3', name: 'Toko Makmur', block: 'B-01', category: 'Niaga', initialMeter: 450, phone: '081234567892' },
  { id: '4', name: 'Ahmad Dahlan', block: 'C-12', category: 'Rumah Tangga', initialMeter: 210, phone: '081234567893' },
  { id: '5', name: 'Warung Kopi', block: 'B-02', category: 'Niaga', initialMeter: 320, phone: '081234567894' },
];

type Customer = typeof mockCustomers[0];

export default function Customers() {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [customers, setCustomers] = useState(mockCustomers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', block: '', number: '', phone: '', category: 'Rumah Tangga' });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
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
      setCustomers(customers.map(c => c.id === editCustomer.id ? {
        ...c,
        name: newCustomer.name,
        block: `${newCustomer.block}-${newCustomer.number}`,
        category: newCustomer.category,
        phone: newCustomer.phone
      } : c));
      setEditCustomer(null);
    } else {
      const newId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
      setCustomers([
        { 
          id: newId, 
          name: newCustomer.name, 
          block: `${newCustomer.block}-${newCustomer.number}`, 
          category: newCustomer.category,
          initialMeter: 0,
          phone: newCustomer.phone
        },
        ...customers
      ]);
    }
    
    setShowAddModal(false);
    setNewCustomer({ name: '', block: '', number: '', phone: '', category: 'Rumah Tangga' });
  };

  const handleDeleteCustomer = () => {
    if (deleteCustomer) {
      setCustomers(customers.filter(c => c.id !== deleteCustomer.id));
      setDeleteCustomer(null);
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A237E]/10 to-[#1A237E]/5 flex items-center justify-center text-[#1A237E] font-bold text-lg border border-[#1A237E]/10">
                  {customer.block}
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
                              category: customer.category
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
                            setDeleteCustomer(customer);
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
              <button className="text-sm text-[#1A237E] font-medium hover:underline">Lihat Riwayat</button>
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
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blok</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: A"
                      value={newCustomer.block}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
                        setNewCustomer({...newCustomer, block: value});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: 01"
                      value={newCustomer.number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setNewCustomer({...newCustomer, number: value});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
                    <select 
                      value={newCustomer.category}
                      onChange={(e) => setNewCustomer({...newCustomer, category: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    >
                      <option value="Rumah Tangga">Rumah Tangga</option>
                      <option value="Niaga">Niaga</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. WhatsApp</label>
                  <input 
                    type="tel" 
                    placeholder="Contoh: 081234567890"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">Digunakan untuk mengirim notifikasi tagihan otomatis.</p>
                </div>
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A237E]/10 to-[#1A237E]/5 flex items-center justify-center text-[#1A237E] font-bold text-2xl border border-[#1A237E]/10">
                    {viewCustomer.block}
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
        {deleteCustomer && (
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
                Anda yakin ingin menghapus data warga <strong>{deleteCustomer.name}</strong> (Blok {deleteCustomer.block})? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteCustomer(null)}
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
    </div>
  );
}
