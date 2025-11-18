import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, Calendar, Package, Search, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [searchInfluencer, setSearchInfluencer] = useState('');
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    budget: '',
    deliveryDays: '14'
  });

  useEffect(() => {
    if (!user || user.userType !== 'manager') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const [clientsRes, influencersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/manager/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/manager/influencers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setClients(clientsRes.data);
      setInfluencers(influencersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleAddInfluencer = (influencer) => {
    if (!selectedInfluencers.find(inf => inf._id === influencer._id)) {
      setSelectedInfluencers([...selectedInfluencers, influencer]);
      setSearchInfluencer('');
    }
  };

  const handleRemoveInfluencer = (influencerId) => {
    setSelectedInfluencers(selectedInfluencers.filter(inf => inf._id !== influencerId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.title || !formData.budget) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedInfluencers.length === 0) {
      toast.error('Please select at least one influencer');
      return;
    }

    setLoading(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${BACKEND_URL}/api/manager/campaigns`,
        {
          ...formData,
          influencerIds: selectedInfluencers.map(inf => inf._id)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Campaign created successfully!');
      navigate('/manager/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const filteredInfluencers = influencers.filter(inf =>
    inf.name?.toLowerCase().includes(searchInfluencer.toLowerCase()) &&
    !selectedInfluencers.find(selected => selected._id === inf._id)
  );

  if (!user || user.userType !== 'manager') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/manager/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="text-gray-600 mt-1">Set up a campaign order for your client with selected influencers</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client Selection */}
              <div>
                <Label htmlFor="clientId">Select Client *</Label>
                <select
                  id="clientId"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign Title */}
              <div>
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Product Launch Campaign"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Campaign Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the campaign goals, requirements, and deliverables..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Budget and Delivery */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Total Budget ($) *</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="budget"
                      type="number"
                      placeholder="5000"
                      className="pl-10"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryDays">Delivery Time (days) *</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="deliveryDays"
                      type="number"
                      placeholder="14"
                      className="pl-10"
                      value={formData.deliveryDays}
                      onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Influencer Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Attach Influencers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Influencers */}
              <div className="mb-4">
                <Label>Search and Add Influencers *</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search influencers by name..."
                    className="pl-10"
                    value={searchInfluencer}
                    onChange={(e) => setSearchInfluencer(e.target.value)}
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {searchInfluencer && filteredInfluencers.length > 0 && (
                  <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto bg-white shadow-lg">
                    {filteredInfluencers.slice(0, 5).map((influencer) => (
                      <div
                        key={influencer._id}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        onClick={() => handleAddInfluencer(influencer)}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={influencer.avatar}
                            alt={influencer.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium">{influencer.name}</p>
                            <p className="text-xs text-gray-500">{influencer.platform} - {influencer.followers} followers</p>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-purple-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Influencers */}
              {selectedInfluencers.length > 0 ? (
                <div className="space-y-2">
                  <Label>Selected Influencers ({selectedInfluencers.length})</Label>
                  <div className="space-y-2">
                    {selectedInfluencers.map((influencer) => (
                      <div
                        key={influencer._id}
                        className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={influencer.avatar}
                            alt={influencer.name}
                            className="w-10 h-10 rounded-full border-2 border-purple-300"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{influencer.name}</p>
                            <p className="text-xs text-gray-600">{influencer.platform} - {influencer.followers} followers</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInfluencer(influencer._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No influencers selected yet</p>
                  <p className="text-gray-400 text-xs">Search and add influencers to your campaign</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Ready to Create Campaign?</h3>
                  <p className="text-sm text-gray-600">
                    Campaign will be sent to the client as a custom order
                  </p>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={loading}
                >
                  <Package className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CreateCampaign;
