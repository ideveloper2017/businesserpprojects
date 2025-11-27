import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, FileDown, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus } from '@/types/order.types';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/components/ui/toast';

interface OrderListProps {
  onViewOrder?: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
  onCreateOrder?: () => void;
  orders?: Order[];
  isLoading?: boolean;
}

export function OrderList({
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onCreateOrder,
  orders: externalOrders,
  isLoading: externalIsLoading,
}: OrderListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<{ field: keyof Order; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'desc',
  });

  // Use external orders if provided, otherwise use the hook
  const { orders: hookOrders, loading: hookLoading, deleteOrder, fetchOrders } = useOrders();
  const [internalOrders, setInternalOrders] = useState<Order[]>([]);
  const orders = externalOrders || internalOrders;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : hookLoading;

  // Fetch orders when component mounts and when filters change
  useEffect(() => {
    if (!externalOrders) {
      const loadOrders = async () => {
        try {
          const fetchedOrders = await fetchOrders({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchTerm || undefined,
            page: 0,
            limit: 100 // Adjust this based on your pagination needs
          });
          setInternalOrders(fetchedOrders);
        } catch (error) {
          console.error('Failed to fetch orders:', error);
          toast({
            title: 'Error',
            description: 'Failed to load orders. Please try again.',
            variant: 'destructive',
          });
        }
      };
      
      loadOrders();
    }
  }, [fetchOrders, statusFilter, searchTerm, externalOrders]);

  const handleSort = (field: keyof Order) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDelete = async (order: Order) => {
    if (onDeleteOrder) {
      onDeleteOrder(order);
      return;
    }

    if (window.confirm(`Are you sure you want to delete order #${order.id}?`)) {
      try {
        await deleteOrder(order.id);
        toast({
          title: 'Success',
          description: `Order #${order.id} has been deleted.`,
        });
      } catch (error) {
        console.error('Failed to delete order:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete order. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch =
        searchTerm === '' ||
        order.id.toString().includes(searchTerm) ||
        order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
    // .sort((a, b) => {
    //   let aValue = a[sortBy.field];
    //   let bValue = b[sortBy.field];
    //
    //   // Handle nested properties
    //   if (sortBy.field === 'customerName') {
    //     aValue = a.customerName;
    //     bValue = b.customerName;
    //   }
    //
    //   if (aValue === bValue) return 0;
    //   if (aValue === null || aValue === undefined) return 1;
    //   if (bValue === null || bValue === undefined) return -1;
    //
    //   if (sortBy.direction === 'asc') {
    //     return aValue > bValue ? 1 : -1;
    //   } else {
    //     return aValue < bValue ? 1 : -1;
    //   }
    // });

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="w-full bg-background pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value: OrderStatus | 'all') => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="h-9">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={onCreateOrder}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  Order ID
                  {sortBy.field === 'id' && (
                    <span className="ml-1">
                      {sortBy.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('customerName')}
              >
                <div className="flex items-center">
                  Customer
                  {sortBy.field === 'customerName' && (
                    <span className="ml-1">
                      {sortBy.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortBy.field === 'status' && (
                    <span className="ml-1">
                      {sortBy.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={()           => handleSort('user')}  >
                User
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Date
                  {sortBy.field === 'createdAt' && (
                    <span className="ml-1">
                      {sortBy.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.customer?.firstName} {order?.customer?.lastName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item.product?.name || `${item.productId}`}
                          <span className="text-muted-foreground">(x{item.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            if (onViewOrder) {
                              onViewOrder(order);
                            } else {
                              navigate(`/orders/${order.id}`);
                            }
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onEditOrder) {
                              onEditOrder(order);
                            } else {
                              navigate(`/orders/${order.id}/edit`);
                            }
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(order)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
