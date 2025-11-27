import { useState } from 'react';
import { User } from "@/types/user.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UserForm from "@/components/users/UserForm.tsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import UserList from "@/components/users/UserList.tsx";

export function UserManagement() {
  // User state
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [refreshUserList, setRefreshUserList] = useState(0);

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  const handleUserFormClose = () => {
    setIsUserFormOpen(false);
    setSelectedUser(undefined);
  };

  const handleUserSaved = () => {
    setRefreshUserList(prev => prev + 1);
    handleUserFormClose();
    toast.success('User saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage system users and their accounts
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleAddUser}>Add New User</Button>
        </div>
        
        <UserList key={refreshUserList} onEdit={handleEditUser} />
      </div>

      <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSaved={handleUserSaved}
            onCancel={handleUserFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}