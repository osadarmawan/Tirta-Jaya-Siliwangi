import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, HistoryRecord } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { FileText, ArrowLeft, Download, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, history } = useData();
  const { settings } = useSettings();

  // Find the invoice in history
  let invoice: any = null;
  Object.entries(history as Record<string, HistoryRecord[]>).forEach(([customerId, records]) => {
    const record = records.find(r => r.id === id);
    if (record) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        invoice = {
          ...record,
          customerId: customer.id,
          name: customer.name,
          block: customer.block,
          phone: customer.phone,
          invoiceNo: `INV-${record.date.replace(/-/g, '').substring(2, 6)}-${customer.id.padStart(3, '0')}`,
          formattedDate: new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      }
    }
  });

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Invoice Tidak Ditemukan</h2>
          <p className="text-gray-500 mt-2">Maaf, invoice yang Anda cari tidak tersedia atau telah dihapus.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2 bg-[#1A237E] text-white rounded-xl font-medium"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const total = invoice.amount + settings.adminFee + (invoice.status === 'Terlambat' ? settings.lateFee : 0);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(26, 35, 126);
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
    doc.text(`No. Invoice : ${invoice.invoiceNo}`, 14, 60);
    doc.text(`Tanggal     : ${invoice.formattedDate}`, 14, 66);
    doc.text(`Status      : ${invoice.status}`, 14, 72);
    
    // Customer Details
    doc.text(`Nama Warga  : ${invoice.name}`, 120, 60);
    doc.text(`Blok Rumah  : ${invoice.block}`, 120, 66);
    
    // Table
    (doc as any).autoTable({
      startY: 85,
      head: [['Deskripsi', 'Jumlah']],
      body: [
        [`Penggunaan Air (${invoice.usage} m³)`, `Rp ${invoice.amount.toLocaleString('id-ID')}`],
        ['Biaya Admin', `Rp ${settings.adminFee.toLocaleString('id-ID')}`],
        ...(invoice.status === 'Terlambat' ? [['Denda Keterlambatan', `Rp ${settings.lateFee.toLocaleString('id-ID')}`]] : [])
      ],
      foot: [['Total Tagihan', `Rp ${total.toLocaleString('id-ID')}`]],
      theme: 'striped',
      headStyles: { fillColor: [26, 35, 126] },
      footStyles: { fillColor: [26, 35, 126], textColor: [255, 255, 255] }
    });
    
    doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1A237E] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A237E] text-white rounded-xl hover:bg-[#283593] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
        >
          <div className="p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-2xl font-heading font-bold text-[#1A237E]">{settings.appName}</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{settings.address}</p>
                <p className="text-xs text-gray-500">Telp: {settings.phone}</p>
              </div>
              <div className="text-right">
                <h5 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Invoice</h5>
                <p className="text-sm font-mono text-[#1A237E] font-bold">{invoice.invoiceNo}</p>
              </div>
            </div>

            {/* Customer & Date Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-dashed border-gray-200">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Ditagihkan Kepada:</p>
                <p className="font-bold text-gray-900">{invoice.name}</p>
                <p className="text-sm text-gray-600">Blok {invoice.block}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Detail Tagihan:</p>
                <p className="text-sm text-gray-600"><span className="text-gray-400">Tanggal:</span> {invoice.formattedDate}</p>
                <p className="text-sm text-gray-600"><span className="text-gray-400">Status:</span> <span className={invoice.status === 'Lunas' ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>{invoice.status}</span></p>
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
                  <td className="py-4 text-sm text-gray-700">Tagihan Air Bersih ({invoice.usage} m³)</td>
                  <td className="py-4 text-right text-sm font-mono text-gray-900">Rp {invoice.amount.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                  <td className="py-4 text-sm text-gray-700">Biaya Admin</td>
                  <td className="py-4 text-right text-sm font-mono text-gray-900">Rp {settings.adminFee.toLocaleString('id-ID')}</td>
                </tr>
                {invoice.status === 'Terlambat' && (
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
                    Rp {total.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Metode Pembayaran:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-700">BCA: 8732 1100 2938</p>
                  <p className="text-[10px] text-gray-500">a.n Paguyuban {settings.appName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700">Mandiri: 137 000 2938 111</p>
                  <p className="text-[10px] text-gray-500">a.n Paguyuban {settings.appName}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs italic text-gray-400">Terima kasih atas pembayaran tepat waktu Anda.</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; padding: 0; }
          .max-w-2xl { max-width: 100%; }
          .shadow-xl { shadow: none; border: none; }
        }
      `}</style>
    </div>
  );
}
