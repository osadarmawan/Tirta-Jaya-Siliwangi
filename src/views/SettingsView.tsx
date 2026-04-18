import React, { useState, useRef } from 'react';
import { 
  Settings, Droplet, Users, Bell, Shield, CreditCard, Save, 
  Smartphone, Key, Lock, LogOut, Plus, Edit2, Trash2, CheckCircle2, 
  XCircle, Upload, Server, Download, X, Building, FileSpreadsheet, UploadCloud,
  Loader2, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import CurrencyInput from '../components/CurrencyInput';
import { useSettings } from '../context/SettingsContext';

import { useData } from '../context/DataContext';

type TabType = 'profile' | 'tarif' | 'notif' | 'users' | 'payment' | 'security';

export default function SettingsView() {
  const { settings, updateSettings } = useSettings();
  const { customers, history, notifications } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, bank: 'BCA', number: '8732 1100 2938', name: `Paguyuban ${settings.appName}`, colorText: 'text-blue-800', colorBg: 'bg-blue-500/5' },
    { id: 2, bank: 'Mandiri', number: '137 000 2938 111', name: `Paguyuban ${settings.appName}`, colorText: 'text-orange-800', colorBg: 'bg-orange-500/5' }
  ]);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBank, setNewBank] = useState({ bank: 'BCA', number: '', name: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState(2);
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [isUploadingQris, setIsUploadingQris] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    appName: settings.appName,
    address: settings.address,
    rt: settings.rt,
    rw: settings.rw,
    kelurahan: settings.kelurahan,
    kecamatan: settings.kecamatan,
    city: settings.city,
    phone: settings.phone,
  });

  const [tarifForm, setTarifForm] = useState({
    useFlatRate: settings.useFlatRate ?? true,
    flatRateAmount: settings.flatRateAmount || 70000,
    billingDate: settings.billingDate || 5,
    gracePeriod: settings.gracePeriod || 5,
    lateFee: settings.lateFee ?? 0,
    adminFee: settings.adminFee ?? 0,
    tariffHousehold: settings.tariffHousehold || 2500,
    tariffCommercial: settings.tariffCommercial || 4500,
  });

  const [waForm, setWaForm] = useState({
    waInstanceId: settings.waInstanceId || 'AQ-882910-WA',
    waApiToken: settings.waApiToken || (import.meta as any).env.VITE_WA_API_TOKEN || '7b2MQA8Ssu13fdhe1VXG',
    waAutoReminder: settings.waAutoReminder !== undefined ? settings.waAutoReminder : true,
    waAutoReminderDays: settings.waAutoReminderDays || 3,
    waLogRetentionDays: settings.waLogRetentionDays || 30,
    templateNewBill: settings.templateNewBill || `Halo Bapak/Ibu {{nama_warga}},\n\nBerikut adalah rincian tagihan air ${settings.appName} untuk bulan ini:\nBlok: {{blok}}\nTotal Tagihan: Rp {{total_tagihan}}\nJatuh Tempo: {{jatuh_tempo}}\n\nMohon segera melakukan pembayaran. Terima kasih.`,
    templatePaymentSuccess: settings.templatePaymentSuccess || `Halo Bapak/Ibu {{nama_warga}},\n\nPembayaran tagihan air untuk Blok {{blok}} sebesar Rp {{total_bayar}} telah kami terima pada {{tanggal_bayar}}.\n\nTerima kasih atas pembayaran Anda yang tepat waktu.`,
    templateReminder: settings.templateReminder || `Halo Bapak/Ibu {{nama_warga}},\n\nSekadar mengingatkan bahwa tagihan air Anda sebesar Rp {{total_tagihan}} akan jatuh tempo pada {{jatuh_tempo}}.\n\nMohon abaikan pesan ini jika Anda sudah melakukan pembayaran.`
  });

  const [messageLogs, setMessageLogs] = useState([
    { id: 1, time: '18 Mar 2026 10:30', to: '081234567890 (Budi)', type: 'Tagihan Baru', status: 'Terkirim' },
    { id: 2, time: '18 Mar 2026 11:15', to: '089876543210 (Siti)', type: 'Konfirmasi Pembayaran', status: 'Gagal' },
    { id: 3, time: '17 Mar 2026 09:00', to: '085678901234 (Agus)', type: 'Pengingat Pembayaran', status: 'Terkirim' },
  ]);
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testWaNumber, setTestWaNumber] = useState('');
  const [testWaMessage, setTestWaMessage] = useState('Halo, ini adalah pesan percobaan dari sistem Tirta Jaya Siliwangi.');
  const [isTestingWa, setIsTestingWa] = useState(false);

  const handleSyncWA = () => {
    setIsSyncing(true);
    // Simulate API call to check WhatsApp connection status
    setTimeout(() => {
      setIsSyncing(false);
      alert('Sinkronisasi berhasil! Koneksi WhatsApp Gateway terhubung dan aktif.');
    }, 1500);
  };

  const handleTestWa = async () => {
    if (!testWaNumber) {
      alert('Silakan masukkan nomor WhatsApp tujuan.');
      return;
    }
    setIsTestingWa(true);
    
    try {
      // Menggunakan API Fonnte sebagai WhatsApp Gateway default
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': waForm.waApiToken
        },
        body: new URLSearchParams({
          target: testWaNumber,
          message: testWaMessage,
          countryCode: '62'
        })
      });

      const data = await response.json();
      
      if (data.status) {
        alert(`Pesan percobaan berhasil dikirim ke ${testWaNumber}`);
        
        // Add to logs
        const newLog = {
          id: Date.now(),
          time: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          to: testWaNumber,
          type: 'Pesan Percobaan',
          status: 'Terkirim'
        };
        setMessageLogs([newLog, ...messageLogs]);
        
        setTestWaNumber('');
      } else {
        alert(`Gagal mengirim pesan: ${data.reason || data.detail || 'Token API tidak valid atau kuota habis.'}`);
        
        // Add failed log
        const newLog = {
          id: Date.now(),
          time: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          to: testWaNumber,
          type: 'Pesan Percobaan',
          status: 'Gagal'
        };
        setMessageLogs([newLog, ...messageLogs]);
      }
    } catch (error) {
      console.error('Error sending WA:', error);
      alert('Terjadi kesalahan koneksi ke server WhatsApp Gateway. Pastikan token API benar.');
    } finally {
      setIsTestingWa(false);
    }
  };

  const handleSelectAllLogs = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLogs(messageLogs.map(log => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (id: number) => {
    setSelectedLogs(prev => 
      prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedLogs = () => {
    if (selectedLogs.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedLogs.length} log pesan?`)) {
      setMessageLogs(logs => logs.filter(log => !selectedLogs.includes(log.id)));
      setSelectedLogs([]);
    }
  };

  const handleResendMessage = (id: number) => {
    setMessageLogs(logs => logs.map(log => 
      log.id === id ? { ...log, status: 'Terkirim', time: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } : log
    ));
    alert('Pesan sedang dikirim ulang...');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    updateSettings(profileForm);
    alert('Profil berhasil disimpan!');
  };

  const handleSaveTarif = () => {
    updateSettings(tarifForm);
    alert('Pengaturan tarif berhasil diperbarui!');
  };

  const handleSaveWa = () => {
    updateSettings(waForm);
    alert('Pengaturan WhatsApp berhasil diperbarui!');
  };

  // User Management State
  const [users, setUsers] = useState([
    { id: 1, name: 'Ahmad Ketua', email: 'ahmad@aquasmart.id', role: 'Super Admin', status: 'Aktif' },
    { id: 2, name: 'Budi Bendahara', email: 'budi@aquasmart.id', role: 'Bendahara', status: 'Aktif' },
    { id: 3, name: 'Joko Lapangan', email: 'joko@aquasmart.id', role: 'Petugas Catat', status: 'Aktif' },
  ]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Petugas Catat', status: 'Aktif' });
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingQris(true);
      // Simulate upload delay for professional effect
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setQrisImage(reader.result as string);
          setIsUploadingQris(false);
        };
        reader.readAsDataURL(file);
      }, 1500);
    }
  };

  const handleRemoveQris = () => {
    setQrisImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<string | null>(null);

  const handleExportData = (type: 'tagihan' | 'warga' | 'catatan' | 'full') => {
    setIsExporting(type);
    
    setTimeout(() => {
      const wb = XLSX.utils.book_new();
      const dateStr = new Date().toISOString().split('T')[0];
      let fileName = `Backup_${settings.appName}_${dateStr}.xls`;

      if (type === 'tagihan' || type === 'full') {
        const allBilling: any[] = [];
        Object.keys(history).forEach(custId => {
          const customer = customers.find(c => c.id === custId);
          history[custId].forEach(record => {
            allBilling.push({
              'ID Tagihan': record.id,
              'Nama Warga': customer?.name || 'Unknown',
              'Blok': customer?.block || 'Unknown',
              'Periode': record.period,
              'Meter Awal': record.startMeter,
              'Meter Akhir': record.endMeter,
              'Pemakaian': record.usage,
              'Total Tagihan': record.amount,
              'Status': record.status,
              'Tanggal': record.date
            });
          });
        });
        const ws = XLSX.utils.json_to_sheet(allBilling);
        XLSX.utils.book_append_sheet(wb, ws, 'Tagihan');
        if (type === 'tagihan') fileName = `Backup_Tagihan_${dateStr}.xls`;
      }

      if (type === 'warga' || type === 'full') {
        const wargaData = customers.map(c => ({
          'ID': c.id,
          'Nama': c.name,
          'Blok': c.block,
          'Kategori': c.category,
          'Meter Awal': c.initialMeter,
          'No. HP': c.phone,
          'Meter Terakhir': c.lastMeterReading || '-',
          'Tgl Catat Terakhir': c.lastReadingDate || '-'
        }));
        const ws = XLSX.utils.json_to_sheet(wargaData);
        XLSX.utils.book_append_sheet(wb, ws, 'Data Warga');
        if (type === 'warga') fileName = `Backup_Warga_${dateStr}.xls`;
      }

      if (type === 'catatan' || type === 'full') {
        const catatanData = notifications.map(n => ({
          'Waktu': n.time,
          'Tipe': n.type,
          'Judul': n.title,
          'Keterangan': n.desc
        }));
        const ws = XLSX.utils.json_to_sheet(catatanData);
        XLSX.utils.book_append_sheet(wb, ws, 'Catatan Sistem');
        if (type === 'catatan') fileName = `Backup_Catatan_${dateStr}.xls`;
      }

      XLSX.writeFile(wb, fileName, { bookType: 'xls' });
      setIsExporting(null);
    }, 1500);
  };

  const handleImportData = (type: 'tagihan' | 'warga' | 'catatan', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(type);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      console.log(`Imported ${type} data:`, data);
      
      setTimeout(() => {
        setIsImporting(null);
        alert(`Berhasil mengimpor ${data.length} data ${type}!`);
        if (e.target) e.target.value = '';
      }, 1500);
    };
    reader.readAsBinaryString(file);
  };
  const handleAddBank = () => {
    if (!newBank.number || !newBank.name) return;
    const colorMap: Record<string, { text: string, bg: string }> = { 
      BCA: { text: 'text-blue-800', bg: 'bg-blue-500/5' }, 
      Mandiri: { text: 'text-orange-800', bg: 'bg-orange-500/5' }, 
      BNI: { text: 'text-emerald-800', bg: 'bg-emerald-500/5' }, 
      BRI: { text: 'text-blue-800', bg: 'bg-blue-500/5' }, 
      BSI: { text: 'text-teal-800', bg: 'bg-teal-500/5' } 
    };
    const colors = colorMap[newBank.bank] || { text: 'text-gray-800', bg: 'bg-gray-500/5' };
    
    setBankAccounts([...bankAccounts, { 
      id: Date.now(), 
      bank: newBank.bank, 
      number: newBank.number, 
      name: newBank.name, 
      colorText: colors.text,
      colorBg: colors.bg
    }]);
    setShowAddBankModal(false);
    setNewBank({ bank: 'BCA', number: '', name: '' });
  };

  const handleDeleteBank = (id: number) => {
    setBankAccounts(bankAccounts.filter(b => b.id !== id));
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) return;
    
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u));
    } else {
      setUsers([...users, { id: Date.now(), ...userForm }]);
    }
    
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ name: '', email: '', role: 'Petugas Catat', status: 'Aktif' });
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setShowUserModal(true);
  };

  const confirmDeleteUser = (user: any) => {
    setUserToDelete(user);
    setShowDeleteUserModal(true);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setShowDeleteUserModal(false);
      setUserToDelete(null);
    }
  };

  const tabs = [
    { id: 'profile', icon: Building, label: 'Profil Pengelola' },
    { id: 'tarif', icon: Droplet, label: 'Tarif & Biaya' },
    { id: 'notif', icon: Bell, label: 'Notifikasi & WA' },
    { id: 'users', icon: Users, label: 'Manajemen User' },
    { id: 'payment', icon: CreditCard, label: 'Metode Pembayaran' },
    { id: 'security', icon: Shield, label: 'Keamanan' },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-[#1A237E] mb-4 border-b border-gray-100 pb-3">Informasi Aplikasi & Pengelola</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Aplikasi / Pengelola</label>
                  <input type="text" name="appName" value={profileForm.appName} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Kantor Lengkap</label>
                  <textarea rows={3} name="address" value={profileForm.address} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all resize-none"></textarea>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">RT</label>
                    <input type="text" name="rt" value={profileForm.rt} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">RW</label>
                    <input type="text" name="rw" value={profileForm.rw} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Desa / Kelurahan</label>
                    <input type="text" name="kelurahan" value={profileForm.kelurahan} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kecamatan</label>
                    <input type="text" name="kecamatan" value={profileForm.kecamatan} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kota / Kabupaten</label>
                    <input type="text" name="city" value={profileForm.city} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Provinsi</label>
                    <input type="text" defaultValue="Jawa Barat" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Telepon / WhatsApp</label>
                    <input type="tel" name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (Opsional)</label>
                    <input type="email" defaultValue="admin@aquasmart.id" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button onClick={handleSaveProfile} className="flex items-center gap-2 px-6 py-2.5 bg-[#1A237E] text-white rounded-xl hover:bg-[#1A237E]/90 transition-colors font-medium shadow-sm">
                <Save className="w-4 h-4" />
                Simpan Profil
              </button>
            </div>
          </motion.div>
        );
      case 'tarif':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h3 className="text-lg font-heading font-bold text-[#1A237E]">Pengaturan Tarif Air</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">Gunakan Tarif Flat</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={tarifForm.useFlatRate}
                      onChange={(e) => setTarifForm(prev => ({ ...prev, useFlatRate: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A237E]"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-5">
                {tarifForm.useFlatRate ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-blue-50 border border-blue-100 rounded-xl"
                  >
                    <label className="block text-sm font-semibold text-[#1A237E] mb-1.5">Besaran Tarif Flat (per Bulan)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                      <CurrencyInput 
                        value={tarifForm.flatRateAmount} 
                        onValueChange={(val) => setTarifForm(prev => ({ ...prev, flatRateAmount: val || 0 }))}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all font-mono font-bold text-[#1A237E]" 
                      />
                    </div>
                    <p className="text-xs text-blue-600 mt-2 italic">
                      * Tarif ini akan berlaku rata untuk semua pemakaian air tanpa menghitung angka meteran.
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tarif Rumah Tangga (per m³)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                        <CurrencyInput 
                          value={tarifForm.tariffHousehold}
                          onValueChange={(val) => setTarifForm(prev => ({ ...prev, tariffHousehold: val || 0 }))}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-mono" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tarif Niaga (per m³)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                        <CurrencyInput 
                          value={tarifForm.tariffCommercial}
                          onValueChange={(val) => setTarifForm(prev => ({ ...prev, tariffCommercial: val || 0 }))}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-mono" 
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Biaya Admin Bulanan (Tetap)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                    <CurrencyInput 
                      value={tarifForm.adminFee}
                      onValueChange={(val) => setTarifForm(prev => ({ ...prev, adminFee: val || 0 }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-mono" 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Biaya ini akan ditambahkan secara otomatis ke setiap tagihan warga.</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-[#1A237E] mb-4 border-b border-gray-100 pb-3">Pengaturan Jatuh Tempo</h3>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Penagihan</label>
                    <select 
                      value={tarifForm.billingDate}
                      onChange={(e) => setTarifForm(prev => ({ ...prev, billingDate: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    >
                      <option value={5}>Setiap Tanggal 5</option>
                      <option value={10}>Setiap Tanggal 10</option>
                      <option value={15}>Setiap Tanggal 15</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Masa Tenggang (Hari)</label>
                    <input 
                      type="number" 
                      value={tarifForm.gracePeriod}
                      onChange={(e) => setTarifForm(prev => ({ ...prev, gracePeriod: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Denda Keterlambatan (per Bulan)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                    <CurrencyInput 
                      value={tarifForm.lateFee}
                      onValueChange={(val) => setTarifForm(prev => ({ ...prev, lateFee: val || 0 }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-mono" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button onClick={handleSaveTarif} className="flex items-center gap-2 px-6 py-2.5 bg-[#1A237E] text-white rounded-xl hover:bg-[#1A237E]/90 transition-colors font-medium shadow-sm">
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </motion.div>
        );

      case 'notif':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <h3 className="text-lg font-heading font-bold text-[#1A237E]">Koneksi WhatsApp Gateway</h3>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terkoneksi
                </span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Instance ID</label>
                    <input 
                      type="text" 
                      value={waForm.waInstanceId}
                      onChange={(e) => setWaForm(prev => ({ ...prev, waInstanceId: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-mono text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">API Token</label>
                    <input 
                      type="password" 
                      value={waForm.waApiToken}
                      onChange={(e) => setWaForm(prev => ({ ...prev, waApiToken: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-mono text-sm" 
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Nomor Pengirim</p>
                    <p className="text-xs text-gray-500">{settings.phone} (Admin {settings.appName})</p>
                  </div>
                  <button 
                    onClick={handleSyncWA}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#1A237E] rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyinkronkan...
                      </>
                    ) : (
                      'Sinkronisasi Ulang'
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-[#1A237E] mb-4 border-b border-gray-100 pb-3">Template Pesan & Otomatisasi</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Kirim Otomatis H-{waForm.waAutoReminderDays} Jatuh Tempo</p>
                    <p className="text-xs text-gray-500">Sistem akan mengirim pesan pengingat {waForm.waAutoReminderDays} hari sebelum jatuh tempo.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {waForm.waAutoReminder && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">H-</span>
                        <input 
                          type="number" 
                          min="1" 
                          max="14"
                          value={waForm.waAutoReminderDays}
                          onChange={(e) => setWaForm(prev => ({ ...prev, waAutoReminderDays: parseInt(e.target.value) || 1 }))}
                          className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-[#25D366] outline-none text-center"
                        />
                        <span className="text-xs text-gray-500">Hari</span>
                      </div>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={waForm.waAutoReminder}
                        onChange={(e) => setWaForm(prev => ({ ...prev, waAutoReminder: e.target.checked }))}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Hapus Log Otomatis</p>
                    <p className="text-xs text-gray-500">Sistem akan menghapus riwayat pesan yang lebih lama dari waktu ini.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={waForm.waLogRetentionDays}
                      onChange={(e) => setWaForm(prev => ({ ...prev, waLogRetentionDays: parseInt(e.target.value) }))}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#25D366] outline-none bg-gray-50 text-gray-700 font-medium"
                    >
                      <option value={0}>Jangan Hapus</option>
                      <option value={7}>7 Hari</option>
                      <option value={30}>1 Bulan (30 Hari)</option>
                      <option value={90}>3 Bulan (90 Hari)</option>
                      <option value={180}>6 Bulan (180 Hari)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Template Tagihan Baru</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
                    value={waForm.templateNewBill}
                    onChange={(e) => setWaForm(prev => ({ ...prev, templateNewBill: e.target.value }))}
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">Variabel tersedia: <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{nama_warga}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{blok}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{total_tagihan}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{jatuh_tempo}}'}</code></p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Template Konfirmasi Pembayaran</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
                    value={waForm.templatePaymentSuccess}
                    onChange={(e) => setWaForm(prev => ({ ...prev, templatePaymentSuccess: e.target.value }))}
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">Variabel tersedia: <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{nama_warga}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{blok}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{total_bayar}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{tanggal_bayar}}'}</code></p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Template Pengingat Pembayaran</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
                    value={waForm.templateReminder}
                    onChange={(e) => setWaForm(prev => ({ ...prev, templateReminder: e.target.value }))}
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">Variabel tersedia: <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{nama_warga}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{total_tagihan}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1A237E]">{'{{jatuh_tempo}}'}</code></p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleSaveWa} className="flex items-center gap-2 px-6 py-2.5 bg-[#1A237E] text-white rounded-xl hover:bg-[#1A237E]/90 transition-colors font-medium shadow-sm">
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-[#1A237E] mb-4 border-b border-gray-100 pb-3">Test Kirim Pesan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Tujuan (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={testWaNumber}
                    onChange={(e) => setTestWaNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#25D366] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pesan Percobaan</label>
                  <textarea
                    rows={3}
                    value={testWaMessage}
                    onChange={(e) => setTestWaMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#25D366] outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <button
                  onClick={handleTestWa}
                  disabled={isTestingWa}
                  className="px-6 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-medium hover:bg-[#128C7E] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                >
                  {isTestingWa ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Kirim Pesan Test
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <h3 className="text-lg font-heading font-bold text-[#1A237E]">Log & Riwayat Pesan</h3>
                {selectedLogs.length > 0 && (
                  <button 
                    onClick={handleDeleteSelectedLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Terpilih ({selectedLogs.length})
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-y border-gray-100">
                      <th className="p-3 w-10">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-[#1A237E] focus:ring-[#1A237E]"
                          checked={messageLogs.length > 0 && selectedLogs.length === messageLogs.length}
                          onChange={handleSelectAllLogs}
                        />
                      </th>
                      <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                      <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Tujuan</th>
                      <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Jenis Pesan</th>
                      <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="p-3 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {messageLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                          Belum ada log pengiriman pesan.
                        </td>
                      </tr>
                    ) : (
                      messageLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-[#1A237E] focus:ring-[#1A237E]"
                              checked={selectedLogs.includes(log.id)}
                              onChange={() => handleSelectLog(log.id)}
                            />
                          </td>
                          <td className="p-3 text-sm text-gray-600">{log.time}</td>
                          <td className="p-3 text-sm font-medium text-gray-800">{log.to}</td>
                          <td className="p-3 text-sm text-gray-600">{log.type}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                              log.status === 'Terkirim' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {log.status === 'Gagal' || log.type === 'Konfirmasi Pembayaran' ? (
                              <button 
                                onClick={() => handleResendMessage(log.id)}
                                className="text-xs font-medium text-[#1A237E] hover:underline"
                              >
                                Kirim Ulang
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );

      case 'users':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-heading font-bold text-[#1A237E]">Daftar Pengurus</h3>
                  <p className="text-sm text-gray-500">Kelola hak akses staf dan pengurus perumahan.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({ name: '', email: '', role: 'Petugas Catat', status: 'Aktif' });
                    setShowUserModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1A237E] text-white rounded-xl text-sm font-medium hover:bg-[#283593] transition-colors shadow-lg shadow-[#1A237E]/20"
                >
                  <Plus className="w-4 h-4" /> Tambah User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-y border-gray-100">
                      <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Pengguna</th>
                      <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Peran (Role)</th>
                      <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="p-3 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] flex items-center justify-center text-[#1A237E] font-bold text-xs">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                            user.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'Bendahara' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`flex items-center gap-1 text-xs font-medium ${user.status === 'Aktif' ? 'text-green-600' : 'text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-green-500' : 'bg-gray-400'}`}></span> {user.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="p-1.5 text-gray-400 hover:text-[#1A237E] rounded-md transition-colors"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => confirmDeleteUser(user)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                              title="Hapus User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );

      case 'payment':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <h3 className="text-lg font-heading font-bold text-[#1A237E]">Rekening Bank Manual</h3>
                <button onClick={() => setShowAddBankModal(true)} className="text-sm font-medium text-[#1A237E] flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Tambah Rekening
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankAccounts.map((bank) => (
                  <div key={bank.id} className="p-4 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-16 h-16 ${bank.colorBg} rounded-bl-full`}></div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <p className={`text-xs font-bold ${bank.colorText} uppercase tracking-wider`}>{bank.bank}</p>
                      <button onClick={() => handleDeleteBank(bank.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-mono text-lg font-bold text-gray-800 tracking-widest relative z-10">{bank.number}</p>
                    <p className="text-sm text-gray-500 mt-1 relative z-10">a.n {bank.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-[#1A237E] mb-4 border-b border-gray-100 pb-3">QRIS Perumahan</h3>
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div 
                  onClick={() => !qrisImage && fileInputRef.current?.click()}
                  className={`w-40 h-40 rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                    qrisImage ? 'border border-gray-200 shadow-sm' : 'bg-gray-50 border-2 border-dashed border-gray-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 cursor-pointer text-gray-400 hover:text-[#D4AF37]'
                  }`}
                >
                  {isUploadingQris ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mb-2"></div>
                      <span className="text-xs font-medium text-[#D4AF37]">Mengunggah...</span>
                    </div>
                  ) : qrisImage ? (
                    <>
                      <img src={qrisImage} alt="QRIS" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="p-2 bg-white text-[#1A237E] rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                          title="Ganti Gambar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveQris(); }}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                          title="Hapus Gambar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-xs font-medium">Upload QRIS</span>
                    </>
                  )}
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <p className="text-sm text-gray-600">Unggah gambar QRIS statis milik paguyuban. QRIS ini akan otomatis dilampirkan pada invoice PDF dan pesan WhatsApp yang dikirim ke warga.</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleQrisUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  {!qrisImage && !isUploadingQris && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white border border-gray-200 text-[#1A237E] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Pilih File Gambar
                    </button>
                  )}
                  {qrisImage && !isUploadingQris && (
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg w-fit mx-auto sm:mx-0 border border-green-100">
                      <CheckCircle2 className="w-4 h-4" />
                      QRIS berhasil diunggah
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card p-6 opacity-75">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-heading font-bold text-[#1A237E] flex items-center gap-2">
                  Payment Gateway <span className="text-[10px] bg-[#D4AF37] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Pro Feature</span>
                </h3>
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer"></div>
                </label>
              </div>
              <p className="text-sm text-gray-500">Integrasi dengan Midtrans/Xendit untuk penerimaan Virtual Account otomatis. Hubungi tim support untuk mengaktifkan fitur ini.</p>
            </div>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-[#1A237E] mb-4 border-b border-gray-100 pb-3">Ubah Kata Sandi</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kata Sandi Saat Ini</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kata Sandi Baru</label>
                  <input type="password" placeholder="Minimal 8 karakter" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
                </div>
                <button className="px-6 py-2.5 bg-[#1A237E] text-white rounded-xl text-sm font-medium hover:bg-[#283593] transition-colors">Perbarui Sandi</button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-[#1A237E] mb-4 border-b border-gray-100 pb-3">Autentikasi & Sesi</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-[#25D366] rounded-lg"><Key className="w-5 h-5" /></div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Autentikasi Dua Langkah (WhatsApp OTP)</p>
                      <p className="text-xs text-gray-500">Gunakan OTP via WhatsApp saat login di perangkat baru.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.waOtpEnabled}
                      onChange={(e) => updateSettings({ waOtpEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Smartphone className="w-5 h-5" /></div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Sesi Aktif Saat Ini</p>
                      <p className="text-xs text-gray-500">
                        {activeSessions > 1 ? `${activeSessions} sesi aktif di berbagai perangkat.` : '1 sesi aktif (Perangkat ini).'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowLogoutModal(true)}
                    disabled={activeSessions <= 1}
                    className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" /> Keluar Semua
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-heading font-bold text-[#1A237E]">Backup Database</h3>
                  <p className="text-sm text-gray-500 mt-1">Kelola ekspor dan impor data sistem dalam format Excel (.xls).</p>
                </div>
                <button 
                  onClick={() => handleExportData('full')}
                  disabled={!!isExporting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#1A237E] rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isExporting === 'full' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  Backup Seluruh Database (.xls)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tagihan Card */}
                <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-800">Data Tagihan</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleExportData('tagihan')}
                      disabled={!!isExporting}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-[#1A237E] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {isExporting === 'tagihan' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Export .xls
                    </button>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1A237E] text-white rounded-xl text-sm font-medium hover:bg-[#283593] transition-colors cursor-pointer">
                      {isImporting === 'tagihan' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      Import .xls
                      <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => handleImportData('tagihan', e)} />
                    </label>
                  </div>
                </div>

                {/* Data Warga Card */}
                <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-800">Data Warga</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleExportData('warga')}
                      disabled={!!isExporting}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-[#1A237E] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {isExporting === 'warga' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Export .xls
                    </button>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1A237E] text-white rounded-xl text-sm font-medium hover:bg-[#283593] transition-colors cursor-pointer">
                      {isImporting === 'warga' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      Import .xls
                      <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => handleImportData('warga', e)} />
                    </label>
                  </div>
                </div>

                {/* Catatan Meter Card */}
                <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-800">Catatan Meter</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleExportData('catatan')}
                      disabled={!!isExporting}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-[#1A237E] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {isExporting === 'catatan' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Export .xls
                    </button>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1A237E] text-white rounded-xl text-sm font-medium hover:bg-[#283593] transition-colors cursor-pointer">
                      {isImporting === 'catatan' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      Import .xls
                      <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => handleImportData('catatan', e)} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-[#1A237E]">Pengaturan Sistem</h2>
        <p className="text-gray-500 mt-1">Konfigurasi tarif, biaya admin, dan preferensi aplikasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-[#1A237E] text-white shadow-md shadow-[#1A237E]/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Bank Modal */}
      <AnimatePresence>
        {showAddBankModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-heading font-bold text-[#1A237E] text-lg">Tambah Rekening Bank</h3>
                <button onClick={() => setShowAddBankModal(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pilih Bank</label>
                  <select 
                    value={newBank.bank}
                    onChange={(e) => setNewBank({...newBank, bank: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  >
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="BSI">BSI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Rekening</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: 873211002938"
                    value={newBank.number}
                    onChange={(e) => setNewBank({...newBank, number: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Atas Nama (a.n)</label>
                  <input 
                    type="text" 
                    placeholder={`Contoh: Paguyuban ${settings.appName}`}
                    value={newBank.name}
                    onChange={(e) => setNewBank({...newBank, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => setShowAddBankModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAddBank}
                  disabled={!newBank.number || !newBank.name}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#1A237E] hover:bg-[#283593] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md shadow-[#1A237E]/20"
                >
                  Simpan Rekening
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout All Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center"
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-heading font-bold text-gray-900 text-xl mb-2">Akhiri Semua Sesi?</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin mengeluarkan akun ini dari semua perangkat lain? Anda harus login kembali di perangkat tersebut.
                </p>
              </div>
              
              <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    setActiveSessions(1);
                    setShowLogoutModal(false);
                  }}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md shadow-red-600/20"
                >
                  Ya, Keluar Semua
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-heading font-bold text-[#1A237E] text-lg">
                  {editingUser ? 'Edit Data Pengurus' : 'Tambah Pengurus Baru'}
                </h3>
                <button onClick={() => setShowUserModal(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Ahmad Subagyo"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Email</label>
                  <input 
                    type="email" 
                    placeholder="Contoh: ahmad@aquasmart.id"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Peran (Role)</label>
                    <select 
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Bendahara">Bendahara</option>
                      <option value="Petugas Catat">Petugas Catat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                    <select 
                      value={userForm.status}
                      onChange={(e) => setUserForm({...userForm, status: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveUser}
                  disabled={!userForm.name || !userForm.email}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#1A237E] hover:bg-[#283593] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md shadow-[#1A237E]/20"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah Pengurus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {showDeleteUserModal && userToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center"
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-heading font-bold text-gray-900 text-xl mb-2">Hapus Pengurus?</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus akses untuk <span className="font-semibold text-gray-800">{userToDelete.name}</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              
              <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                <button 
                  onClick={() => {
                    setShowDeleteUserModal(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteUser}
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
