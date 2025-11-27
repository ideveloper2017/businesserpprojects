import React, { useState } from 'react';
import { Role } from '../../types/user.types.ts';
import RoleList from '../../components/roles/RoleList.tsx';
import RoleForm from '../../components/roles/RoleForm.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog.tsx';

const RolesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);

  const handleAddNew = () => {
    setSelectedRole(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedRole(undefined);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Button onClick={handleAddNew}>Add New Role</Button>
      </div>

      <RoleList onEdit={handleEdit} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          </DialogHeader>
          <RoleForm
            role={selectedRole}
            onSaved={() => {
              handleFormClose();
              // Trigger a refresh here if needed
            }}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPage;
