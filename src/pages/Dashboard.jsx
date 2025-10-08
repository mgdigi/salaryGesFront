import React from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import Layout from '../components/layout/Layout';
import DashboardStats from '../components/dashboard/DashboardStats';

const DashboardContent = () => {
  return (
    <Layout>
      <DashboardStats />
    </Layout>
  );
};

const Dashboard = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default Dashboard;
