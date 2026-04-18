import React, { useState, useMemo } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Search, X, User } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import { useData, Customer } from '../context/DataContext';
import { motion, AnimatePresence } from 'motion/react';

export default function MeterReading() {
  const { customers, addReading } = useData();
  const [step, setStep] = useState(1); // 1: Search/Scan, 2: Input
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentReading, setCurrentReading] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.block.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [customers, searchTerm]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep(2);
    setSearchTerm('');
  };

  const handleSave = async () => {
    if (!selectedCustomer || !currentReading) return;
    
    const readingValue = parseFloat(currentReading.replace(/[^0-9.]/g, ''));
    const lastReading = selectedCustomer.lastMeterReading || selectedCustomer.initialMeter;

    if (readingValue <= lastReading) {
      alert(`Angka meteran harus lebih besar dari bulan lalu (${lastReading} m³).`);
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addReading(selectedCustomer.id, readingValue);
    
    setIsSaving(false);
    setShowSuccess(true);
    
    // Reset after success
    setTimeout(() => {
      setShowSuccess(false);
      setStep(1);
      setSelectedCustomer(null);
      setCurrentReading('');
    }, 3000);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A237E]">Pencatatan Berhasil!</h2>
          <p className="text-gray-500 mt-1">Data meteran untuk {selectedCustomer?.name} telah disimpan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-[#1A237E]">Pencatatan Meter</h2>
        <p className="text-gray-500 mt-2">Catat penggunaan air warga untuk periode ini.</p>
      </div>

      <div className="glass-card p-6 md:p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${step >= 1 ? 'bg-[#1A237E] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`w-16 h-1 transition-colors ${step >= 2 ? 'bg-[#1A237E]' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${step >= 2 ? 'bg-[#1A237E] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4 relative">
              <label className="block text-sm font-semibold text-[#1A237E]">Pilih Pelanggan</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama atau blok (Cth: A-01)" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {filteredCustomers.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                  >
                    {filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#1A237E] font-bold text-xs">
                            {customer.block}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 group-hover:text-[#1A237E]">{customer.name}</p>
                            <p className="text-xs text-gray-400">{customer.category}</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">ATAU</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button 
              className="w-full flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-[#1A237E]/30 rounded-2xl bg-[#1A237E]/5 hover:bg-[#1A237E]/10 transition-colors group"
            >
              <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-[#1A237E]" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#1A237E]">Scan QR Code Meteran</p>
                <p className="text-sm text-gray-500 mt-1">Arahkan kamera ke QR Code di rumah warga</p>
              </div>
            </button>
          </div>
        )}

        {step === 2 && selectedCustomer && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Customer Info Card */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1A237E]/10 flex items-center justify-center text-[#1A237E] font-bold text-lg">
                  {selectedCustomer.block}
                </div>
                <div>
                  <h3 className="font-bold text-[#1A237E]">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-500">Meter Bulan Lalu: <span className="font-mono font-semibold text-gray-700">{selectedCustomer.lastMeterReading || selectedCustomer.initialMeter} m³</span></p>
                </div>
              </div>
              <button 
                onClick={() => { setStep(1); setSelectedCustomer(null); }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1A237E] mb-2">Angka Meteran Saat Ini (m³)</label>
                <CurrencyInput 
                  value={currentReading}
                  onChange={(e) => setCurrentReading(e.target.value)}
                  placeholder="Contoh: 145" 
                  className="w-full px-4 py-3 text-lg font-mono bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Pastikan angka lebih besar dari bulan lalu.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A237E] mb-2">Foto Bukti Meteran</label>
                <div className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">Ambil Foto / Unggah</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setStep(1)}
                disabled={isSaving}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Kembali
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving || !currentReading}
                className="flex-1 py-3 bg-[#1A237E] text-white rounded-xl font-medium shadow-lg shadow-[#1A237E]/20 hover:bg-[#283593] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {isSaving ? 'Menyimpan...' : 'Simpan & Buat Tagihan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
