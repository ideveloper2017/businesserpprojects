import { format } from 'date-fns';
import { ArrowLeft, Printer, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus } from '@/types';

interface OrderDetailsProps {
  order: Order;
  onBack?: () => void;
  onPrint?: (order: Order) => void;
  onEmail?: (order: Order) => void;
  onDownload?: (order: Order) => void;
}

export function OrderDetails({
  order,
  onBack,
  onPrint,
  onEmail,
  onDownload,
}: OrderDetailsProps) {
  const getStatusBadge = (status: OrderStatus) => {
    const statusMap = {
      pending: { label: 'Pending', variant: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completed', variant: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', variant: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={`${statusInfo.variant} capitalize`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Order #{order.id}</h2>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.orderDate)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => onPrint?.(order)}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => onEmail?.(order)}
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => onDownload?.(order)}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="bg-gray-50 px-4 py-2 border-b font-medium grid grid-cols-12">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                <div className="divide-y">
                  {order.items.map((item, index) => (
                    <div key={index} className="px-4 py-3 grid grid-cols-12 items-center">
                      <div className="col-span-6">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.productId}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        ${item.unitPrice.toFixed(2)}
                      </div>
                      <div className="col-span-2 text-center">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-right font-medium">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t px-4 py-3 bg-gray-50">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-lg">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {order.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  {getStatusBadge(order.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(order.updatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  Customer ID: {order.customerId}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              {order.status === 'pending' && (
                <Button variant="outline" className="w-full justify-start text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Mark as Completed
                </Button>
              )}
              {order.status !== 'cancelled' && (
                <Button variant="outline" className="w-full justify-start text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
