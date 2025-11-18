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
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
      
      toast.success('User banned successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to ban user');
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
      <div className=\"space-y-6\">\n        <div className=\"flex items-center justify-between\">\n          <div>\n            <h1 className=\"text-3xl font-bold text-gray-900\">User Management</h1>\n            <p className=\"text-gray-600 mt-1\">Manage all platform users</p>\n          </div>\n        </div>\n\n        {/* Search */}\n        <Card>\n          <CardContent className=\"p-6\">\n            <div className=\"relative\">\n              <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5\" />\n              <Input\n                placeholder=\"Search users by name or email...\"\n                className=\"pl-10\"\n                value={searchQuery}\n                onChange={(e) => setSearchQuery(e.target.value)}\n              />\n            </div>\n          </CardContent>\n        </Card>\n\n        {/* Users Table */}\n        <Card>\n          <CardHeader>\n            <CardTitle>All Users ({filteredUsers.length})</CardTitle>\n          </CardHeader>\n          <CardContent>\n            {loading ? (\n              <div className=\"text-center py-8 text-gray-500\">Loading users...</div>\n            ) : filteredUsers.length === 0 ? (\n              <div className=\"text-center py-8 text-gray-500\">No users found</div>\n            ) : (\n              <div className=\"overflow-x-auto\">\n                <Table>\n                  <TableHeader>\n                    <TableRow>\n                      <TableHead>User</TableHead>\n                      <TableHead>Email</TableHead>\n                      <TableHead>Type</TableHead>\n                      <TableHead>Status</TableHead>\n                      <TableHead>Joined</TableHead>\n                      <TableHead className=\"text-right\">Actions</TableHead>\n                    </TableRow>\n                  </TableHeader>\n                  <TableBody>\n                    {filteredUsers.map((user) => (\n                      <TableRow key={user._id}>\n                        <TableCell>\n                          <div className=\"flex items-center space-x-3\">\n                            <img\n                              src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name}\n                              alt={user.name}\n                              className=\"w-10 h-10 rounded-full\"\n                            />\n                            <div>\n                              <div className=\"font-medium\">{user.name}</div>\n                              <div className=\"text-sm text-gray-500\">{user.username}</div>\n                            </div>\n                          </div>\n                        </TableCell>\n                        <TableCell>\n                          <div className=\"flex items-center space-x-2\">\n                            <Mail className=\"w-4 h-4 text-gray-400\" />\n                            <span className=\"text-sm\">{user.email}</span>\n                          </div>\n                        </TableCell>\n                        <TableCell>\n                          <Badge className={getUserTypeBadge(user.userType)}>\n                            {user.userType}\n                          </Badge>\n                        </TableCell>\n                        <TableCell>\n                          <Badge className={user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>\n                            {user.banned ? 'Banned' : 'Active'}\n                          </Badge>\n                        </TableCell>\n                        <TableCell>\n                          <div className=\"flex items-center space-x-2 text-sm text-gray-600\">\n                            <Calendar className=\"w-4 h-4\" />\n                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>\n                          </div>\n                        </TableCell>\n                        <TableCell className=\"text-right\">\n                          <div className=\"flex items-center justify-end space-x-2\">\n                            <Button\n                              variant=\"ghost\"\n                              size=\"sm\"\n                              onClick={() => {\n                                setSelectedUser(user);\n                                setEditDialogOpen(true);\n                              }}\n                            >\n                              <Edit className=\"w-4 h-4\" />\n                            </Button>\n                            <Button\n                              variant=\"ghost\"\n                              size=\"sm\"\n                              onClick={() => handleBanUser(user._id)}\n                            >\n                              {user.banned ? <UserCheck className=\"w-4 h-4\" /> : <Ban className=\"w-4 h-4\" />}\n                            </Button>\n                            <Button\n                              variant=\"ghost\"\n                              size=\"sm\"\n                              onClick={() => {\n                                setSelectedUser(user);\n                                setDeleteDialogOpen(true);\n                              }}\n                              className=\"text-red-600 hover:text-red-700\"\n                            >\n                              <Trash2 className=\"w-4 h-4\" />\n                            </Button>\n                          </div>\n                        </TableCell>\n                      </TableRow>\n                    ))}\n                  </TableBody>\n                </Table>\n              </div>\n            )}\n          </CardContent>\n        </Card>\n\n        {/* Delete Confirmation Dialog */}\n        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>\n          <DialogContent>\n            <DialogHeader>\n              <DialogTitle>Delete User</DialogTitle>\n              <DialogDescription>\n                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.\n              </DialogDescription>\n            </DialogHeader>\n            <DialogFooter>\n              <Button variant=\"outline\" onClick={() => setDeleteDialogOpen(false)}>\n                Cancel\n              </Button>\n              <Button variant=\"destructive\" onClick={handleDeleteUser}>\n                Delete User\n              </Button>\n            </DialogFooter>\n          </DialogContent>\n        </Dialog>\n      </div>\n    </AdminLayout>\n  );\n};\n\nexport default UsersManagement;
