import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { categoryAPI, serviceAPI } from '../services/api';

const BrowseServices = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  
  const [selectedCategories, setSelectedCategories] = useState(categoryFilter ? [categoryFilter] : []);
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, servicesRes] = await Promise.all([
          categoryAPI.getCategories(),
          serviceAPI.getServices({ search: searchQuery, category: categoryFilter, sort: sortBy })
        ]);
        setCategories(categoriesRes.data);
        setAllServices(servicesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchQuery, categoryFilter, sortBy]);

  const toggleCategory = (categoryName) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...allServices];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(service => 
        selectedCategories.includes(service.category)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.packages.basic.price - b.packages.basic.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.packages.basic.price - a.packages.basic.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.influencer.rating - a.influencer.rating);
        break;
      default:
        // recommended - already in good order
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Results for "${searchQuery}"` : categoryFilter || 'All Services'}
          </h1>
          <p className="text-gray-600">{filteredAndSortedServices.length} services available</p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`cat-${category.id}`}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={() => toggleCategory(category.name)}
                      />
                      <Label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Services Grid */}
          <div className="flex-1">
            {filteredAndSortedServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedServices.map((service) => (
                  <Card key={service._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-0">
                      <Link to={`/service/${service.id}`}>
                        <img 
                          src={service.image} 
                          alt={service.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="p-5">
                          <div className="flex items-center space-x-3 mb-3">
                            <img 
                              src={service.influencer.avatar} 
                              alt={service.influencer.name}
                              className="w-10 h-10 rounded-full border-2 border-purple-200"
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{service.influencer.name}</div>
                              <div className="text-sm text-gray-500">{service.influencer.platform}</div>
                            </div>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-3 line-clamp-2 h-12">
                            {service.title}
                          </h3>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{service.influencer.rating}</span>
                              <span className="text-gray-500 text-sm">({service.influencer.reviewCount})</span>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {service.influencer.level}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-600">{service.influencer.followers} followers</span>
                            <div className="text-lg font-bold text-gray-900">
                              From ${service.packages.basic.price}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No services found matching your criteria</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSelectedCategories([])}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BrowseServices;