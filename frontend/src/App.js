import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Toaster } from './components/ui/sonner';
import HomePage from './pages/HomePage';
import BrowseServices from './pages/BrowseServices';
import ServiceDetail from './pages/ServiceDetail';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import OrderPage from './pages/OrderPage';
import MessagesPage from './pages/MessagesPage';
import AuthPage from './pages/AuthPage';
import CreateService from './pages/CreateService';
import EditProfile from './pages/EditProfile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import ServicesManagement from './pages/admin/ServicesManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import CampaignsManagement from './pages/admin/CampaignsManagement';
import ChatsManagement from './pages/admin/ChatsManagement';
import Revenue from './pages/admin/Revenue';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import CreateManager from './pages/admin/CreateManager';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerChat from './pages/manager/ManagerChat';
import ManagerMessages from './pages/manager/ManagerMessages';
import CreateCampaign from './pages/manager/CreateCampaign';
import CustomOrders from './pages/CustomOrders';
import BrowseManagers from './pages/BrowseManagers';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowseServices />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/create-service" element={<CreateService />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/services" element={<ServicesManagement />} />
            <Route path="/admin/orders" element={<OrdersManagement />} />
            <Route path="/admin/campaigns" element={<CampaignsManagement />} />
            <Route path="/admin/chats" element={<ChatsManagement />} />
            <Route path="/admin/revenue" element={<Revenue />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/create-manager" element={<CreateManager />} />
            
            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/chat/:userId" element={<ManagerChat />} />
            <Route path="/manager/messages" element={<ManagerMessages />} />
            <Route path="/manager/create-campaign" element={<CreateCampaign />} />
            
            {/* Custom Orders & Manager Browsing */}
            <Route path="/custom-orders" element={<CustomOrders />} />
            <Route path="/managers" element={<BrowseManagers />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;