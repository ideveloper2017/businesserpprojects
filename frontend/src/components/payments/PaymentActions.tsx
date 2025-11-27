import { MoreHorizontal, Download, FileText, Mail, Printer, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Payment } from '@/types/payment.types';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface PaymentActionsProps {
  payment: Payment;
  onDelete?: (paymentId: number) => void;
  onRefund?: (paymentId: number) => void;
  className?: string;
}

export function PaymentActions({
  payment,
  onDelete,
  onRefund,
  className = '',
}: PaymentActionsProps) {
  const navigate = useNavigate();

  const handleCopyId = () => {
    navigator.clipboard.writeText(payment.id.toString());
    toast({
      title: 'Copied!',
      description: 'Payment ID copied to clipboard',
    });
  };

  const handlePrintReceipt = () => {
    // Implement print functionality
    window.print();
  };

  const handleSendReceipt = () => {
    // Implement email receipt functionality
    toast({
      title: 'Not implemented',
      description: 'Email receipt functionality is not implemented yet',
    });
  };

  const handleDownloadReceipt = () => {
    // Implement download receipt functionality
    toast({
      title: 'Not implemented',
      description: 'Download receipt functionality is not implemented yet',
    });
  };

  const handleEdit = () => {
    navigate(`/payments/${payment.id}/edit`);
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy Payment ID</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handlePrintReceipt}>
            <Printer className="mr-2 h-4 w-4" />
            <span>Print Receipt</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleSendReceipt}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Email Receipt</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDownloadReceipt}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Download Receipt</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Payment</span>
          </DropdownMenuItem>
          
          {payment.status === 'COMPLETED' && onRefund && (
            <DropdownMenuItem 
              onClick={() => onRefund(payment.id)}
              className="text-orange-600 focus:text-orange-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Process Refund</span>
            </DropdownMenuItem>
          )}
          
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(payment.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Payment</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
