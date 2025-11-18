import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Ban, UserCheck, Mail, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${BACKEND_URL}/api/admin/users/${userId}/ban`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${BACKEND_URL}/api/admin/users/${selectedUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserTypeBadge = (userType) => {
    const colors = {
      buyer: 'bg-blue-100 text-blue-800',
      seller: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[userType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all platform users</p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => navigate('/admin/create-manager')}
          >
            Create Manager
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getUserTypeBadge(user.userType)}>
                            {user.userType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {user.banned ? 'Banned' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBanUser(user._id)}
                            >
                              {user.banned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default UsersManagement;
