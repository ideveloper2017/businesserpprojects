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
import { getSettings, updateSetting, getSettingsByType } from '@/services/settingsService';
import { SettingsDto, SettingType } from '@/types/settings';

const generalSettingsSchema = z.object({
  appName: z.string().min(1, 'Application name is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  dateFormat: z.string().min(1, 'Date format is required'),
  timeFormat: z.string().min(1, 'Time format is required'),
  itemsPerPage: z.number().min(5, 'Minimum 5 items per page').max(100, 'Maximum 100 items per page'),
  enableNotifications: z.boolean(),
  maintenanceMode: z.boolean(),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
].sort();

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
];

const timeFormats = [
  { value: '12h', label: '12-hour (3:45 PM)' },
  { value: '24h', label: '24-hour (15:45)' },
];

export const GeneralSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      appName: 'OffPosRetail',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      itemsPerPage: 25,
      enableNotifications: true,
      maintenanceMode: false,
    },
  });

  // Load settings on component mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettingsByType(SettingType.GENERAL);
        const formattedSettings = settings.reduce((acc, setting) => ({
          ...acc,
          [setting.key]: setting.value
        }), {});
        
        reset({
          ...formattedSettings,
          itemsPerPage: formattedSettings.itemsPerPage ? parseInt(formattedSettings.itemsPerPage) : 25,
          enableNotifications: formattedSettings.enableNotifications !== 'false',
          maintenanceMode: formattedSettings.maintenanceMode === 'true',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load general settings',
          variant: 'destructive',
        });
      }
    };

    loadSettings();
  }, [reset, toast]);

  const onSubmit = async (data: GeneralSettingsFormData) => {
    try {
      setIsLoading(true);
      
      // Convert settings to key-value pairs
      const settingsToUpdate = [
        { key: 'appName', value: data.appName },
        { key: 'timezone', value: data.timezone },
        { key: 'dateFormat', value: data.dateFormat },
        { key: 'timeFormat', value: data.timeFormat },
        { key: 'itemsPerPage', value: data.itemsPerPage.toString() },
        { key: 'enableNotifications', value: data.enableNotifications.toString() },
        { key: 'maintenanceMode', value: data.maintenanceMode.toString() },
      ];
      
      // Update each setting
      await Promise.all(settingsToUpdate.map(async (setting) => {
        await updateSetting({
          key: setting.key,
          value: setting.value,
          type: SettingType.GENERAL,
          groupName: 'General',
          isPublic: true,
        });
      }));
      
      toast({
        title: 'Success',
        description: 'General settings updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update general settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="appName">Application Name *</Label>
          <Input
            id="appName"
            {...register('appName')}
            placeholder="My POS System"
            error={errors.appName?.message}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone *</Label>
          <Select
            onValueChange={(value) => setValue('timezone', value)}
            value={watch('timezone')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timezone && (
            <p className="text-sm font-medium text-destructive">
              {errors.timezone.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dateFormat">Date Format *</Label>
          <Select
            onValueChange={(value) => setValue('dateFormat', value)}
            value={watch('dateFormat')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              {dateFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.dateFormat && (
            <p className="text-sm font-medium text-destructive">
              {errors.dateFormat.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeFormat">Time Format *</Label>
          <Select
            onValueChange={(value) => setValue('timeFormat', value)}
            value={watch('timeFormat')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time format" />
            </SelectTrigger>
            <SelectContent>
              {timeFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timeFormat && (
            <p className="text-sm font-medium text-destructive">
              {errors.timeFormat.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="itemsPerPage">Items Per Page *</Label>
          <Input
            id="itemsPerPage"
            type="number"
            min="5"
            max="100"
            {...register('itemsPerPage', { valueAsNumber: true })}
            error={errors.itemsPerPage?.message}
          />
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableNotifications"
              checked={watch('enableNotifications')}
              onCheckedChange={(checked) => setValue('enableNotifications', checked)}
            />
            <Label htmlFor="enableNotifications">Enable Notifications</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenanceMode"
              checked={watch('maintenanceMode')}
              onCheckedChange={(checked) => setValue('maintenanceMode', checked)}
            />
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
      
      {/* Preview Section */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Preview</h3>
        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm">
            <span className="font-medium">Current Date:</span>{' '}
            {new Date().toLocaleDateString('en-US', {
              timeZone: watch('timezone'),
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium">Current Time:</span>{' '}
            {new Date().toLocaleTimeString('en-US', {
              timeZone: watch('timezone'),
              hour12: watch('timeFormat') === '12h',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </form>
  );
};
