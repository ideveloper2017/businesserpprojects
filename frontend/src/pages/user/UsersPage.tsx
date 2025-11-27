import React, { useState, useCallback } from 'react';
import { User } from '../../types/user.types.ts';
import UserList from '../../components/users/UserList.tsx';
import UserForm from '../../components/users/UserForm.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog.tsx';

const UsersPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const handleAddNew = () => {
    setSelectedUser(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUser(undefined);
  };

  const handleUserSaved = useCallback(() => {
    handleFormClose();
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={handleAddNew}>Add New User</Button>
      </div>

      <UserList key={refreshKey} onEdit={handleEdit} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSaved={handleUserSaved}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
