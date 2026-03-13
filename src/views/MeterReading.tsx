import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';

export default function MeterReading() {
  const [step, setStep] = useState(1); // 1: Search/Scan, 2: Input

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-[#1A237E]">Pencatatan Meter</h2>
        <p className="text-gray-500 mt-2">Catat penggunaan air warga untuk periode ini.</p>
      </div>

      <div className="glass-card p-6 md:p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 1 ? 'bg-[#1A237E] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-[#1A237E]' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 2 ? 'bg-[#1A237E] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-[#1A237E]">Pilih Pelanggan</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau blok (Cth: A-01)" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">ATAU</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button 
              onClick={() => setStep(2)}
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

            {/* Mock select for demo */}
            <div className="pt-4">
              <button onClick={() => setStep(2)} className="w-full py-3 bg-[#1A237E] text-white rounded-xl font-medium shadow-lg shadow-[#1A237E]/20 hover:bg-[#283593] transition-colors">
                Lanjut (Demo)
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Customer Info Card */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1A237E]/10 flex items-center justify-center text-[#1A237E] font-bold text-lg">
                A-01
              </div>
              <div>
                <h3 className="font-bold text-[#1A237E]">Budi Santoso</h3>
                <p className="text-sm text-gray-500">Meter Bulan Lalu: <span className="font-mono font-semibold text-gray-700">120 m³</span></p>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1A237E] mb-2">Angka Meteran Saat Ini (m³)</label>
                <CurrencyInput 
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
                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Kembali
              </button>
              <button className="flex-1 py-3 bg-[#1A237E] text-white rounded-xl font-medium shadow-lg shadow-[#1A237E]/20 hover:bg-[#283593] transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Simpan & Buat Tagihan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
