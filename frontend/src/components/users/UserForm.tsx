import React, { useEffect, useState } from 'react';
import { User, Role } from '../../types/user.types';
import { userApi, roleApi } from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';

interface UserFormProps {
  user?: User;
  onSaved: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSaved, onCancel }) => {
  const [formData, setFormData] = useState<Omit<User, 'id'>>({ 
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    active: true,
    roleIds: [],
    domain: 'local'
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!user;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleApi.getAll();
        setRoles(response.data);
      } catch (error) {
        toast.error('Failed to fetch roles');
        console.error(error);
      }
    };

    fetchRoles();

    if (user) {
      setFormData({
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        active: user.active,
        roleIds: user.roleIds,
        domain: user.domain
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (roleId: number) => {
    setFormData(prev => {
      const roleIds = prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId];
      return { ...prev, roleIds };
    });
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData({ ...formData, active: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && user) {
        await userApi.update(user.id, formData);
        toast.success('User updated successfully');
      } else {
        await userApi.create(formData);
        toast.success('User created successfully');
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
              id="passwrod"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Domain</Label>
          <Input
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
          />
        </div>


        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={handleActiveChange}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Roles</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {roles.map(role => (
            <div key={role.id} className="flex items-center space-x-2">
              <Checkbox
                id={`role-${role.id}`}
                checked={formData.roleIds.includes(role.id)}
                onCheckedChange={() => handleRoleChange(role.id)}
              />
              <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
