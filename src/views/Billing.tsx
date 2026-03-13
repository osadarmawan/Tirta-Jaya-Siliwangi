import React, { useState } from 'react';
import { FileText, Search, Filter, Download, Send, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSettings } from '../context/SettingsContext';

const mockInvoices = [
  { id: 'INV-2603-001', name: 'Budi Santoso', block: 'A-01', amount: 125000, status: 'Lunas', date: '05 Mar 2026' },
  { id: 'INV-2603-002', name: 'Siti Aminah', block: 'A-02', amount: 95000, status: 'Belum Bayar', date: '05 Mar 2026' },
  { id: 'INV-2603-003', name: 'Toko Makmur', block: 'B-01', amount: 450000, status: 'Terlambat', date: '05 Mar 2026' },
  { id: 'INV-2603-004', name: 'Ahmad Dahlan', block: 'C-12', amount: 110000, status: 'Proses', date: '05 Mar 2026' },
];

export default function Billing() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sendingWAId, setSendingWAId] = useState<string | null>(null);

  const tabs = ['Semua', 'Belum Bayar', 'Proses', 'Lunas', 'Terlambat'];

  const filteredInvoices = mockInvoices.filter(inv => {
    const matchesTab = activeTab === 'Semua' || inv.status === activeTab;
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.block.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleExportExcel = () => {
    setIsExporting(true);
    
    // Simulate professional loading delay
    setTimeout(() => {
      // Prepare data for Excel
      const exportData = filteredInvoices.map((inv, index) => ({
        'No': index + 1,
        'No. Invoice': inv.id,
        'Tanggal': inv.date,
        'Nama Warga': inv.name,
        'Blok': inv.block,
        'Total Tagihan (Rp)': inv.amount,
        'Status': inv.status
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Tagihan');

      // Adjust column widths
      const wscols = [
        { wch: 5 },  // No
        { wch: 15 }, // No. Invoice
        { wch: 15 }, // Tanggal
        { wch: 25 }, // Nama Warga
        { wch: 10 }, // Blok
        { wch: 20 }, // Total Tagihan
        { wch: 15 }, // Status
      ];
      worksheet['!cols'] = wscols;

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `Laporan_Tagihan_${settings.appName.replace(/\s+/g, '_')}_${activeTab}.xlsx`);
      setIsExporting(false);
    }, 1000);
  };

  const handleDownloadPDF = (inv: typeof mockInvoices[0]) => {
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
      doc.text(`No. Invoice : ${inv.id}`, 14, 60);
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
          ['Tagihan Air Bersih Bulan Ini', `Rp ${inv.amount.toLocaleString('id-ID')}`],
          ['Biaya Admin', 'Rp 2.500'],
          ['Denda Keterlambatan', inv.status === 'Terlambat' ? 'Rp 10.000' : 'Rp 0'],
        ],
        foot: [['Total Tagihan', `Rp ${(inv.amount + 2500 + (inv.status === 'Terlambat' ? 10000 : 0)).toLocaleString('id-ID')}`]],
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
      
      doc.save(`Invoice_${inv.id}_${inv.name.replace(/\s+/g, '_')}.pdf`);
      setDownloadingId(null);
    }, 1200);
  };

  const handleSendWA = (inv: typeof mockInvoices[0]) => {
    setSendingWAId(inv.id);
    
    setTimeout(() => {
      const total = inv.amount + 2500 + (inv.status === 'Terlambat' ? 10000 : 0);
      
      // Template dari settings (disimulasikan)
      const message = `Halo Bapak/Ibu *${inv.name}*,

Berikut adalah rincian tagihan air *${settings.appName}* untuk bulan ini:
Blok: *${inv.block}*
No. Invoice: *${inv.id}*
Total Tagihan: *Rp ${total.toLocaleString('id-ID')}*
Jatuh Tempo: *10 Mar 2026*

Mohon segera melakukan pembayaran melalui transfer ke:
BCA: 8732 1100 2938 a.n Paguyuban ${settings.appName}

Abaikan pesan ini jika Anda sudah melakukan pembayaran. Terima kasih.`;

      const encodedMessage = encodeURIComponent(message);
      // Dummy phone number for simulation
      const phone = '6281234567890'; 
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
      
      setSendingWAId(null);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-[#1A237E]">Tagihan & Invoice</h2>
          <p className="text-gray-500 mt-1">Kelola tagihan air warga periode Maret 2026.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#1A237E] rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-[#1A237E]/30 border-t-[#1A237E] rounded-full animate-spin"></div>
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{isExporting ? 'Mengekspor...' : 'Ekspor Excel'}</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl hover:bg-[#128C7E] transition-colors font-medium shadow-lg shadow-[#25D366]/20">
            <Send className="w-5 h-5" />
            <span>Kirim Massal WA</span>
          </button>
        </div>
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
            placeholder="Cari invoice, nama, atau blok..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Invoice List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
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
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1A237E]/5 rounded-lg text-[#1A237E]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A237E] text-sm">{inv.id}</p>
                          <p className="text-xs text-gray-500">{inv.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm">{inv.name}</p>
                      <p className="text-xs text-gray-500">Blok {inv.block}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-mono font-semibold text-[#1A237E]">Rp {inv.amount.toLocaleString('id-ID')}</p>
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
        {/* Pagination Mock */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Menampilkan {filteredInvoices.length > 0 ? 1 : 0}-{filteredInvoices.length} dari {filteredInvoices.length} tagihan</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 bg-[#1A237E] text-white rounded-md">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
