import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Printer, Download, Mail, X } from 'lucide-react';
import { Payment } from '@/types/payment.types';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentReceiptProps {
  payment: Payment;
  onClose?: () => void;
  className?: string;
  showActions?: boolean;
}

export function PaymentReceipt({
  payment,
  onClose,
  className = '',
  showActions = true,
}: PaymentReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Downloading receipt...');
  };

  const handleEmail = () => {
    // Implement email functionality
    console.log('Emailing receipt...');
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto print:shadow-none print:border-0 ${className}`}>
      <CardHeader className="pb-4 print:pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">Payment Receipt</CardTitle>
            <p className="text-sm text-muted-foreground">
              #{payment.transactionId || payment.id}
            </p>
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="print:hidden"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
            <p>{format(new Date(payment.createdAt), 'MMM d, yyyy hh:mm a')}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
            <p className="capitalize">{payment.paymentMethod.toLowerCase()}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-muted-foreground">Order ID</h3>
            <p>#{payment.orderId}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Amount Paid</h3>
            <p className="text-lg font-bold">${payment.amount.toFixed(2)}</p>
          </div>
          
          {payment.notes && (
            <div className="mt-4 p-3 bg-muted/30 rounded-md">
              <h4 className="text-sm font-medium mb-1">Notes</h4>
              <p className="text-sm">{payment.notes}</p>
            </div>
          )}
        </div>

        {showActions && (
          <div className="mt-6 flex justify-end space-x-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button size="sm" onClick={handleEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email Receipt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
