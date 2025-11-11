import React, { useState } from 'react';
import { Send, Paperclip, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { messages, allServices, orders } from '../mock';

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Group messages by order
  const conversations = orders.map(order => {
    const service = allServices.find(s => s.id === order.serviceId);
    const orderMessages = messages.filter(m => m.orderId === order.id);
    const lastMessage = orderMessages[orderMessages.length - 1];
    
    return {
      orderId: order.id,
      service,
      order,
      messages: orderMessages,
      lastMessage,
      unreadCount: 0
    };
  });

  const filteredConversations = conversations.filter(conv => 
    conv.service?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.service?.influencer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success('Message sent!');
    setMessageText('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

        <Card className="h-[calc(100vh-220px)] overflow-hidden">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="divide-y">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.orderId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.orderId === conv.orderId ? 'bg-purple-50 hover:bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={conv.service.influencer.avatar} />
                        <AvatarFallback>{conv.service.influencer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conv.service.influencer.name}
                          </h3>
                          {conv.unreadCount > 0 && (
                            <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">{conv.service.title}</p>
                        {conv.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">{conv.lastMessage.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={selectedConversation.service.influencer.avatar} />
                        <AvatarFallback>{selectedConversation.service.influencer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.service.influencer.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Order #{selectedConversation.orderId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {selectedConversation.messages.map((message) => {
                      const isCurrentUser = message.senderId !== selectedConversation.service.influencer.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md`}>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isCurrentUser
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                  : 'bg-white text-gray-900 border'
                              }`}
                            >
                              <p className="text-sm font-medium mb-1">{message.senderName}</p>
                              <p>{message.message}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 bg-white border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon">
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      <Textarea
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 min-h-[44px] max-h-32 resize-none"
                        rows={1}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">Select a conversation to start messaging</p>
                    <p className="text-sm">Choose from your active orders on the left</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;