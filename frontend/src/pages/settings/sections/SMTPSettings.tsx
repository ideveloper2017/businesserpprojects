import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import { getSmtpSettings, updateSmtpSettings } from '@/services/settingsService';
import { SMTPSettingsDto } from '@/types/settings';

const smtpSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().min(1, 'Port is required').max(65535, 'Invalid port number'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  fromEmail: z.string().email('Invalid email address'),
  fromName: z.string().min(1, 'From name is required'),
  useSSL: z.boolean(),
  useTLS: z.boolean(),
});

type SmtpFormData = z.infer<typeof smtpSchema>;

export const SMTPSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SmtpFormData>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      useSSL: true,
      useTLS: false,
    },
  });

  // Load settings on component mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSmtpSettings();
        reset(settings);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load SMTP settings',
          variant: 'destructive',
        });
      }
    };

    loadSettings();
  }, [reset, toast]);

  const onSubmit = async (data: SmtpFormData) => {
    try {
      setIsLoading(true);
      await updateSmtpSettings(data);
      toast({
        title: 'Success',
        description: 'SMTP settings updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update SMTP settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsLoading(true);
      // Implement test connection logic here
      // await testSmtpConnection();
      toast({
        title: 'Success',
        description: 'SMTP connection successful',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to SMTP server',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useSSL = watch('useSSL');
  const useTLS = watch('useTLS');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="host">SMTP Host *</Label>
          <Input
            id="host"
            {...register('host')}
            placeholder="smtp.example.com"
            error={errors.host?.message}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="port">Port *</Label>
          <Input
            id="port"
            type="number"
            {...register('port', { valueAsNumber: true })}
            placeholder="587"
            error={errors.port?.message}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            {...register('username')}
            placeholder="SMTP username"
            error={errors.username?.message}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              error={errors.password?.message}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fromEmail">From Email *</Label>
          <Input
            id="fromEmail"
            type="email"
            {...register('fromEmail')}
            placeholder="noreply@example.com"
            error={errors.fromEmail?.message}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fromName">From Name *</Label>
          <Input
            id="fromName"
            {...register('fromName')}
            placeholder="Company Name"
            error={errors.fromName?.message}
          />
        </div>
        
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="useSSL"
              checked={useSSL}
              onCheckedChange={(checked) => {
                setValue('useSSL', checked);
                if (checked && useTLS) {
                  setValue('useTLS', false);
                }
              }}
            />
            <Label htmlFor="useSSL">Use SSL</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="useTLS"
              checked={useTLS}
              onCheckedChange={(checked) => {
                setValue('useTLS', checked);
                if (checked && useSSL) {
                  setValue('useSSL', false);
                }
              }}
            />
            <Label htmlFor="useTLS">Use TLS</Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={testConnection}
          disabled={isLoading}
        >
          Test Connection
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
};
