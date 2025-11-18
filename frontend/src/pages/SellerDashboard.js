import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, TrendingUp, Star, Plus, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { influencers, orders } from '../mock';
import { useAuth } from '../context/AuthContext';

const SellerDashboard = () => {
  const { user } = useAuth();
  // Mock: assuming user is the first influencer
  const sellerData = influencers[0];
  const sellerOrders = orders.filter(o => o.sellerId === sellerData.id);

  const earnings = {
    total: sellerOrders.reduce((sum, order) => sum + order.price, 0),
    pending: sellerOrders.filter(o => o.status === 'in_progress').reduce((sum, order) => sum + order.price, 0),
    available: sellerOrders.filter(o => o.status === 'completed').reduce((sum, order) => sum + order.price, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
              <p className="text-gray-600">Manage your services and earnings</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
              <Link to="/create-service">
                <Plus className="w-5 h-5 mr-2" />
                Create New Service
              </Link>
            </Button>
          </div>
        </div>

        {/* Seller Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <img 
                src={sellerData.avatar} 
                alt={sellerData.name}
                className="w-24 h-24 rounded-full border-4 border-purple-200"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{sellerData.name}</h2>
                    <p className="text-gray-600 mb-2">{sellerData.username}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-lg">{sellerData.rating}</span>
                        <span className="text-gray-600">({sellerData.reviewCount} reviews)</span>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">{sellerData.level}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to="/edit-profile">Edit Profile</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Platform</p>
                    <p className="text-lg font-semibold">{sellerData.platform}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Followers</p>
                    <p className="text-lg font-semibold">{sellerData.followers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Services</p>
                    <p className="text-lg font-semibold">{sellerData.services.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">${earnings.total}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-blue-600">${earnings.pending}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available</p>
                  <p className="text-3xl font-bold text-purple-600">${earnings.available}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Orders</p>
                  <p className="text-3xl font-bold text-orange-600">{sellerOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {sellerOrders.length > 0 ? (
                <div className="space-y-4">
                  {sellerOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{order.id}</div>
                        <Badge className="bg-blue-100 text-blue-800 capitalize">
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{order.requirements}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Due: {order.deliveryDate}</span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/messages?order=${order.id}`}>
                              <MessageSquare className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link to={`/order/${order.id}`}>Deliver</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No active orders</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Services */}
          <Card>
            <CardHeader>
              <CardTitle>My Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellerData.services.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex space-x-4">
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{service.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">From ${service.packages.basic.price}</p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/service/${service.id}`}>View</Link>
                          </Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;