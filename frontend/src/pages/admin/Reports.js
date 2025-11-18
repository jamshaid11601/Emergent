import React from 'react';
import { FileText, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import AdminLayout from '../../components/admin/AdminLayout';

const Reports = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate and view platform reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Reports Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Reports feature coming soon</p>
              <p className="text-sm text-gray-400">
                This feature will include user activity reports, campaign performance, order analytics, and custom report generation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Reports;