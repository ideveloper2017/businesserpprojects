import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const statusMap = {
    pending: { label: 'Pending', variant: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    completed: { label: 'Completed', variant: 'bg-green-100 text-green-800 hover:bg-green-100' },
    cancelled: { label: 'Cancelled', variant: 'bg-red-100 text-red-800 hover:bg-red-100' },
  };

  const statusInfo = statusMap[status] || { 
    label: status, 
    variant: 'bg-gray-100 text-gray-800 hover:bg-gray-100' 
  };
  
  return (
    <Badge className={`${statusInfo.variant} capitalize ${className}`}>
      {statusInfo.label}
    </Badge>
  );
}
