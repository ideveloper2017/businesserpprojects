import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { usePayments } from '@/hooks/usePayments';
import { Payment, PaymentStatus } from '@/types/payment.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const paymentFormSchema = z.object({
  orderId: z.number().min(1, 'Order ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  status: z.nativeEnum(PaymentStatus),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  initialData?: Payment;
  isSubmitting?: boolean;
  onSubmit: (data: PaymentFormValues) => Promise<void>;
}

export function PaymentForm({ initialData, isSubmitting, onSubmit }: PaymentFormProps) {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId?: string }>();
  
  const defaultValues: Partial<PaymentFormValues> = {
    orderId: initialData?.orderId || (orderId ? parseInt(orderId) : undefined),
    amount: initialData?.amount || 0,
    paymentMethod: initialData?.paymentMethod || 'CARD',
    status: initialData?.status || PaymentStatus.PENDING,
    transactionId: initialData?.transactionId || '',
    notes: initialData?.notes || '',
  };

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
  });

  const handleSubmit = async (data: PaymentFormValues) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Success',
        description: initialData ? 'Payment updated successfully' : 'Payment created successfully',
      });
      navigate('/payments');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while saving the payment',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="orderId">Order ID</Label>
          <Input
            id="orderId"
            type="number"
            {...form.register('orderId', { valueAsNumber: true })}
            disabled={!!initialData}
          />
          {form.formState.errors.orderId && (
            <p className="text-sm text-red-500">{form.formState.errors.orderId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...form.register('amount', { valueAsNumber: true })}
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            onValueChange={(value) => form.setValue('paymentMethod', value)}
            defaultValue={form.getValues('paymentMethod')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CARD">Credit/Debit Card</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.paymentMethod && (
            <p className="text-sm text-red-500">{form.formState.errors.paymentMethod.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value: PaymentStatus) => form.setValue('status', value)}
            defaultValue={form.getValues('status')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PaymentStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
          <Input id="transactionId" {...form.register('transactionId')} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea id="notes" {...form.register('notes')} className="min-h-[100px]" />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/payments')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Payment'}
        </Button>
      </div>
    </form>
  );
}
