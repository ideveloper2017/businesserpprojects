import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock data - replace with actual API calls
const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Administrator', status: 'Active' },
  { id: 2, name: 'Manager', email: 'manager@example.com', role: 'Manager', status: 'Active' },
  { id: 3, name: 'Cashier', email: 'cashier@example.com', role: 'Cashier', status: 'Inactive' },
];

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
  isActive: z.boolean().default(true),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

export const UsersSettings: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Cashier',
      isActive: true,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && currentUserId) {
        // Update existing user
        setUsers(users.map(user => 
          user.id === currentUserId 
            ? { ...user, ...data, status: data.isActive ? 'Active' : 'Inactive' } 
            : user
        ));
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        // Add new user
        const newUser = {
          id: Math.max(0, ...users.map(u => u.id)) + 1,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.isActive ? 'Active' : 'Inactive',
        };
        setUsers([...users, newUser]);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  const editUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('role', user.role);
      setValue('isActive', user.status === 'Active');
      setCurrentUserId(userId);
      setIsEditing(true);
      setIsDialogOpen(true);
    }
  };

  const deleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    }
  };

  const resetForm = () => {
    reset({
      name: '',
      email: '',
      role: 'Cashier',
      password: '',
      confirmPassword: '',
      isActive: true,
    });
    setCurrentUserId(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? 'Update user details below.' 
                    : 'Fill in the details to create a new user account.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="John Doe"
                    error={errors.name?.message}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="user@example.com"
                    error={errors.email?.message}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <select
                    id="role"
                    {...register('role')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                  {errors.role && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.role.message}
                    </p>
                  )}
                </div>
                
                {!isEditing && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register('password')}
                        placeholder="••••••••"
                        error={errors.password?.message}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        placeholder="••••••••"
                        error={errors.confirmPassword?.message}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                  <Label htmlFor="isActive">
                    {watch('isActive') ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update User' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editUser(user.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
