import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayments } from '@/hooks/usePayments';
import { PaymentForm } from '@/components/payments/PaymentForm';

export function EditPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { payment, fetchPayment, updatePayment } = usePayments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paymentId = id ? parseInt(id) : 0;

  useEffect(() => {
    if (paymentId) {
      fetchPayment(paymentId);
    }
  }, [fetchPayment, paymentId]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await updatePayment(paymentId, data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!payment) {
    return <div>Loading payment details...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(`/payments/${paymentId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Payment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentForm 
            initialData={payment} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
