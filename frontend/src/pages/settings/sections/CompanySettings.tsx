import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { getCompanySettings, updateCompanySettings } from '@/services/settingsService';
import { CompanySettingsDto } from '@/types/settings';

const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyEmail: z.string().email('Invalid email address'),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  companyLogo: z.string().optional(),
  companyWebsite: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type CompanyFormData = z.infer<typeof companySchema>;

export const CompanySettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getCompanySettings();
        reset(settings);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load company settings',
          variant: 'destructive',
        });
      }
    };

    loadSettings();
  }, [reset, toast]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsLoading(true);
      await updateCompanySettings(data);
      toast({
        title: 'Success',
        description: 'Company settings updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update company settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            {...register('companyName')}
            placeholder="Enter company name"
            error={errors.companyName?.message}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyEmail">Email *</Label>
          <Input
            id="companyEmail"
            type="email"
            {...register('companyEmail')}
            placeholder="Enter company email"
            error={errors.companyEmail?.message}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyPhone">Phone</Label>
          <Input
            id="companyPhone"
            {...register('companyPhone')}
            placeholder="Enter company phone"
            error={errors.companyPhone?.message}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyWebsite">Website</Label>
          <Input
            id="companyWebsite"
            type="url"
            {...register('companyWebsite')}
            placeholder="https://example.com"
            error={errors.companyWebsite?.message}
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyAddress">Address</Label>
          <Input
            id="companyAddress"
            {...register('companyAddress')}
            placeholder="Enter company address"
            error={errors.companyAddress?.message}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyLogo">Logo URL</Label>
          <Input
            id="companyLogo"
            {...register('companyLogo')}
            placeholder="https://example.com/logo.png"
            error={errors.companyLogo?.message}
          />
          {watch('companyLogo') && (
            <div className="mt-2">
              <img 
                src={watch('companyLogo')} 
                alt="Company Logo Preview" 
                className="h-20 w-auto object-contain"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
