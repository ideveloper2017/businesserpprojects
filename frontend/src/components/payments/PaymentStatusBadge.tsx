import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '@/types/payment.types';
import { CheckCircle2, Clock, XCircle, RefreshCw, CircleDashed } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const statusConfig = {
    [PaymentStatus.PENDING]: {
      label: 'Pending',
      variant: 'secondary' as const,
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    [PaymentStatus.COMPLETED]: {
      label: 'Completed',
      variant: 'default' as const,
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    },
    [PaymentStatus.FAILED]: {
      label: 'Failed',
      variant: 'destructive' as const,
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
    [PaymentStatus.REFUNDED]: {
      label: 'Refunded',
      variant: 'outline' as const,
      icon: <RefreshCw className="h-3 w-3 mr-1" />,
    },
    [PaymentStatus.PARTIALLY_REFUNDED]: {
      label: 'Partially Refunded',
      variant: 'outline' as const,
      icon: <RefreshCw className="h-3 w-3 mr-1" />,
    },
    [PaymentStatus.CANCELLED]: {
      label: 'Cancelled',
      variant: 'destructive' as const,
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
  };

  const config = statusConfig[status] || {
    label: status,
    variant: 'outline' as const,
    icon: <CircleDashed className="h-3 w-3 mr-1" />,
  };

  return (
    <Badge variant={config.variant} className={`inline-flex items-center ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
