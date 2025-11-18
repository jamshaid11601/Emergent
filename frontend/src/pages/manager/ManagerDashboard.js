import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Package, TrendingUp, Plus, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeInfluencers: 0,
    totalClients: 0,
    totalRevenue: 0
  });
  const [influencers, setInfluencers] = useState([]);
  const [clients, setClients] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || user.userType !== 'manager') {
      navigate('/');
      return;
    }
    fetchManagerData();
  }, [user, navigate]);

  const fetchManagerData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const [statsRes, influencersRes, clientsRes, campaignsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/manager/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/manager/influencers`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/manager/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/manager/campaigns`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStats(statsRes.data);
      setInfluencers(influencersRes.data);
      setClients(clientsRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Error fetching manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInfluencers = influencers.filter(inf =>
    inf.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.userType !== 'manager') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage campaigns, connect clients with influencers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Campaigns</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Influencers</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.activeInfluencers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalClients}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-orange-600">${stats.totalRevenue}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="influencers">Influencers</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Campaigns</CardTitle>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    asChild
                  >
                    <Link to="/manager/create-campaign">
                      <Plus className="w-4 h-4 mr-2" />
                      New Campaign
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No campaigns yet</p>
                    <Button asChild>
                      <Link to="/manager/create-campaign">Create Your First Campaign</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{campaign.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <Badge>{campaign.status}</Badge>
                              <span className="text-gray-600">{campaign.influencerCount} Influencers</span>
                              <span className="text-gray-600">Budget: ${campaign.budget}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/manager/campaign/${campaign._id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Influencers Tab */}
          <TabsContent value="influencers">
            <Card>
              <CardHeader>
                <CardTitle>Available Influencers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search influencers..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading influencers...</div>
                ) : filteredInfluencers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No influencers found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredInfluencers.map((influencer) => (
                      <div key={influencer._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <img
                            src={influencer.avatar}
                            alt={influencer.name}
                            className="w-16 h-16 rounded-full border-2 border-purple-200"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{influencer.name}</h3>
                            <p className="text-sm text-gray-600">{influencer.platform}</p>
                            <p className="text-sm text-purple-600 font-medium">{influencer.followers} followers</p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link to={`/manager/chat/${influencer._id}`}>
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Chat
                            </Link>
                          </Button>
                          <Button size="sm" className="flex-1">View Profile</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Your Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search clients..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading clients...</div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No clients found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredClients.map((client) => (
                      <div key={client._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className="w-16 h-16 rounded-full border-2 border-green-200"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{client.name}</h3>
                            <p className="text-sm text-gray-600">{client.email}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link to={`/manager/chat/${client._id}`}>
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Chat
                            </Link>
                          </Button>
                          <Button size="sm" className="flex-1">Create Order</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ManagerDashboard;