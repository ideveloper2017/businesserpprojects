import React, { useState } from 'react';
import { Permission } from '../../types/user.types.ts';
import PermissionList from '../../components/permissions/PermissionList.tsx';
import PermissionForm from '../../components/permissions/PermissionForm.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog.tsx';

const PermissionsPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | undefined>(undefined);

  const handleAddNew = () => {
    setSelectedPermission(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedPermission(undefined);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Permission Management</h1>
        <Button onClick={handleAddNew}>Add New Permission</Button>
      </div>

      <PermissionList onEdit={handleEdit} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedPermission ? 'Edit Permission' : 'Add New Permission'}</DialogTitle>
          </DialogHeader>
          <PermissionForm
            permission={selectedPermission}
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

export default PermissionsPage;
