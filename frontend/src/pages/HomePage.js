import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { categoryAPI, serviceAPI } from '../services/api';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, servicesRes] = await Promise.all([
          categoryAPI.getCategories(),
          serviceAPI.getServices({ limit: 6 })
        ]);
        setCategories(categoriesRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Perfect
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Influencers </span>
              for Your Brand
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with top influencers across all platforms. From Instagram to TikTok, 
              get authentic engagement that drives real results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6" asChild>
                <Link to="/browse">
                  Explore Influencers
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-gray-50" asChild>
                <Link to="/auth?mode=register">Become an Influencer</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-purple-600">10K+</div>
                <div className="text-gray-600 text-sm">Influencers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">50K+</div>
                <div className="text-gray-600 text-sm">Projects Done</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-gray-600 text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <p className="text-gray-600">Find the perfect service for your brand</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link key={category.id} to={`/browse?category=${category.name}`}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count.toLocaleString()} services</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Influencers */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Rated Influencers</h2>
            <p className="text-gray-600">Work with the best in the industry</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              services.map((service) => (
                <Card key={service._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-0">
                    <Link to={`/service/${service._id}`}>
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="p-5">
                        <div className="flex items-center space-x-3 mb-3">
                          <img 
                            src={service.influencer?.avatar} 
                            alt={service.influencer?.name}
                            className="w-10 h-10 rounded-full border-2 border-purple-200"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{service.influencer?.name}</div>
                            <div className="text-sm text-gray-500">{service.influencer?.username}</div>
                          </div>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {service.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{service.influencer?.rating}</span>
                            <span className="text-gray-500 text-sm">({service.influencer?.reviewCount})</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            From ${service.packages.basic.price}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {service.influencer?.level}
                          </span>
                          <span className="text-sm text-gray-600">{service.influencer?.followers} followers</span>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" variant="outline" asChild>
              <Link to="/browse">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose InfluenceHub</h2>
          <p className="text-gray-600">The most trusted influencer marketplace</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Escrow protection ensures your money is safe until you're 100% satisfied with the delivery.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 mb-4">
              <Star className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Influencers</h3>
            <p className="text-gray-600">
              All influencers are verified with real engagement metrics and authentic followers.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Get your campaigns live quickly with influencers who deliver on time, every time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Grow Your Brand?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of brands working with top influencers on InfluenceHub
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6" asChild>
            <Link to="/browse">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;