import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginScreen } from './auth/LoginScreen';
import { BottomTabs } from './navigation/BottomTabs';
import { QuotesPage } from './quotes/QuotesPage';
import { VideosPage } from './videos/VideosPage';
import { CalendarPage } from './calendar/CalendarPage';
import { GurudevPage } from './gurudev/GurudevPage';
import { AdminPage } from './admin/AdminPage';

const AppContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('quotes');

  if (!user) {
    return <LoginScreen />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'quotes':
        return <QuotesPage />;
      case 'videos':
        return <VideosPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'gurudev':
        return <GurudevPage />;
      case 'admin':
        return user.isAdmin ? <AdminPage /> : <QuotesPage />;
      default:
        return <QuotesPage />;
    }
  };

  return (
    <div className="relative">
      {renderActiveTab()}
      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export const SpiritualApp = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};