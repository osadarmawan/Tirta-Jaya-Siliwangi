import React, { useState, useMemo } from 'react';
import { FileText, Search, Download, Send, CheckCircle2, Clock, AlertCircle, Loader2, Eye, X, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSettings } from '../context/SettingsContext';
import { useData, HistoryRecord } from '../context/DataContext';

export default function Billing() {
  const { settings } = useSettings();
  const { customers, history, updateReadingStatus } = useData();
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sendingWAId, setSendingWAId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [massSendStatus, setMassSendStatus] = useState<{
    isOpen: boolean;
    step: 'preview' | 'sending' | 'summary';
    progress: number;
    total: number;
    success: number;
    fail: number;
    currentName: string;
    logs: { name: string; status: 'success' | 'fail'; message: string }[];
  }>({
    isOpen: false,
    step: 'preview',
    progress: 0,
    total: 0,
    success: 0,
    fail: 0,
    currentName: '',
    logs: []
  });
  const [filterDay, setFilterDay] = useState<string>('Semua');
  const [filterMonth, setFilterMonth] = useState<string>('Semua');
  const [filterYear, setFilterYear] = useState<string>('Semua');

  const tabs = ['Semua', 'Belum Bayar', 'Proses', 'Lunas', 'Terlambat'];

  const allInvoices = useMemo(() => {
    const invoices: any[] = [];
    Object.entries(history as Record<string, HistoryRecord[]>).forEach(([customerId, records]) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      records.forEach(record => {
        invoices.push({
          id: record.id,
          invoiceNo: `INV-${record.date.replace(/-/g, '').substring(2, 6)}-${customer.id.padStart(3, '0')}`,
          customerId: customer.id,
          name: customer.name,
          block: customer.block,
          amount: record.amount,
          status: record.status,
          date: new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          rawDate: record.date,
          reading: record.endMeter,
          usage: record.usage,
          phone: customer.phone
        });
      });
    });
    // Sort by date descending
    return invoices.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
  }, [history, customers]);

  const filteredInvoices = allInvoices.filter(inv => {
    const matchesTab = activeTab === 'Semua' || inv.status === activeTab;
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.block.toLowerCase().includes(searchTerm.toLowerCase());
    
    const date = new Date(inv.rawDate);
    const matchesDay = filterDay === 'Semua' || date.getDate().toString() === filterDay;
    const matchesMonth = filterMonth === 'Semua' || (date.getMonth() + 1).toString() === filterMonth;
    const matchesYear = filterYear === 'Semua' || date.getFullYear().toString() === filterYear;

    return matchesTab && matchesSearch && matchesDay && matchesMonth && matchesYear;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setActiveTab('Semua');
    setSearchTerm('');
    setFilterDay('Semua');
    setFilterMonth('Semua');
    setFilterYear('Semua');
    setSelectedInvoices([]);
  };

  const handleMarkAsPaid = async (customerId: string, readingId: string) => {
    setProcessingId(readingId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateReadingStatus(customerId, readingId, 'Lunas');
    setProcessingId(null);
  };

  const handleDownloadPDF = (inv: any) => {
    setDownloadingId(inv.id);
    
    setTimeout(() => {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(26, 35, 126); // #1A237E
      doc.text(settings.appName, 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(settings.address, 14, 30);
      doc.text(`Telp: ${settings.phone}`, 14, 35);
      
      // Invoice Title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('INVOICE TAGIHAN AIR', 14, 50);
      
      // Invoice Details
      doc.setFontSize(11);
      doc.text(`No. Invoice : ${inv.invoiceNo}`, 14, 60);
      doc.text(`Tanggal     : ${inv.date}`, 14, 66);
      doc.text(`Status      : ${inv.status}`, 14, 72);
      
      // Customer Details
      doc.text(`Nama Warga  : ${inv.name}`, 120, 60);
      doc.text(`Blok Rumah  : ${inv.block}`, 120, 66);
      
      // Table
      (doc as any).autoTable({
        startY: 85,
        head: [['Deskripsi', 'Jumlah']],
        body: [
          [`Penggunaan Air (${inv.usage} m³)`, `Rp ${inv.amount.toLocaleString('id-ID')}`],
          ['Biaya Admin', `Rp ${settings.adminFee.toLocaleString('id-ID')}`],
          ['Denda Keterlambatan', inv.status === 'Terlambat' ? `Rp ${settings.lateFee.toLocaleString('id-ID')}` : 'Rp 0'],
        ],
        foot: [['Total Tagihan', `Rp ${(inv.amount + settings.adminFee + (inv.status === 'Terlambat' ? settings.lateFee : 0)).toLocaleString('id-ID')}`]],
        theme: 'grid',
        headStyles: { fillColor: [26, 35, 126] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      });
      
      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Pembayaran dapat dilakukan melalui transfer ke:', 14, finalY + 20);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`BCA: 8732 1100 2938 a.n Paguyuban ${settings.appName}`, 14, finalY + 28);
      doc.text(`Mandiri: 137 000 2938 111 a.n Paguyuban ${settings.appName}`, 14, finalY + 34);
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Terima kasih atas pembayaran tepat waktu Anda.', 14, finalY + 50);
      
      doc.save(`Invoice_${inv.invoiceNo}_${inv.name.replace(/\s+/g, '_')}.pdf`);
      setDownloadingId(null);
    }, 1200);
  };

  const handleSendWA = async (inv: any) => {
    setSendingWAId(inv.id);
    
    const amount = settings.useFlatRate ? settings.flatRateAmount : inv.amount;
    const total = amount + settings.adminFee + (inv.status === 'Terlambat' ? settings.lateFee : 0);
    const dueDate = new Date();
    dueDate.setDate(settings.billingDate + settings.gracePeriod);
    const dueDateStr = dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const paymentDateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const invoiceLink = `${window.location.origin}/invoice/${inv.id}`;

    let template = '';
    if (inv.status === 'Lunas') {
      template = settings.templatePaymentSuccess;
    } else if (inv.status === 'Terlambat') {
      template = settings.templateReminder;
    } else {
      template = settings.templateNewBill;
    }

    const message = template
      .replace(/{{nama_warga}}/g, `*${inv.name}*`)
      .replace(/{{blok}}/g, `*${inv.block}*`)
      .replace(/{{total_tagihan}}/g, `*Rp ${total.toLocaleString('id-ID')}*`)
      .replace(/{{jatuh_tempo}}/g, `*${dueDateStr}*`)
      .replace(/{{total_bayar}}/g, `*Rp ${total.toLocaleString('id-ID')}*`)
      .replace(/{{tanggal_bayar}}/g, `*${paymentDateStr}*`)
      .replace(/{{link_invoice}}/g, invoiceLink);

    // Format phone number for WhatsApp (must start with 62)
    let phone = inv.phone || '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.length > 0 && !cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }

    if (!cleaned) {
      alert('Nomor WhatsApp tidak valid atau tidak ditemukan.');
      setSendingWAId(null);
      return;
    }

    try {
      // If we have an API token, use Fonnte for direct sending
      if (settings.waApiToken && settings.waApiToken !== '7b2MQA8Ssu13fdhe1VXG') {
        const response = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': settings.waApiToken
          },
          body: new URLSearchParams({
            target: cleaned,
            message: message,
            countryCode: '62'
          })
        });
        
        const data = await response.json();
        if (data.status) {
          alert(`Invoice berhasil dikirim ke WhatsApp ${inv.name}`);
        } else {
          // Fallback to wa.me if API fails
          window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank');
        }
      } else {
        // Default to wa.me
        window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank');
      }
    } catch (error) {
      console.error('Error sending WA:', error);
      // Fallback to wa.me
      window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank');
    } finally {
      setSendingWAId(null);
    }
  };

  const handleSendMassalWA = async () => {
    const invoicesToSend = selectedInvoices.length > 0 
      ? filteredInvoices.filter(inv => selectedInvoices.includes(inv.id))
      : filteredInvoices;

    if (invoicesToSend.length === 0) return;

    setMassSendStatus({
      isOpen: true,
      step: 'preview',
      progress: 0,
      total: invoicesToSend.length,
      success: 0,
      fail: 0,
      currentName: '',
      logs: []
    });
  };

  const startMassSending = async () => {
    const invoicesToSend = selectedInvoices.length > 0 
      ? filteredInvoices.filter(inv => selectedInvoices.includes(inv.id))
      : filteredInvoices;
    
    setMassSendStatus(prev => ({ ...prev, step: 'sending' }));

    let successCount = 0;
    let failCount = 0;
    const newLogs: typeof massSendStatus.logs = [];

    for (let i = 0; i < invoicesToSend.length; i++) {
      const inv = invoicesToSend[i];
      setMassSendStatus(prev => ({ 
        ...prev, 
        currentName: inv.name,
        progress: Math.round(((i) / invoicesToSend.length) * 100)
      }));

      const amount = settings.useFlatRate ? settings.flatRateAmount : inv.amount;
      const total = amount + settings.adminFee + (inv.status === 'Terlambat' ? settings.lateFee : 0);
      const dueDate = new Date();
      dueDate.setDate(settings.billingDate + settings.gracePeriod);
      const dueDateStr = dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const paymentDateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const invoiceLink = `${window.location.origin}/invoice/${inv.id}`;

      let template = '';
      if (inv.status === 'Lunas') {
        template = settings.templatePaymentSuccess;
      } else if (inv.status === 'Terlambat') {
        template = settings.templateReminder;
      } else {
        template = settings.templateNewBill;
      }

      const message = template
        .replace(/{{nama_warga}}/g, `*${inv.name}*`)
        .replace(/{{blok}}/g, `*${inv.block}*`)
        .replace(/{{total_tagihan}}/g, `*Rp ${total.toLocaleString('id-ID')}*`)
        .replace(/{{jatuh_tempo}}/g, `*${dueDateStr}*`)
        .replace(/{{total_bayar}}/g, `*Rp ${total.toLocaleString('id-ID')}*`)
        .replace(/{{tanggal_bayar}}/g, `*${paymentDateStr}*`)
        .replace(/{{link_invoice}}/g, invoiceLink);

      let phone = inv.phone || '';
      let cleaned = phone.replace(/\D/g, '');
      if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
      } else if (cleaned.length > 0 && !cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
      }

      if (!cleaned) {
        failCount++;
        newLogs.push({ name: inv.name, status: 'fail', message: 'Nomor WA tidak valid' });
        setMassSendStatus(prev => ({ ...prev, fail: failCount, logs: [...newLogs] }));
        continue;
      }

      try {
        if (settings.waApiToken && settings.waApiToken !== '7b2MQA8Ssu13fdhe1VXG') {
          const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
              'Authorization': settings.waApiToken
            },
            body: new URLSearchParams({
              target: cleaned,
              message: message,
              countryCode: '62'
            })
          });
          
          const data = await response.json();
          if (data.status) {
            successCount++;
            newLogs.push({ name: inv.name, status: 'success', message: 'Berhasil dikirim' });
          } else {
            failCount++;
            newLogs.push({ name: inv.name, status: 'fail', message: data.reason || 'Gagal mengirim' });
          }
        } else {
          // Without API, we can only open one by one
          if (i === 0) {
            window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank');
            successCount++;
            newLogs.push({ name: inv.name, status: 'success', message: 'Jendela WA dibuka' });
          } else {
            failCount++;
            newLogs.push({ name: inv.name, status: 'fail', message: 'Butuh API Token untuk kirim massal otomatis' });
          }
        }
      } catch (error) {
        failCount++;
        newLogs.push({ name: inv.name, status: 'fail', message: 'Kesalahan jaringan' });
      }
      
      setMassSendStatus(prev => ({ 
        ...prev, 
        success: successCount, 
        fail: failCount, 
        logs: [...newLogs] 
      }));

      // Small delay to avoid rate limiting
      if (settings.waApiToken && settings.waApiToken !== '7b2MQA8Ssu13fdhe1VXG') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setMassSendStatus(prev => ({ ...prev, step: 'summary', progress: 100 }));
    setSelectedInvoices([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-[#1A237E]">Tagihan & Invoice</h2>
          <p className="text-gray-500 mt-1">Kelola tagihan air warga secara real-time.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedInvoices.length > 0 && (
            <button 
              onClick={() => setSelectedInvoices([])}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">Batal ({selectedInvoices.length})</span>
            </button>
          )}
          <button 
            onClick={handleSendMassalWA}
            disabled={filteredInvoices.length === 0}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors font-medium shadow-lg ${
              filteredInvoices.length > 0 
                ? 'bg-[#25D366] text-white hover:bg-[#128C7E] shadow-[#25D366]/20' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>Kirim Massal WA {selectedInvoices.length > 0 ? `(${selectedInvoices.length})` : `(${filteredInvoices.length})`}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
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
              placeholder="Cari invoice, nama, atau blok..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Tanggal:</span>
            <select 
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] p-2 outline-none"
            >
              <option value="Semua">Semua</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Bulan:</span>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] p-2 outline-none"
            >
              <option value="Semua">Semua</option>
              {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                <option key={i + 1} value={(i + 1).toString()}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Tahun:</span>
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] p-2 outline-none"
            >
              <option value="Semua">Semua</option>
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={resetFilters}
            className="ml-auto text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#1A237E] focus:ring-[#1A237E]"
                    checked={filteredInvoices.length > 0 && selectedInvoices.length === filteredInvoices.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Warga</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Tagihan</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={inv.id} 
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-[#1A237E] focus:ring-[#1A237E]"
                        checked={selectedInvoices.includes(inv.id)}
                        onChange={() => handleSelectInvoice(inv.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1A237E]/5 rounded-lg text-[#1A237E]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A237E] text-sm">{inv.invoiceNo}</p>
                          <p className="text-xs text-gray-500">{inv.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm">{inv.name}</p>
                      <p className="text-xs text-gray-500">Blok {inv.block}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-mono font-semibold text-[#1A237E]">
                        Rp {( (settings.useFlatRate ? settings.flatRateAmount : inv.amount) + settings.adminFee + (inv.status === 'Terlambat' ? settings.lateFee : 0) ).toLocaleString('id-ID')}
                      </p>
                      <p className="text-[10px] text-gray-400">Penggunaan: {inv.usage} m³</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'Lunas' ? 'bg-green-100 text-green-700' :
                        inv.status === 'Proses' ? 'bg-blue-100 text-blue-700' :
                        inv.status === 'Terlambat' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inv.status === 'Lunas' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {inv.status === 'Proses' && <Clock className="w-3.5 h-3.5" />}
                        {inv.status === 'Terlambat' && <AlertCircle className="w-3.5 h-3.5" />}
                        {inv.status === 'Belum Bayar' && <Clock className="w-3.5 h-3.5" />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.status !== 'Lunas' && (
                          <button 
                            onClick={() => handleMarkAsPaid(inv.customerId, inv.id)}
                            disabled={processingId === inv.id}
                            className="p-1.5 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50" 
                            title="Tandai Lunas"
                          >
                            {processingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                        )}
                        <Link 
                          to={`/invoice/${inv.id}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-[#1A237E] rounded-md hover:bg-[#1A237E]/10 transition-colors" 
                          title="Buka di Tab Baru"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 text-gray-400 hover:text-[#1A237E] rounded-md hover:bg-[#1A237E]/10 transition-colors" 
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSendWA(inv)}
                          disabled={sendingWAId === inv.id}
                          className="p-1.5 text-gray-400 hover:text-[#25D366] rounded-md hover:bg-[#25D366]/10 transition-colors disabled:opacity-50" 
                          title="Kirim WA"
                        >
                          {sendingWAId === inv.id ? <Loader2 className="w-4 h-4 animate-spin text-[#25D366]" /> : <Send className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(inv)}
                          disabled={downloadingId === inv.id}
                          className="p-1.5 text-gray-400 hover:text-[#1A237E] rounded-md hover:bg-[#1A237E]/10 transition-colors disabled:opacity-50" 
                          title="Unduh PDF"
                        >
                          {downloadingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin text-[#1A237E]" /> : <Download className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-gray-300 mb-3" />
                      <p className="font-medium text-gray-600">Tidak ada tagihan ditemukan</p>
                      <p className="text-sm mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {previewInvoice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#1A237E]/10 rounded-lg text-[#1A237E]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-[#1A237E] text-lg">Pratinjau Invoice</h3>
                </div>
                <button 
                  onClick={() => setPreviewInvoice(null)} 
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="p-8 overflow-y-auto bg-gray-50/30">
                <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-8 max-w-xl mx-auto">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="text-2xl font-heading font-bold text-[#1A237E]">{settings.appName}</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{settings.address}</p>
                      <p className="text-xs text-gray-500">Telp: {settings.phone}</p>
                    </div>
                    <div className="text-right">
                      <h5 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Invoice</h5>
                      <p className="text-sm font-mono text-[#1A237E] font-bold">{previewInvoice.invoiceNo}</p>
                    </div>
                  </div>

                  {/* Customer & Date Info */}
                  <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-dashed border-gray-200">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Ditagihkan Kepada:</p>
                      <p className="font-bold text-gray-900">{previewInvoice.name}</p>
                      <p className="text-sm text-gray-600">Blok {previewInvoice.block}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Detail Tagihan:</p>
                      <p className="text-sm text-gray-600"><span className="text-gray-400">Tanggal:</span> {previewInvoice.date}</p>
                      <p className="text-sm text-gray-600"><span className="text-gray-400">Status:</span> <span className={previewInvoice.status === 'Lunas' ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>{previewInvoice.status}</span></p>
                    </div>
                  </div>

                  {/* Billing Table */}
                  <table className="w-full mb-8">
                    <thead>
                      <tr className="border-b-2 border-[#1A237E]/10">
                        <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Deskripsi</th>
                        <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="py-4 text-sm text-gray-700">Tagihan Air Bersih ({previewInvoice.usage} m³)</td>
                        <td className="py-4 text-right text-sm font-mono text-gray-900">Rp {(settings.useFlatRate ? settings.flatRateAmount : previewInvoice.amount).toLocaleString('id-ID')}</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-sm text-gray-700">Biaya Admin</td>
                        <td className="py-4 text-right text-sm font-mono text-gray-900">Rp {settings.adminFee.toLocaleString('id-ID')}</td>
                      </tr>
                      {previewInvoice.status === 'Terlambat' && (
                        <tr>
                          <td className="py-4 text-sm text-red-600">Denda Keterlambatan</td>
                          <td className="py-4 text-right text-sm font-mono text-red-600">Rp {settings.lateFee.toLocaleString('id-ID')}</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#1A237E]">
                        <td className="py-4 font-bold text-gray-900">Total Tagihan</td>
                        <td className="py-4 text-right font-mono font-bold text-[#1A237E] text-lg">
                          Rp {( (settings.useFlatRate ? settings.flatRateAmount : previewInvoice.amount) + settings.adminFee + (previewInvoice.status === 'Terlambat' ? settings.lateFee : 0) ).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Payment Info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Metode Pembayaran:</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-700 flex justify-between">
                        <span>BCA: 8732 1100 2938</span>
                        <span className="font-medium">a.n Paguyuban {settings.appName}</span>
                      </p>
                      <p className="text-xs text-gray-700 flex justify-between">
                        <span>Mandiri: 137 000 2938 111</span>
                        <span className="font-medium">a.n Paguyuban {settings.appName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 italic">Terima kasih atas pembayaran tepat waktu Anda.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <Link 
                  to={`/invoice/${previewInvoice.id}`}
                  target="_blank"
                  className="px-5 py-2.5 text-sm font-medium text-[#1A237E] bg-[#1A237E]/10 hover:bg-[#1A237E]/20 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Lihat Invoice
                </Link>
                <button 
                  onClick={() => setPreviewInvoice(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => {
                    handleDownloadPDF(previewInvoice);
                    setPreviewInvoice(null);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#1A237E] hover:bg-[#283593] rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-[#1A237E]/20"
                >
                  <Download className="w-4 h-4" />
                  Unduh PDF
                </button>
                <button 
                  onClick={() => {
                    handleSendWA(previewInvoice);
                    setPreviewInvoice(null);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#25D366] hover:bg-[#128C7E] rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-[#25D366]/20"
                >
                  <Send className="w-4 h-4" />
                  Kirim WA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mass Send WA Modal */}
      <AnimatePresence>
        {massSendStatus.isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1A237E] text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl">Kirim Massal WhatsApp</h3>
                    <p className="text-white/70 text-xs">Proses pengiriman otomatis via API</p>
                  </div>
                </div>
                {massSendStatus.step !== 'sending' && (
                  <button 
                    onClick={() => setMassSendStatus(prev => ({ ...prev, isOpen: false }))}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="p-8">
                {massSendStatus.step === 'preview' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
                      <div className="p-3 bg-blue-100 rounded-full h-fit">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900">Konfirmasi Pengiriman</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Anda akan mengirimkan invoice ke <strong>{massSendStatus.total} warga</strong> yang telah dipilih.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pratinjau Pesan (Contoh):</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#25D366]"></div>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {(() => {
                            const firstInv = selectedInvoices.length > 0 
                              ? filteredInvoices.find(inv => selectedInvoices.includes(inv.id))
                              : filteredInvoices[0];
                            
                            if (!firstInv) return 'Daftar invoice kosong';
                            
                            const amount = settings.useFlatRate ? settings.flatRateAmount : firstInv.amount;
                            const total = amount + settings.adminFee + (firstInv.status === 'Terlambat' ? settings.lateFee : 0);
                            const dueDate = new Date();
                            dueDate.setDate(settings.billingDate + settings.gracePeriod);
                            const dueDateStr = dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                            const invoiceLink = `${window.location.origin}/invoice/${firstInv.id}`;

                            let template = '';
                            if (firstInv.status === 'Lunas') {
                              template = settings.templatePaymentSuccess;
                            } else if (firstInv.status === 'Terlambat') {
                              template = settings.templateReminder;
                            } else {
                              template = settings.templateNewBill;
                            }

                            return template
                              .replace(/{{nama_warga}}/g, `*${firstInv.name}*`)
                              .replace(/{{blok}}/g, `*${firstInv.block}*`)
                              .replace(/{{total_tagihan}}/g, `*Rp ${total.toLocaleString('id-ID')}*`)
                              .replace(/{{jatuh_tempo}}/g, `*${dueDateStr}*`)
                              .replace(/{{total_bayar}}/g, `*Rp ${total.toLocaleString('id-ID')}*`)
                              .replace(/{{link_invoice}}/g, invoiceLink);
                          })()}
                        </pre>
                      </div>
                    </div>

                    {(!settings.waApiToken || settings.waApiToken === '7b2MQA8Ssu13fdhe1VXG') && (
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800">
                          <strong>Peringatan:</strong> API Token belum dikonfigurasi. Pengiriman massal hanya akan membuka 1 jendela WhatsApp manual. Silakan atur di Pengaturan.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setMassSendStatus(prev => ({ ...prev, isOpen: false }))}
                        className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={startMassSending}
                        className="flex-[2] px-6 py-3.5 rounded-2xl font-bold text-white bg-[#25D366] hover:bg-[#128C7E] transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Mulai Kirim Sekarang
                      </button>
                    </div>
                  </div>
                )}

                {massSendStatus.step === 'sending' && (
                  <div className="space-y-8 py-4">
                    <div className="text-center space-y-2">
                      <div className="relative inline-block">
                        <div className="w-24 h-24 rounded-full border-4 border-gray-100 border-t-[#25D366] animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-700">{massSendStatus.progress}%</span>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Sedang Mengirim...</h4>
                      <p className="text-sm text-gray-500">Mengirim ke: <span className="text-[#1A237E] font-bold">{massSendStatus.currentName}</span></p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                        <span>Progress</span>
                        <span>{massSendStatus.success + massSendStatus.fail} / {massSendStatus.total}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${massSendStatus.progress}%` }}
                          className="h-full bg-gradient-to-r from-[#25D366] to-[#128C7E]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                        <p className="text-2xl font-bold text-green-600">{massSendStatus.success}</p>
                        <p className="text-xs font-bold text-green-700 uppercase">Berhasil</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                        <p className="text-2xl font-bold text-red-600">{massSendStatus.fail}</p>
                        <p className="text-xs font-bold text-red-700 uppercase">Gagal</p>
                      </div>
                    </div>
                  </div>
                )}

                {massSendStatus.step === 'summary' && (
                  <div className="space-y-6">
                    <div className="text-center space-y-3">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">Pengiriman Selesai!</h4>
                      <p className="text-gray-500">Laporan pengiriman massal WhatsApp Anda.</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-gray-100/50 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Log Pengiriman</span>
                        <span className="text-xs font-bold text-[#1A237E]">{massSendStatus.total} Total</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                        {massSendStatus.logs.map((log, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors text-sm">
                            <span className="font-medium text-gray-700">{log.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                log.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {log.status === 'success' ? 'Berhasil' : 'Gagal'}
                              </span>
                              <span className="text-[10px] text-gray-400">{log.message}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setMassSendStatus(prev => ({ ...prev, isOpen: false }))}
                      className="w-full px-6 py-4 rounded-2xl font-bold text-white bg-[#1A237E] hover:bg-[#283593] transition-all shadow-lg shadow-[#1A237E]/20"
                    >
                      Selesai & Tutup
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
