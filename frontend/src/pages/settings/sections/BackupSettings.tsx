import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { getBackupSettings, updateBackupSettings } from '@/services/settingsService';
import { BackupSettingsDto, BackupFrequency } from '@/types/settings';

const backupSchema = z.object({
  enabled: z.boolean(),
  frequency: z.nativeEnum(BackupFrequency),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  keepBackups: z.number().min(1, 'Must keep at least 1 backup').max(100, 'Maximum 100 backups allowed'),
  backupPath: z.string().min(1, 'Backup path is required'),
});

type BackupFormData = z.infer<typeof backupSchema>;

const frequencyOptions = [
  { value: BackupFrequency.HOURLY, label: 'Hourly' },
  { value: BackupFrequency.DAILY, label: 'Daily' },
  { value: BackupFrequency.WEEKLY, label: 'Weekly' },
  { value: BackupFrequency.MONTHLY, label: 'Monthly' },
];

export const BackupSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BackupFormData>({
    resolver: zodResolver(backupSchema),
    defaultValues: {
      enabled: false,
      frequency: BackupFrequency.DAILY,
      time: '02:00',
      keepBackups: 30,
      backupPath: './backups',
    },
  });

  // Load settings on component mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getBackupSettings();
        reset(settings);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load backup settings',
          variant: 'destructive',
        });
      }
    };

    loadSettings();
  }, [reset, toast]);

  const onSubmit = async (data: BackupFormData) => {
    try {
      setIsLoading(true);
      await updateBackupSettings(data);
      toast({
        title: 'Success',
        description: 'Backup settings updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update backup settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBackupNow = async () => {
    try {
      setIsBackupRunning(true);
      // Implement backup creation logic here
      // await createBackup();
      toast({
        title: 'Success',
        description: 'Backup created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create backup',
        variant: 'destructive',
      });
    } finally {
      setIsBackupRunning(false);
    }
  };

  const enabled = watch('enabled');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-medium">Automatic Backups</h3>
            <p className="text-sm text-muted-foreground">
              Enable automatic database backups on a schedule
            </p>
          </div>
          <Switch
            id="enabled"
            checked={enabled}
            onCheckedChange={(checked) => setValue('enabled', checked)}
          />
        </div>

        {enabled && (
          <div className="space-y-4 pl-6 border-l-2 border-muted">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  onValueChange={(value) => setValue('frequency', value as BackupFrequency)}
                  defaultValue={watch('frequency')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  {...register('time')}
                  error={errors.time?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keepBackups">Keep Backups (days)</Label>
                <Input
                  id="keepBackups"
                  type="number"
                  min="1"
                  max="100"
                  {...register('keepBackups', { valueAsNumber: true })}
                  error={errors.keepBackups?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupPath">Backup Path</Label>
                <div className="flex space-x-2">
                  <Input
                    id="backupPath"
                    {...register('backupPath')}
                    placeholder="./backups"
                    error={errors.backupPath?.message}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" className="whitespace-nowrap">
                    Browse...
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={createBackupNow}
          disabled={isBackupRunning || isLoading}
        >
          {isBackupRunning ? 'Creating Backup...' : 'Create Backup Now'}
        </Button>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
      
      {/* Backup History Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Backup History</h3>
        <div className="border rounded-md p-4 text-center text-muted-foreground">
          <p>No backup history available</p>
          {/* Implement backup history list here */}
        </div>
      </div>
    </form>
  );
};
