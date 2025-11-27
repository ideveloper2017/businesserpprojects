import React, { useState, useEffect } from 'react';
import { Permission } from '../../types/user.types';
import { permissionApi } from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface PermissionFormProps {
  permission?: Permission;
  onSaved: () => void;
  onCancel: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ permission, onSaved, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Permission, 'id'>>({ 
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const isEditMode = !!permission;

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description || ''
      });
    }
  }, [permission]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && permission) {
        await permissionApi.update(permission.id, formData);
        toast.success('Permission updated successfully');
      } else {
        await permissionApi.create(formData);
        toast.success('Permission created successfully');
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
        <Label htmlFor="name">Permission Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditMode ? 'Update Permission' : 'Create Permission'}
        </Button>
      </div>
    </form>
  );
};

export default PermissionForm;
