
import React from 'react';
import { Slot } from 'expo-router';
import { AuthGuard } from '../auth/AuthGuard';

export const MainAppNavigator: React.FC = () => {
  return (
    <AuthGuard>
      <Slot />
    </AuthGuard>
  );
};
