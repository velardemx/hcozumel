import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import WorkerDashboard from './WorkerDashboard';
import AdminDashboard from './AdminDashboard';
import PresidentDashboard from './PresidentDashboard';

function Dashboard() {
  const { userRole } = useAuthStore();

  switch (userRole) {
    case 'superadmin':
      return <AdminDashboard />;
    case 'president':
      return <PresidentDashboard />;
    case 'worker':
      return <WorkerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default Dashboard;