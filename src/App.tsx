/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Camera, 
  FileText, 
  Settings,
  Bell,
  Search,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// Mock Views
import Dashboard from './views/Dashboard';
import Customers from './views/Customers';
import MeterReading from './views/MeterReading';
import Billing from './views/Billing';
import SettingsView from './views/SettingsView';
import NotificationsView from './views/NotificationsView';
import InvoiceView from './views/InvoiceView';
import LoginView from './views/LoginView';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { DataProvider, useData } from './context/DataContext';
import { LogOut } from 'lucide-react';

type ViewType = 'dashboard' | 'customers' | 'meter' | 'billing' | 'settings' | 'notifications';

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/invoice/:id" element={<InvoiceView />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </DataProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { settings } = useSettings();
  const { notifications, markAllAsRead } = useData();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/invoice/')) {
            navigate('/login');
          }
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    document.title = `${settings.appName} - Meter Mandiri`;
  }, [settings.appName]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A237E]"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Will be redirected by useEffect
  }

  const unreadCount = notifications.filter(n => n.unread).length;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onViewChange={setCurrentView} />;
      case 'customers': return <Customers />;
      case 'meter': return <MeterReading />;
      case 'billing': return <Billing />;
      case 'settings': return <SettingsView />;
      case 'notifications': return <NotificationsView />;
      default: return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Beranda' },
    { id: 'customers', icon: Users, label: 'Warga' },
    { id: 'meter', icon: Camera, label: 'Catat' },
    { id: 'billing', icon: FileText, label: 'Tagihan' },
    { id: 'settings', icon: Settings, label: 'Pengaturan' },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F6F9]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-sidebar text-white fixed h-full z-50">
        <div className="p-6 flex items-center gap-3 border-b border-[rgba(212,175,55,0.2)]">
          <div className="bg-gradient-to-br from-[#D4AF37] to-[#F3E5AB] p-2 rounded-xl shrink-0">
            <Droplet className="w-6 h-6 text-[#1A237E]" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-bold text-lg tracking-tight text-[#D4AF37] leading-tight">{settings.appName}</h1>
            <p className="text-[10px] text-gray-300 uppercase tracking-wider mt-0.5">Meter Mandiri</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[rgba(212,175,55,0.15)] text-[#D4AF37] border border-[rgba(212,175,55,0.3)]' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(212,175,55,0.2)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] flex items-center justify-center text-[#1A237E] font-bold text-sm">
                A
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-[10px] text-gray-400">Pengurus</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen flex flex-col">
        {/* Top Header (Mobile & Desktop) */}
        <header className="sticky top-0 z-40 bg-[rgba(244,246,249,0.8)] backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2 min-w-0 flex-1 mr-4">
            <div className="bg-gradient-to-br from-[#D4AF37] to-[#F3E5AB] p-1.5 rounded-lg shrink-0">
              <Droplet className="w-5 h-5 text-[#1A237E]" />
            </div>
            <h1 className="font-heading font-bold text-base text-[#1A237E] leading-tight truncate">{settings.appName}</h1>
          </div>
          
          <div className="hidden md:block">
            <h2 className="font-heading font-semibold text-2xl text-[#1A237E] capitalize">
              {currentView === 'notifications' ? 'Pusat Notifikasi' : navItems.find(i => i.id === currentView)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Logout Button (Mobile) */}
            <button 
              onClick={handleLogout}
              className="md:hidden p-2 text-[#1A237E] hover:bg-white rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Notification Bell & Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-white text-[#1A237E] shadow-sm' : 'text-[#1A237E] hover:bg-white'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F4F6F9]"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    {/* Invisible overlay to close dropdown when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl overflow-hidden z-50 origin-top-right"
                    >
                      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white/50">
                        <h3 className="font-heading font-bold text-[#1A237E]">Notifikasi</h3>
                        <button onClick={markAllAsRead} className="text-xs font-medium text-[#D4AF37] hover:text-[#b5952f] flex items-center gap-1 transition-colors">
                          <Check className="w-3.5 h-3.5" /> Tandai semua dibaca
                        </button>
                      </div>
                      
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50/80 transition-colors flex gap-3 cursor-pointer relative ${notif.unread ? 'bg-blue-50/30' : ''}`}
                          >
                            {notif.unread && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]"></div>
                            )}
                            <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 h-fit ${
                              notif.type === 'success' ? 'bg-green-100 text-green-600' :
                              notif.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                              notif.type === 'error' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notif.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                              {notif.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                              {notif.type === 'error' && <AlertCircle className="w-4 h-4" />}
                              {notif.type === 'info' && <Info className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className={`text-sm font-semibold ${notif.unread ? 'text-[#1A237E]' : 'text-gray-700'}`}>
                                  {notif.title}
                                </h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">{notif.time}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.desc}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="p-6 text-center text-gray-500 text-sm">Tidak ada notifikasi</div>
                        )}
                      </div>

                      <div 
                        onClick={() => {
                          setCurrentView('notifications');
                          setShowNotifications(false);
                        }}
                        className="p-3 text-center border-t border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <span className="text-sm font-medium text-[#1A237E]">Lihat Semua Notifikasi</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:block w-8 h-8 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] flex items-center justify-center text-[#1A237E] font-bold text-sm cursor-pointer">
              A
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden glass-nav fixed bottom-0 w-full z-50 px-6 py-3 pb-safe">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="flex flex-col items-center gap-1 relative"
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-[rgba(212,175,55,0.15)]' : 'transparent'
                }`}>
                  <Icon 
                    className={`w-6 h-6 transition-colors duration-300 ${
                      isActive ? 'text-[#D4AF37]' : 'text-gray-400'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-300 ${
                  isActive ? 'text-[#D4AF37]' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-3 w-1 h-1 rounded-full bg-[#D4AF37]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
