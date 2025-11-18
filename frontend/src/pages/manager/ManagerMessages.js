import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Search, User, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ManagerMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || user.userType !== 'manager') {
      navigate('/');
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  const fetchConversations = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BACKEND_URL}/api/manager/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  if (!user || user.userType !== 'manager') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">All your conversations with clients and influencers</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              All Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="text-sm text-gray-400">
                  Start chatting with clients and influencers from your dashboard
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <Link
                    key={conv.userId}
                    to={`/manager/chat/${conv.userId}`}
                    className="block"
                  >
                    <div className="flex items-center p-4 hover:bg-gray-50 rounded-lg border border-transparent hover:border-purple-200 transition-all cursor-pointer">
                      <img
                        src={conv.otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser?.name}`}
                        alt={conv.otherUser?.name}
                        className="w-14 h-14 rounded-full border-2 border-purple-200"
                      />
                      <div className="flex-1 ml-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {conv.otherUser?.name || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {conv.lastMessage || 'No messages yet'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {conv.otherUser?.userType || 'user'}
                            </Badge>
                            {conv.messageCount > 0 && (
                              <Badge className="bg-purple-600">
                                {conv.messageCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">Start New Conversation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse clients and influencers to start chatting
              </p>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={() => navigate('/manager/dashboard')}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">Create Custom Order</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a custom order proposal to a client or influencer
              </p>
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
                onClick={() => navigate('/manager/dashboard')}
              >
                Create Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ManagerMessages;
