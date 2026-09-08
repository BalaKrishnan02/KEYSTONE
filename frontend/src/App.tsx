import { Routes, Route } from 'react-router-dom';
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

function PageRoute({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      {/* Home / Hub page with direct navigation buttons to all pages */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Direct Page Routes without login barrier */}
      <Route path="/dashboard" element={<PageRoute><Dashboard /></PageRoute>} />
      <Route path="/customers" element={<PageRoute><Customers /></PageRoute>} />
      <Route path="/customers/:id" element={<PageRoute><CustomerDetail /></PageRoute>} />
      <Route path="/sites" element={<PageRoute><Sites /></PageRoute>} />
      <Route path="/work-orders" element={<PageRoute><WorkOrders /></PageRoute>} />
      <Route path="/work-orders/new" element={<PageRoute><CreateWorkOrder /></PageRoute>} />
      <Route path="/work-orders/:id" element={<PageRoute><WorkOrderDetail /></PageRoute>} />
      <Route path="/kanban" element={<PageRoute><KanbanBoard /></PageRoute>} />
      <Route path="/my-jobs" element={<PageRoute><MyJobs /></PageRoute>} />
      <Route path="/parts" element={<PageRoute><Parts /></PageRoute>} />
      <Route path="/notifications" element={<PageRoute><Notifications /></PageRoute>} />
      <Route path="/reports" element={<PageRoute><Reports /></PageRoute>} />
      <Route path="/users" element={<PageRoute><UserManagement /></PageRoute>} />
      <Route path="/portal" element={<PageRoute><CustomerPortal /></PageRoute>} />
      <Route path="/portal/requests" element={<PageRoute><CustomerRequests /></PageRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}