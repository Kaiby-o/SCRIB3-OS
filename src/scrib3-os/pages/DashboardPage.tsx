import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AuthGuard } from '../components/AuthGuard';

const DashboardPage: React.FC = () => {
  return (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  );
};

export default DashboardPage;
