import React from 'react';
import { Settings as SettingsIcon, Sliders } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import AdminLayout from '../../components/admin/AdminLayout';

const Settings = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Settings Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Sliders className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Settings panel coming soon</p>
              <p className="text-sm text-gray-400">
                This feature will include platform configuration, commission rates, email settings, and general preferences
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;