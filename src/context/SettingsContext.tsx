import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AppSettings {
  appName: string;
  address: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  phone: string;
  useFlatRate: boolean;
  flatRateAmount: number;
  billingDate: number;
  gracePeriod: number;
  lateFee: number;
  adminFee: number;
  tariffHousehold: number;
  tariffCommercial: number;
  waInstanceId: string;
  waApiToken: string;
  waAutoReminder: boolean;
  waAutoReminderDays: number;
  waLogRetentionDays: number;
  waOtpEnabled: boolean;
  templateNewBill: string;
  templatePaymentSuccess: string;
  templateReminder: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  appName: 'Tirta Jaya Siliwangi',
  address: 'Jl. Siliwangi, Perum. Puri Nirwana Residence',
  rt: '004',
  rw: '009',
  kelurahan: 'Sukaraya',
  kecamatan: 'Karang Bahagia',
  city: 'Kab.Bekasi',
  phone: '+62 851-8352-5148',
  useFlatRate: true,
  flatRateAmount: 70000,
  billingDate: 5,
  gracePeriod: 5,
  lateFee: 0,
  adminFee: 0,
  tariffHousehold: 2500,
  tariffCommercial: 4500,
  waInstanceId: '1234567890',
  waApiToken: '7b2MQA8Ssu13fdhe1VXG',
  waAutoReminder: true,
  waAutoReminderDays: 3,
  waLogRetentionDays: 30,
  waOtpEnabled: true,
  templateNewBill: `Halo {{nama_warga}},
Tagihan air Anda untuk bulan ini telah terbit.

Blok: {{blok}}
Total Tagihan: {{total_tagihan}}
Jatuh Tempo: {{jatuh_tempo}}

Lihat Invoice: {{link_invoice}}

Mohon segera melakukan pembayaran sebelum tanggal jatuh tempo.
Terima kasih.`,
  templatePaymentSuccess: `Halo {{nama_warga}},
Terima kasih, pembayaran tagihan air Anda telah kami terima.

Blok: {{blok}}
Total Bayar: {{total_bayar}}
Tanggal Bayar: {{tanggal_bayar}}

Lihat Invoice: {{link_invoice}}

Terima kasih atas kerjasamanya.`,
  templateReminder: `Halo {{nama_warga}},
Ini adalah pengingat bahwa tagihan air Anda akan segera jatuh tempo.

Blok: {{blok}}
Total Tagihan: {{total_tagihan}}
Jatuh Tempo: {{jatuh_tempo}}

Lihat Invoice: {{link_invoice}}

Mohon abaikan pesan ini jika Anda sudah melakukan pembayaran.
Terima kasih.`
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch settings');
      })
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, ...newSettings }));
      } else {
        console.error('Failed to update settings on server');
        // Optimistic update anyway for demo purposes
        setSettings((prev) => ({ ...prev, ...newSettings }));
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      // Optimistic update anyway for demo purposes
      setSettings((prev) => ({ ...prev, ...newSettings }));
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
