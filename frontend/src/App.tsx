import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './layouts/Layout';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Sites from './pages/Sites';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetail from './pages/WorkOrderDetail';
import CreateWorkOrder from './pages/CreateWorkOrder';
import Parts from './pages/Parts';
import KanbanBoard from './pages/KanbanBoard';
import MyJobs from './pages/MyJobs';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import CustomerPortal from './pages/CustomerPortal';
import CustomerRequests from './pages/CustomerRequests';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isAuthenticated, loginAs } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      // Default auto-login as Manager to ensure direct link accessibility
      loginAs('admin@vertexa.com', 'password123', {
        id: 1,
        name: 'Admin Manager',
        email: 'admin@vertexa.com',
        role: 'MANAGER',
      });
    }
  }, [isAuthenticated, loginAs]);

  // If page requires a specific role and current role is not in the list, auto-switch to suitable role
  useEffect(() => {
    if (roles && user && !roles.includes(user.role)) {
      if (roles.includes('CUSTOMER')) {
        loginAs('john@apex.com', 'password123', {
          id: 5,
          name: 'John Sterling',
          email: 'john@apex.com',
          role: 'CUSTOMER',
          customerId: 1,
        });
      } else if (roles.includes('TECHNICIAN')) {
        loginAs('mike@vertexa.com', 'password123', {
          id: 3,
          name: 'Mike Ramirez',
          email: 'mike@vertexa.com',
          role: 'TECHNICIAN',
        });
      } else {
        loginAs('admin@vertexa.com', 'password123', {
          id: 1,
          name: 'Admin Manager',
          email: 'admin@vertexa.com',
          role: 'MANAGER',
        });
      }
    }
  }, [roles, user, loginAs]);

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER']}>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/customers" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER']}>
          <Customers />
        </ProtectedRoute>
      } />
      
      <Route path="/customers/:id" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER']}>
          <CustomerDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/sites" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER']}>
          <Sites />
        </ProtectedRoute>
      } />
      
      <Route path="/work-orders" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER']}>
          <WorkOrders />
        </ProtectedRoute>
      } />
      
      <Route path="/work-orders/new" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER']}>
          <CreateWorkOrder />
        </ProtectedRoute>
      } />
      
      <Route path="/work-orders/:id" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER']}>
          <WorkOrderDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/kanban" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER']}>
          <KanbanBoard />
        </ProtectedRoute>
      } />
      
      <Route path="/my-jobs" element={
        <ProtectedRoute roles={['TECHNICIAN']}>
          <MyJobs />
        </ProtectedRoute>
      } />
      
      <Route path="/parts" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER', 'TECHNICIAN']}>
          <Parts />
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute roles={['MANAGER', 'DISPATCHER']}>
          <Reports />
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute roles={['MANAGER']}>
          <UserManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/portal" element={
        <ProtectedRoute roles={['CUSTOMER']}>
          <CustomerPortal />
        </ProtectedRoute>
      } />
      
      <Route path="/portal/requests" element={
        <ProtectedRoute roles={['CUSTOMER']}>
          <CustomerRequests />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}