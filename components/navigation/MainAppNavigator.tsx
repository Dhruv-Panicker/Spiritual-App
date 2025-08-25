
import React from 'react';
import { Slot } from 'expo-router';
import { AuthGuard } from '../auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

export const MainAppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  console.log('MainAppNavigator - User:', user, 'Loading:', isLoading);
  
  return (
    <AuthGuard>
      <Slot />
    </AuthGuard>
  );
};
