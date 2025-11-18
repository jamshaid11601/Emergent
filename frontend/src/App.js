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
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;