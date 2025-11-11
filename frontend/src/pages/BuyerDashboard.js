import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, MessageSquare, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { orders, allServices } from '../mock';
import { useAuth } from '../context/AuthContext';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <Star className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const orderStats = {
    all: orders.length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Dashboard</h1>
          <p className="text-gray-600">Manage your orders and collaborations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{orderStats.all}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{orderStats.in_progress}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivered</p>
                  <p className="text-3xl font-bold text-green-600">{orderStats.delivered}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-purple-600">{orderStats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Orders ({orderStats.all})</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress ({orderStats.in_progress})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({orderStats.delivered})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({orderStats.completed})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const service = allServices.find(s => s.id === order.serviceId);
                      if (!service) return null;
                      
                      return (
                        <Card key={order.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              <img 
                                src={service.image} 
                                alt={service.title}
                                className="w-full md:w-32 h-32 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                      {service.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                      By {service.influencer.name} ({service.influencer.username})
                                    </p>
                                    <Badge className={getStatusColor(order.status)}>
                                      <span className="flex items-center space-x-1">
                                        {getStatusIcon(order.status)}
                                        <span className="capitalize">{order.status.replace('_', ' ')}</span>
                                      </span>
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">${order.price}</div>
                                    <div className="text-sm text-gray-500 capitalize">{order.package} package</div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Order ID:</span>
                                    <span className="ml-2 font-semibold">{order.id}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Order Date:</span>
                                    <span className="ml-2 font-semibold">{order.createdAt}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Delivery Date:</span>
                                    <span className="ml-2 font-semibold">{order.deliveryDate}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Revisions:</span>
                                    <span className="ml-2 font-semibold">{order.revisions} used</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" asChild>
                                    <Link to={`/order/${order.id}`}>View Details</Link>
                                  </Button>
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={`/messages?order=${order.id}`}>
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Message Seller
                                    </Link>
                                  </Button>
                                  {order.status === 'delivered' && (
                                    <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                                      Accept Delivery
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">No orders found</p>
                    <Button asChild>
                      <Link to="/browse">Browse Services</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default BuyerDashboard;