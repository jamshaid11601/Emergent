import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Users, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ChatsManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChat, setExpandedChat] = useState(null);

  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchChats();
  }, [user, navigate]);

  const fetchChats = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BACKEND_URL}/api/admin/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user1?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user2?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user1?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user2?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpanded = (convKey) => {
    setExpandedChat(expandedChat === convKey ? null : convKey);
  };

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

  if (!user || user.userType !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chats Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor all conversations between managers, clients, and influencers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Conversations</p>
                  <p className="text-3xl font-bold text-gray-900">{conversations.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Messages</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">
                    {new Set(conversations.flatMap(c => [c.user1Id, c.user2Id])).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search conversations by user name or email..."
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
                <p className="text-gray-500">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conv, index) => {
                  const convKey = `${conv.user1Id}-${conv.user2Id}`;
                  const isExpanded = expandedChat === convKey;
                  
                  return (
                    <div key={convKey} className="border rounded-lg overflow-hidden">
                      {/* Conversation Header */}
                      <div 
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleExpanded(convKey)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            {/* User 1 */}
                            <div className="flex items-center space-x-3">
                              <img
                                src={conv.user1?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.user1?.name}`}
                                alt={conv.user1?.name}
                                className="w-12 h-12 rounded-full border-2 border-purple-200"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{conv.user1?.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {conv.user1?.userType}
                                </Badge>
                              </div>
                            </div>

                            <MessageSquare className="w-5 h-5 text-gray-400" />

                            {/* User 2 */}
                            <div className="flex items-center space-x-3">
                              <img
                                src={conv.user2?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.user2?.name}`}
                                alt={conv.user2?.name}
                                className="w-12 h-12 rounded-full border-2 border-blue-200"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{conv.user2?.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {conv.user2?.userType}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <Badge className="bg-purple-600 mb-1">
                              {conv.messageCount} messages
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {formatTime(conv.lastMessageTime)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Recent Messages (Expanded) */}
                      {isExpanded && (
                        <div className="p-4 bg-white border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Messages</h4>
                          <div className="space-y-3">
                            {conv.recentMessages && conv.recentMessages.map((msg, idx) => {
                              const sender = msg.senderId === conv.user1Id ? conv.user1 : conv.user2;
                              return (
                                <div key={idx} className="flex items-start space-x-3">
                                  <img
                                    src={sender?.avatar}
                                    alt={sender?.name}
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="text-sm font-medium text-gray-900">{sender?.name}</p>
                                      <span className="text-xs text-gray-500">
                                        {new Date(msg.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{msg.message}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ChatsManagement;
