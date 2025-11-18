import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import AdminLayout from '../../components/admin/AdminLayout';

const Revenue = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Revenue Management</h1>
          <p className="text-gray-600 mt-1">Track and manage platform revenue</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Revenue tracking coming soon</p>
              <p className="text-sm text-gray-400">
                This feature will include detailed revenue analytics, commission tracking, and financial reports
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Revenue;