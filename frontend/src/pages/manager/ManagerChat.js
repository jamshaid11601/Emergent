import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Paperclip, DollarSign, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ManagerChat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    title: '',
    description: '',
    price: '',
    deliveryDays: ''
  });

  useEffect(() => {
    if (!user || user.userType !== 'manager') {
      navigate('/');
      return;
    }
    fetchChatData();
  }, [userId, user, navigate]);

  const fetchChatData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const [userRes, messagesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/manager/chat/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setOtherUser(userRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${BACKEND_URL}/api/manager/chat/${userId}`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewMessage('');
      fetchChatData();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleCreateCustomOrder = async () => {
    if (!orderForm.title || !orderForm.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${BACKEND_URL}/api/manager/custom-order`,
        {
          ...orderForm,
          recipientId: userId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Custom order created and sent!');
      setCreateOrderOpen(false);
      setOrderForm({ title: '', description: '', price: '', deliveryDays: '' });
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  if (!user || user.userType !== 'manager') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/manager/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="h-[calc(100vh-200px)]">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {otherUser && (
                  <>
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <CardTitle>{otherUser.name}</CardTitle>
                      <p className="text-sm text-gray-600">{otherUser.userType}</p>
                    </div>
                  </>
                )}
              </div>
              <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Create Custom Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom Order</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Order Title *</Label>
                      <Input
                        placeholder="e.g., Multi-influencer campaign"
                        value={orderForm.title}
                        onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Order details..."
                        value={orderForm.description}
                        onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price ($) *</Label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={orderForm.price}
                          onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Delivery (days)</Label>
                        <Input
                          type="number"
                          placeholder="7"
                          value={orderForm.deliveryDays}
                          onChange={(e) => setOrderForm({ ...orderForm, deliveryDays: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={handleCreateCustomOrder}
                    >
                      Create & Send Order
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.senderId === user._id || msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                        msg.senderId === user._id || msg.senderId === user.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white border text-gray-900'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs mt-1 opacity-75">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ManagerChat;