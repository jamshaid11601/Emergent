import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Package, CheckCircle, MessageSquare, Upload, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { orders, allServices, messages } from '../mock';

const OrderPage = () => {
  const { id } = useParams();
  const [deliveryNote, setDeliveryNote] = useState('');
  const [revisionNote, setRevisionNote] = useState('');

  const order = orders.find(o => o.id === id);
  const service = order ? allServices.find(s => s.id === order.serviceId) : null;
  const orderMessages = messages.filter(m => m.orderId === id);

  if (!order || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <Button className="mt-4" asChild>
            <Link to="/buyer/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleDeliverWork = () => {
    if (!deliveryNote.trim()) {
      toast.error('Please add delivery notes');
      return;
    }
    toast.success('Work delivered successfully!');
    setDeliveryNote('');
  };

  const handleRequestRevision = () => {
    if (!revisionNote.trim()) {
      toast.error('Please describe what needs to be revised');
      return;
    }
    toast.success('Revision requested successfully!');
    setRevisionNote('');
  };

  const handleAcceptDelivery = () => {
    toast.success('Order completed! Payment has been released to the seller.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/buyer/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Order {order.id}</h1>
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-3">{service.description}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={service.influencer.avatar} 
                          alt={service.influencer.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">{service.influencer.name}</span>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/messages?order=${order.id}`}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message Seller
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Order Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.requirements}</p>
              </CardContent>
            </Card>

            {/* Delivery Section */}
            {order.status === 'in_progress' && (
              <Card>
                <CardHeader>
                  <CardTitle>Deliver Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Message
                      </label>
                      <Textarea
                        placeholder="Describe your delivery and provide any relevant links or information..."
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attach Files
                      </label>
                      <Button variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Delivery Files
                      </Button>
                    </div>
                    <Button 
                      onClick={handleDeliverWork}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Deliver Work
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accept/Request Revision Section */}
            {order.status === 'delivered' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">Work has been delivered</span>
                      </div>
                      <p className="text-sm text-green-700">The seller has completed the work and is waiting for your review.</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Delivered Files</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Download className="w-4 h-4 mr-2" />
                          content_delivery.zip
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleAcceptDelivery}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Delivery
                      </Button>
                    </div>

                    {order.revisions < 1 && (
                      <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Request Revision
                        </label>
                        <Textarea
                          placeholder="Describe what needs to be changed..."
                          value={revisionNote}
                          onChange={(e) => setRevisionNote(e.target.value)}
                          rows={3}
                        />
                        <Button 
                          onClick={handleRequestRevision}
                          variant="outline"
                          className="w-full mt-2"
                        >
                          Request Revision
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderMessages.map((msg, index) => (
                    <div key={msg.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{msg.senderName}</span>
                          <span className="text-sm text-gray-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-gray-700">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Package</span>
                  <span className="font-semibold capitalize">{order.package}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold">${order.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-semibold">{order.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery Date</span>
                  <span className="font-semibold">{order.deliveryDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revisions Used</span>
                  <span className="font-semibold">{order.revisions} / 1</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-purple-600">${order.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Payment Secured</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your payment of ${order.price} is held in escrow and will be released to the seller once you accept the delivery.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderPage;