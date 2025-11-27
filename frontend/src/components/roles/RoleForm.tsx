import React, { useEffect, useState } from 'react';
import { Role, Permission } from '../../types/user.types';
import { roleApi, permissionApi } from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface RoleFormProps {
  role?: Role;
  onSaved: () => void;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSaved, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Role, 'id'>>({ 
    name: '',
    permissionIds: []
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!role;

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await permissionApi.getAll();
        setPermissions(response.data);
      } catch (error) {
        toast.error('Failed to fetch permissions');
        console.error(error);
      }
    };

    fetchPermissions();

    if (role) {
      setFormData({
        name: role.name,
        permissionIds: role.permissionIds || []
      });
    }
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePermissionChange = (permissionId: number) => {
    setFormData(prev => {
      const permissionIds = prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId];
      return { ...prev, permissionIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && role) {
        await roleApi.update(role.id, formData);
        toast.success('Role updated successfully');
      } else {
        await roleApi.create(formData);
        toast.success('Role created successfully');
      }
      onSaved();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Role Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Permissions</Label>
        <div className="h-64 overflow-y-auto border rounded p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {permissions.map(permission => (
              <div key={permission.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`permission-${permission.id}`}
                  checked={formData.permissionIds.includes(permission.id)}
                  onCheckedChange={() => handlePermissionChange(permission.id)}
                />
                <Label htmlFor={`permission-${permission.id}`} className="cursor-pointer">
                  {permission.name}
                </Label>
              </div>
            ))}
            {permissions.length === 0 && (
              <div className="text-sm text-gray-500 col-span-2">No permissions available</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditMode ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};


export default RoleForm;
