import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    username: '',
    socialPlatforms: []
  });

  const availablePlatforms = [
    'Instagram',
    'YouTube', 
    'TikTok',
    'Twitter',
    'Facebook',
    'LinkedIn'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        username: user.username || '',
        socialPlatforms: user.socialPlatforms || []
      });
      setImagePreview(user.avatar || '');
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData({ ...formData, avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const addSocialPlatform = () => {
    if (formData.socialPlatforms.length >= 3) {
      toast.error('You can add maximum 3 social platforms');
      return;
    }
    setFormData({
      ...formData,
      socialPlatforms: [
        ...formData.socialPlatforms,
        { platform: '', profileLink: '', followers: '' }
      ]
    });
  };

  const removeSocialPlatform = (index) => {
    setFormData({
      ...formData,
      socialPlatforms: formData.socialPlatforms.filter((_, i) => i !== index)
    });
  };

  const updateSocialPlatform = (index, field, value) => {
    const updated = [...formData.socialPlatforms];
    updated[index][field] = value;
    setFormData({ ...formData, socialPlatforms: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.updateUser(user._id || user.id, formData);
      
      // Update local user data
      const token = localStorage.getItem('token');
      localStorage.setItem('user', JSON.stringify(response.data));
      
      toast.success('Profile updated successfully!');
      navigate(user.userType === 'seller' ? '/seller/dashboard' : '/buyer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          to={user.userType === 'seller' ? '/seller/dashboard' : '/buyer/dashboard'} 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="@username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div>
                <Label>Profile Picture</Label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="relative">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">Max size: 5MB. Formats: JPG, PNG, GIF</p>
                  </div>
                </div>
              </div>

              {user.userType === 'seller' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Social Platforms (Max 3)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSocialPlatform}
                        disabled={formData.socialPlatforms.length >= 3}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Platform
                      </Button>
                    </div>
                    
                    {formData.socialPlatforms.length === 0 && (
                      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                        Add your social media platforms to showcase your reach
                      </div>
                    )}

                    <div className="space-y-4">
                      {formData.socialPlatforms.map((social, index) => (
                        <Card key={index} className="border-2">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-sm">Platform {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSocialPlatform(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs">Platform</Label>
                                <Select
                                  value={social.platform}
                                  onValueChange={(value) => updateSocialPlatform(index, 'platform', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availablePlatforms.map((platform) => (
                                      <SelectItem key={platform} value={platform}>
                                        {platform}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-xs">Profile Link</Label>
                                <Input
                                  placeholder="https://instagram.com/username"
                                  value={social.profileLink}
                                  onChange={(e) => updateSocialPlatform(index, 'profileLink', e.target.value)}
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Followers</Label>
                                <Input
                                  placeholder="e.g., 250K or 1.5M"
                                  value={social.followers}
                                  onChange={(e) => updateSocialPlatform(index, 'followers', e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Enter your current follower count
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(user.userType === 'seller' ? '/seller/dashboard' : '/buyer/dashboard')}
                >
                  Cancel
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

export default EditProfile;
