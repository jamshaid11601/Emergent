import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Star, Package, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BrowseManagers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${BACKEND_URL}/api/managers`);
      setManagers(response.data);
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithManager = (managerId) => {
    if (!user) {
      toast.error('Please login to chat with managers');
      navigate('/auth');
      return;
    }
    navigate(`/manager/chat/${managerId}`);
  };

  const filteredManagers = managers.filter(manager =>
    manager.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hire Campaign Managers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional campaign managers to help you run successful influencer marketing campaigns. 
            Let experts handle the complexities while you focus on your business.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search managers by name or expertise..."
              className="pl-12 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Expert Strategy</h3>
              <p className="text-gray-600 text-sm">
                Get professional campaign strategies tailored to your brand
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Direct Communication</h3>
              <p className="text-gray-600 text-sm">
                Chat directly with managers to discuss your campaign needs
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Guaranteed Results</h3>
              <p className="text-gray-600 text-sm">
                Work with verified managers who deliver on their promises
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Managers List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading managers...</p>
          </div>
        ) : filteredManagers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No managers found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManagers.map((manager) => (
              <Card key={manager._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Manager Avatar & Basic Info */}
                  <div className="text-center mb-4">
                    <img
                      src={manager.avatar}
                      alt={manager.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-200"
                    />
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {manager.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{manager.username}</p>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      Campaign Manager
                    </Badge>
                  </div>

                  {/* Bio */}
                  {manager.bio && (
                    <p className="text-sm text-gray-600 mb-4 text-center line-clamp-3">
                      {manager.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-purple-50 rounded-lg p-2">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Star className="w-3 h-3 text-purple-600" />
                        <span className="text-xs text-gray-600">Rating</span>
                      </div>
                      <p className="text-sm font-bold text-purple-600">
                        {manager.rating || '5.0'}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Package className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-gray-600">Campaigns</span>
                      </div>
                      <p className="text-sm font-bold text-blue-600">
                        {manager.totalCampaigns || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-gray-600">Orders</span>
                      </div>
                      <p className="text-sm font-bold text-green-600">
                        {manager.totalOrders || 0}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {manager.phone && (
                    <p className="text-xs text-gray-500 mb-4 text-center">
                      📞 {manager.phone}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => handleChatWithManager(manager._id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Manager
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/managers/${manager._id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Campaigns?</h2>
          <p className="text-xl mb-6 opacity-90">
            Connect with expert campaign managers who can help you achieve your marketing goals
          </p>
          {!user && (
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => navigate('/auth')}
            >
              Get Started Now
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BrowseManagers;
