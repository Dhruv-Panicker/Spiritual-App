import React from 'react';
import { AuthGuard } from '../auth/AuthGuard';
import { TabNavigator } from './TabNavigator';

export const MainAppNavigator: React.FC = () => {
  return (
    <AuthGuard>
      <TabNavigator />
    </AuthGuard>
  );
};