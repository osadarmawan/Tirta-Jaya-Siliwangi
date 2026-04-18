import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSettings } from './SettingsContext';

export interface Customer {
  id: string;
  name: string;
  block: string;
  category: string;
  initialMeter: number;
  phone: string;
  lastMeterReading?: number;
  lastReadingDate?: string;
}

export interface HistoryRecord {
  id: string;
  period: string;
  startMeter: number;
  endMeter: number;
  usage: number;
  amount: number;
  status: 'Lunas' | 'Belum Bayar' | 'Terlambat' | 'Proses';
  date: string;
}

interface DataContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addReading: (customerId: string, reading: number, photo?: string) => Promise<void>;
  history: Record<string, HistoryRecord[]>;
  notifications: any[];
  updateReadingStatus: (customerId: string, readingId: string, status: HistoryRecord['status']) => Promise<void>;
  addNotification: (notif: { type: 'success' | 'warning' | 'info' | 'error', title: string, desc: string }) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialCustomers: Customer[] = [
  { id: '1', name: 'Budi Santoso', block: 'A-01', category: 'Rumah Tangga', initialMeter: 120, phone: '081234567890', lastMeterReading: 150, lastReadingDate: '2026-03-01' },
  { id: '2', name: 'Siti Aminah', block: 'A-02', category: 'Rumah Tangga', initialMeter: 85, phone: '081234567891', lastMeterReading: 105, lastReadingDate: '2026-03-02' },
  { id: '3', name: 'Toko Makmur', block: 'B-01', category: 'Niaga', initialMeter: 450, phone: '081234567892', lastMeterReading: 480, lastReadingDate: '2026-03-01' },
  { id: '4', name: 'Ahmad Dahlan', block: 'C-12', category: 'Rumah Tangga', initialMeter: 210, phone: '081234567893', lastMeterReading: 235, lastReadingDate: '2026-03-03' },
  { id: '5', name: 'Warung Kopi', block: 'B-02', category: 'Niaga', initialMeter: 320, phone: '081234567894', lastMeterReading: 350, lastReadingDate: '2026-03-01' },
];

const initialHistory: Record<string, HistoryRecord[]> = {
  '1': [
    { id: 'H1', period: 'Januari 2026', startMeter: 100, endMeter: 115, usage: 15, amount: 70000, status: 'Lunas', date: '2026-01-05' },
    { id: 'H2', period: 'Februari 2026', startMeter: 115, endMeter: 132, usage: 17, amount: 70000, status: 'Lunas', date: '2026-02-04' },
    { id: 'H3', period: 'Maret 2026', startMeter: 132, endMeter: 150, usage: 18, amount: 70000, status: 'Belum Bayar', date: '2026-03-05' },
  ],
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [history, setHistory] = useState<Record<string, HistoryRecord[]>>(initialHistory);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, type: 'success', title: 'Pembayaran Diterima', desc: 'Budi Santoso (A-01) telah membayar tagihan Rp 125.000.', time: 'Baru saja', unread: true },
    { id: 2, type: 'warning', title: 'Jatuh Tempo Mendekat', desc: '5 warga belum membayar tagihan bulan ini.', time: '1 jam lalu', unread: true },
    { id: 3, type: 'info', title: 'Pencatatan Selesai', desc: 'Blok A telah selesai dicatat oleh Petugas Joko.', time: 'Kemarin', unread: false },
    { id: 4, type: 'error', title: 'Meteran Anomali', desc: 'Penggunaan air Blok C-12 melonjak 300%.', time: '2 hari lalu', unread: false },
  ]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, invRes, notifRes] = await Promise.all([
          fetch('/api/customers').catch(() => null),
          fetch('/api/invoices').catch(() => null),
          fetch('/api/notifications').catch(() => null)
        ]);

        if (custRes?.ok) {
          const data = await custRes.json();
          if (data && data.length > 0) setCustomers(data);
        }

        if (invRes?.ok) {
          const data = await invRes.json();
          if (data && data.length > 0) {
            // Group invoices by customerId
            const newHistory: Record<string, HistoryRecord[]> = {};
            data.forEach((inv: any) => {
              if (!newHistory[inv.customerId]) newHistory[inv.customerId] = [];
              newHistory[inv.customerId].push({
                id: inv.id,
                period: inv.period,
                startMeter: inv.startMeter,
                endMeter: inv.endMeter,
                usage: inv.usage,
                amount: inv.amount,
                status: inv.status,
                date: inv.date
              });
            });
            setHistory(newHistory);
          }
        }

        if (notifRes?.ok) {
          const data = await notifRes.json();
          if (data && data.length > 0) {
            setNotifications(data.map((n: any) => ({
              id: n.id,
              type: n.type,
              title: n.title,
              desc: n.description,
              time: new Date(n.time).toLocaleString('id-ID'),
              unread: n.isUnread
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching data from API:', err);
      }
    };

    fetchData();
  }, []);

  const addNotification = async (notif: { type: 'success' | 'warning' | 'info' | 'error', title: string, desc: string }) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: notif.type, title: notif.title, description: notif.desc })
      });
      if (res.ok) {
        const data = await res.json();
        const newNotif = {
          ...notif,
          id: data.id,
          time: 'Baru saja',
          unread: true
        };
        setNotifications(prev => [newNotif, ...prev]);
        return;
      }
    } catch (e) {}
    
    // Fallback
    const newNotif = {
      ...notif,
      id: Date.now(),
      time: 'Baru saja',
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' });
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = async (id: number) => {
    // In a real app, we'd have a DELETE /api/notifications/:id endpoint
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = async () => {
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
    } catch (e) {}
    setNotifications([]);
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const newId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customer, id: newId })
      });
    } catch (e) {}
    setCustomers([{ ...customer, id: newId }, ...customers]);
  };

  const updateCustomer = async (id: string, updatedFields: Partial<Customer>) => {
    try {
      await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (e) {}
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const deleteCustomer = async (id: string) => {
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setCustomers(customers.filter(c => c.id !== id));
  };

  const addReading = async (customerId: string, reading: number, photo?: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const lastReading = customer.lastMeterReading || customer.initialMeter;
    const usage = reading - lastReading;
    
    let amount = 0;
    if (settings.useFlatRate) {
      amount = settings.flatRateAmount;
    } else {
      const rate = customer.category === 'Niaga' || customer.category === 'Komersial' 
        ? settings.tariffCommercial 
        : settings.tariffHousehold;
      amount = usage * rate;
    }
    
    const now = new Date();
    const period = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const dateStr = now.toISOString().split('T')[0];
    
    let newId = `H-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          period,
          startMeter: lastReading,
          endMeter: reading,
          usage,
          amount,
          date: dateStr,
          photoUrl: photo
        })
      });
      if (res.ok) {
        const data = await res.json();
        newId = data.id;
      }
    } catch (e) {}
    
    const newHistoryRecord: HistoryRecord = {
      id: newId,
      period,
      startMeter: lastReading,
      endMeter: reading,
      usage,
      amount,
      status: 'Belum Bayar',
      date: dateStr,
    };

    setHistory(prev => ({
      ...prev,
      [customerId]: [newHistoryRecord, ...(prev[customerId] || [])]
    }));

    updateCustomer(customerId, {
      lastMeterReading: reading,
      lastReadingDate: dateStr
    });

    addNotification({
      type: 'info',
      title: 'Pencatatan Baru',
      desc: `Meteran baru untuk ${customer.name} (${customer.block}) telah dicatat: ${reading} m³.`,
    });
  };

  const updateReadingStatus = async (customerId: string, readingId: string, status: HistoryRecord['status']) => {
    try {
      await fetch(`/api/invoices/${readingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {}

    setHistory(prev => {
      const customerHistory = prev[customerId] || [];
      const updatedHistory = customerHistory.map(record => {
        if (record.id === readingId) {
          if (status === 'Lunas' && record.status !== 'Lunas') {
            const customer = customers.find(c => c.id === customerId);
            addNotification({
              type: 'success',
              title: 'Pembayaran Diterima',
              desc: `${customer?.name || 'Warga'} (${customer?.block || ''}) telah membayar tagihan Rp ${record.amount.toLocaleString('id-ID')}.`
            });
          }
          return { ...record, status };
        }
        return record;
      });
      return { ...prev, [customerId]: updatedHistory };
    });
  };

  return (
    <DataContext.Provider value={{ 
      customers, 
      addCustomer, 
      updateCustomer, 
      deleteCustomer, 
      addReading, 
      history,
      notifications,
      updateReadingStatus,
      addNotification,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

