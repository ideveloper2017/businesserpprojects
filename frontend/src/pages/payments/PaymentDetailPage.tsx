import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/components/ui/toast';
import { PaymentStatus } from '@/types/payment.types';
import { PaymentReceipt } from '@/components/payments/PaymentReceipt';
import { Badge } from '@/components/ui/badge';
import {useEffect, useState} from 'react';
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge';

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    payment, 
    isLoading, 
    error, 
    fetchPayment, 
    deletePayment,
    updatePaymentStatus,
    processRefund
  } = usePayments();

  const [showReceipt, setShowReceipt] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundNotes, setRefundNotes] = useState('');

  const paymentId = id ? parseInt(id) : 0;
  const maxRefundAmount = payment?.amount || 0;
  const isRefundable = payment?.status === PaymentStatus.COMPLETED || 
                     payment?.status === PaymentStatus.PARTIALLY_REFUNDED;

  useEffect(() => {
    if (paymentId) {
      fetchPayment(paymentId);
    }
  }, [fetchPayment, paymentId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await deletePayment(paymentId);
        toast({
          title: 'Success',
          description: 'Payment deleted successfully',
        });
        navigate('/payments');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete payment',
          variant: 'destructive',
        });
      }
    }
  };

  const handleStatusUpdate = async (status: PaymentStatus) => {
    try {
      await updatePaymentStatus(paymentId, status, `Status updated to ${status}`);
      toast({
        title: 'Success',
        description: `Payment marked as ${status.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
    }
  };

  const handleProcessRefund = async () => {
    if (!refundAmount || isNaN(parseFloat(refundAmount)) || parseFloat(refundAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid refund amount',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(refundAmount);
    if (amount > maxRefundAmount) {
      toast({
        title: 'Invalid amount',
        description: `Refund amount cannot exceed $${maxRefundAmount.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await processRefund(paymentId, amount, refundNotes || 'Refund processed');
      toast({
        title: 'Success',
        description: `Refund of $${amount.toFixed(2)} processed successfully`,
      });
      setShowRefundForm(false);
      setRefundAmount('');
      setRefundNotes('');
      fetchPayment(paymentId); // Refresh payment data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && !payment) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error?.message || 'Payment not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/payments')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Payment Details</h1>
          <p className="text-sm text-muted-foreground">
            Transaction #{payment.transactionId || payment.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                  <CardDescription className="text-sm">
                    Created on {format(new Date(payment.createdAt), 'MMM d, yyyy hh:mm a')}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/payments/${payment.id}/edit`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowReceipt(true)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Receipt
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Transaction ID</h3>
                    <p className="font-medium">{payment.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Order ID</h3>
                    <p className="font-medium">#{payment.orderId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                    <p className="font-medium capitalize">
                      {payment.paymentMethod.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                    <p className="text-2xl font-bold">${payment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="flex items-center space-x-2">
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                    <p className="font-medium">
                      {format(new Date(payment.updatedAt), 'MMM d, yyyy hh:mm a')}
                    </p>
                  </div>
                </div>
              </div>

              {payment.notes && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <p className="text-sm whitespace-pre-line">{payment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Refund Section */}
          {isRefundable && (
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Refund</CardTitle>
                <CardDescription className="text-sm">
                  Process a full or partial refund for this payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showRefundForm ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRefundForm(true)}
                  >
                    Process Refund
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="refundAmount">
                          Amount
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id="refundAmount"
                            className="pl-7 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="0.00"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            min="0.01"
                            max={maxRefundAmount}
                            step="0.01"
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Maximum refundable: ${maxRefundAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="refundNotes">
                          Reason for Refund (Optional)
                        </label>
                        <input
                          type="text"
                          id="refundNotes"
                          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="E.g., Customer requested refund"
                          value={refundNotes}
                          onChange={(e) => setRefundNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleProcessRefund}>
                        Process Refund
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowRefundForm(false);
                          setRefundAmount('');
                          setRefundNotes('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Status Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
              <CardDescription className="text-sm">
                Update the status of this payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(PaymentStatus).map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  className={`w-full justify-start ${payment.status === status ? 'bg-muted' : ''}`}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={payment.status === status}
                >
                  <StatusIcon status={status} className="mr-2 h-4 w-4" />
                  {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
              <CardDescription className="text-sm">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10"
              onClick={() => setShowReceipt(false)}
            >
              <XCircle className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </Button>
            <PaymentReceipt 
              payment={payment} 
              onClose={() => setShowReceipt(false)}
              className="border-0 shadow-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for status icons
function StatusIcon({ status, className = '' }: { status: PaymentStatus, className?: string }) {
  switch (status) {
    case PaymentStatus.PENDING:
      return <Clock className={`text-yellow-500 ${className}`} />;
    case PaymentStatus.COMPLETED:
      return <CheckCircle className={`text-green-500 ${className}`} />;
    case PaymentStatus.FAILED:
      return <XCircle className={`text-red-500 ${className}`} />;
    case PaymentStatus.REFUNDED:
    case PaymentStatus.PARTIALLY_REFUNDED:
      return <RefreshCw className={`text-blue-500 ${className}`} />;
    default:
      return <CreditCard className={`text-gray-500 ${className}`} />;
  }
}
