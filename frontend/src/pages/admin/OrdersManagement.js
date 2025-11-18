import React, { useState, useEffect } from 'react';
import { Search, Eye, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import { Link } from 'react-router-dom';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BACKEND_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      delivered: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all platform orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={filter === 'all' ? 'ring-2 ring-purple-500' : ''}>
            <CardContent className="p-6 cursor-pointer" onClick={() => setFilter('all')}>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className={filter === 'pending' ? 'ring-2 ring-purple-500' : ''}>
            <CardContent className="p-6 cursor-pointer" onClick={() => setFilter('pending')}>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className={filter === 'in_progress' ? 'ring-2 ring-purple-500' : ''}>
            <CardContent className="p-6 cursor-pointer" onClick={() => setFilter('in_progress')}>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats.in_progress}</p>
            </CardContent>
          </Card>
          <Card className={filter === 'completed' ? 'ring-2 ring-purple-500' : ''}>
            <CardContent className="p-6 cursor-pointer" onClick={() => setFilter('completed')}>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by order ID or service..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No orders found</div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{order.orderId}</h3>
                          <Badge className={getStatusBadge(order.status)}>
                            {order.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{order.service?.title || 'Service N/A'}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Buyer:</span> {order.buyerName || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Seller:</span> {order.sellerName || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span> ${order.price}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/order/${order._id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default OrdersManagement;