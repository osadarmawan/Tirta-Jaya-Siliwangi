import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppSettings {
  appName: string;
  address: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  phone: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
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
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
