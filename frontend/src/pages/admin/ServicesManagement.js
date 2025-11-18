import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BACKEND_URL}/api/admin/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to fetch services');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveService = async (serviceId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${BACKEND_URL}/api/admin/services/${serviceId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Service approved successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to approve service');
    }
  };

  const handleRejectService = async (serviceId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${BACKEND_URL}/api/admin/services/${serviceId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Service rejected');
      fetchServices();
    } catch (error) {
      toast.error('Failed to reject service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${BACKEND_URL}/api/admin/services/${serviceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || service.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: services.length,
    pending: services.filter(s => s.status === 'pending').length,
    approved: services.filter(s => s.status === 'approved').length,
    rejected: services.filter(s => s.status === 'rejected').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-1">Review and manage all services</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={filter === 'all' ? 'ring-2 ring-purple-500' : ''}>
            <CardContent className="p-6 cursor-pointer" onClick={() => setFilter('all')}>
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className={filter === 'pending' ? 'ring-2 ring-purple-500' : ''}>
            <CardContent className="p-6 cursor-pointer" onClick={() => setFilter('pending')}>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className={filter === 'approved' ? 'ring-2 ring-purple-500' : ''}>
            <CardContent className="p-6 cursor-pointer" onClick={() => setFilter('approved')}>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card className={filter === 'rejected' ? 'ring-2 ring-purple-500' : ''}>
            <CardContent className="p-6 cursor-pointer" onClick={() => setFilter('rejected')}>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search services..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">Loading services...</div>
          ) : filteredServices.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No services found</div>
          ) : (
            filteredServices.map((service) => (
              <Card key={service._id} className="hover:shadow-lg transition-shadow">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{service.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{service.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusBadge(service.status || 'approved')}>
                      {service.status || 'approved'}
                    </Badge>
                    <span className="text-lg font-bold text-purple-600">
                      From ${service.packages?.basic?.price}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>By: {service.influencer?.name || 'Unknown'}</p>
                    <p className="text-xs mt-1">{service.category}</p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/service/${service._id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {service.status !== 'approved' && (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveService(service._id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {service.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRejectService(service._id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteService(service._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ServicesManagement;