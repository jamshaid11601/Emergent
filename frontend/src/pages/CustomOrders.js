import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, Clock, User, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CustomOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCustomOrders();
  }, [user, navigate]);

  const fetchCustomOrders = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BACKEND_URL}/api/custom-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCustomOrders(response.data);
    } catch (error) {
      console.error('Error fetching custom orders:', error);
      toast.error('Failed to load custom orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setProcessing(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${BACKEND_URL}/api/custom-orders/${orderId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Custom order accepted! Check your orders.');
      fetchCustomOrders();
      
      // Navigate to orders after a short delay
      setTimeout(() => {
        navigate(user.userType === 'seller' ? '/seller/dashboard' : '/buyer/dashboard');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to accept order');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${BACKEND_URL}/api/custom-orders/${selectedOrder._id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Custom order rejected');
      setRejectDialogOpen(false);
      setSelectedOrder(null);
      setRejectionReason('');
      fetchCustomOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reject order');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (order) => {
    setSelectedOrder(order);
    setRejectDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingOrders = customOrders.filter(o => o.status === 'pending');
  const processedOrders = customOrders.filter(o => o.status !== 'pending');

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Custom Orders from Managers</h1>
          <p className="text-gray-600 mt-1">Review and manage custom orders sent by campaign managers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Accepted</p>
                  <p className="text-3xl font-bold text-green-600">
                    {customOrders.filter(o => o.status === 'accepted').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-purple-600">{customOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                Pending Orders - Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order._id} className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{order.title}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{order.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">${order.price}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span>{order.deliveryDays} days delivery</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span>Manager: {order.managerName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-600" />
                            <span>Order #{order.orderId}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        className="bg-green-600 hover:bg-green-700 flex-1"
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={processing}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Order
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50 flex-1"
                        onClick={() => openRejectDialog(order)}
                        disabled={processing}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/manager/chat/${order.managerId}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat with Manager
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processed Orders */}
        {processedOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedOrders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{order.title}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{order.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>${order.price}</span>
                          <span>•</span>
                          <span>{order.deliveryDays} days</span>
                          <span>•</span>
                          <span>Manager: {order.managerName}</span>
                          <span>•</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading custom orders...</p>
          </div>
        )}

        {!loading && customOrders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No custom orders yet</p>
              <p className="text-sm text-gray-400">
                Campaign managers can send you custom orders for special projects
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Custom Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Reason for rejection (optional)</Label>
              <Textarea
                placeholder="Let the manager know why you're rejecting this order..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason('');
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleRejectOrder}
                disabled={processing}
              >
                {processing ? 'Rejecting...' : 'Reject Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CustomOrders;
