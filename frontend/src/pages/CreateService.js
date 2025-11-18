import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { serviceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateService = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: '',
    packages: {
      basic: {
        name: 'Basic',
        price: 0,
        delivery: 1,
        features: ['']
      },
      standard: {
        name: 'Standard',
        price: 0,
        delivery: 1,
        features: ['']
      },
      premium: {
        name: 'Premium',
        price: 0,
        delivery: 1,
        features: ['']
      }
    }
  });

  const categories = [
    'Social Media Shoutouts',
    'Sponsored Content',
    'Brand Collaborations',
    'Video Reviews',
    'Product Unboxing',
    'Live Streaming',
    'Story Mentions',
    'Podcast Features'
  ];

  const handlePackageChange = (packageType, field, value) => {
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageType]: {
          ...prev.packages[packageType],
          [field]: value
        }
      }
    }));
  };

  const handleFeatureChange = (packageType, index, value) => {
    setFormData(prev => {
      const newFeatures = [...prev.packages[packageType].features];
      newFeatures[index] = value;
      return {
        ...prev,
        packages: {
          ...prev.packages,
          [packageType]: {
            ...prev.packages[packageType],
            features: newFeatures
          }
        }
      };
    });
  };

  const addFeature = (packageType) => {
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageType]: {
          ...prev.packages[packageType],
          features: [...prev.packages[packageType].features, '']
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop',
        packages: {
          basic: {
            ...formData.packages.basic,
            price: parseFloat(formData.packages.basic.price),
            delivery: parseInt(formData.packages.basic.delivery),
            features: formData.packages.basic.features.filter(f => f.trim())
          },
          standard: {
            ...formData.packages.standard,
            price: parseFloat(formData.packages.standard.price),
            delivery: parseInt(formData.packages.standard.delivery),
            features: formData.packages.standard.features.filter(f => f.trim())
          },
          premium: {
            ...formData.packages.premium,
            price: parseFloat(formData.packages.premium.price),
            delivery: parseInt(formData.packages.premium.delivery),
            features: formData.packages.premium.features.filter(f => f.trim())
          }
        }
      };
      
      await serviceAPI.createService(serviceData);
      toast.success('Service created successfully!');
      navigate('/seller/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.userType === 'buyer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only sellers can create services</p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/seller/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Service</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., I will promote your brand on Instagram"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service in detail..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input
                  id="image"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Packages */}
          {['basic', 'standard', 'premium'].map((packageType) => (
            <Card key={packageType}>
              <CardHeader>
                <CardTitle className="capitalize">{packageType} Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.packages[packageType].price}
                      onChange={(e) => handlePackageChange(packageType, 'price', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Delivery (days)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.packages[packageType].delivery}
                      onChange={(e) => handlePackageChange(packageType, 'delivery', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Features</Label>
                  {formData.packages[packageType].features.map((feature, index) => (
                    <Input
                      key={index}
                      className="mt-2"
                      placeholder="e.g., 1 Instagram post"
                      value={feature}
                      onChange={(e) => handleFeatureChange(packageType, index, e.target.value)}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => addFeature(packageType)}
                  >
                    Add Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              {loading ? 'Creating...' : 'Create Service'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/seller/dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CreateService;
