import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, RefreshCcw, Check, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { serviceAPI, reviewAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [service, setService] = useState(null);
  const [serviceReviews, setServiceReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, reviewsRes] = await Promise.all([
          serviceAPI.getService(id),
          reviewAPI.getReviews(id)
        ]);
        setService(serviceRes.data);
        setServiceReviews(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Service not found</h2>
          <Button className="mt-4" asChild>
            <Link to="/browse">Browse Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentPackage = service.packages[selectedPackage];

  const handleOrder = () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/auth');
      return;
    }
    toast.success('Order placed successfully! Redirecting to order page...');
    setTimeout(() => {
      navigate('/buyer/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-purple-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/browse" className="hover:text-purple-600">Browse</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{service.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Image */}
            <img 
              src={service.image} 
              alt={service.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />

            {/* Influencer Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 border-2 border-purple-200">
                      <AvatarImage src={service.influencer.avatar} />
                      <AvatarFallback>{service.influencer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{service.influencer.name}</h3>
                      <p className="text-gray-600">{service.influencer.username}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{service.influencer.rating}</span>
                          <span className="text-gray-500 text-sm">({service.influencer.reviewCount})</span>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {service.influencer.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Followers</div>
                    <div className="text-2xl font-bold text-purple-600">{service.influencer.followers}</div>
                    <div className="text-sm text-gray-600 mt-1">{service.influencer.platform}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews ({serviceReviews.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="description">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">{service.description}</p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Get:</h3>
                    <ul className="space-y-2">
                      {currentPackage.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-700">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews">
                <Card>
                  <CardContent className="p-6">
                    {serviceReviews.length > 0 ? (
                      <div className="space-y-6">
                        {serviceReviews.map((review) => (
                          <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarImage src={review.buyerAvatar} />
                                <AvatarFallback>{review.buyerName[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900">{review.buyerName}</h4>
                                  <div className="flex items-center space-x-1">
                                    {[...Array(review.rating)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-700 mb-2">{review.comment}</p>
                                <p className="text-sm text-gray-500">{review.date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No reviews yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Package Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Package</h3>
                    <div className="flex space-x-2">
                      {Object.keys(service.packages).map((pkg) => (
                        <button
                          key={pkg}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            selectedPackage === pkg
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {service.packages[pkg].name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-3xl font-bold text-gray-900">${currentPackage.price}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Delivery Time</span>
                        </div>
                        <span className="font-semibold">{currentPackage.delivery} days</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <RefreshCcw className="w-4 h-4" />
                          <span>Revisions</span>
                        </div>
                        <span className="font-semibold">1 included</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Package Includes:</h4>
                    <ul className="space-y-2">
                      {currentPackage.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={handleOrder}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                  >
                    Order Now (${currentPackage.price})
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Payment secured through escrow. Your money is protected until delivery is complete.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetail;