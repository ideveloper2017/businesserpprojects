import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, RefreshCw, Search, Download, CalendarIcon, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge';
import { PaymentsSummary } from '@/components/payments/PaymentsSummary';
import { PaymentActions } from '@/components/payments/PaymentActions';
import { formatCurrency } from '@/utils/formatters';
import {PaymentFilterParams, PaymentMethod, PaymentStatus} from "@/types/payment.types";
import {usePayments} from "@/hooks/usePayments";


const PAYMENT_TABS = [
  { id: 'all', label: 'All Payments' },
  { id: PaymentStatus.PENDING, label: 'Pending' },
  { id: PaymentStatus.COMPLETED, label: 'Completed' },
  { id: PaymentStatus.FAILED, label: 'Failed' },
  { id: PaymentStatus.REFUNDED, label: 'Refunded' },
];

const PAYMENT_METHODS = Object.values(PaymentMethod).map(method => ({
  value: method,
  label: method.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}));

export function PaymentsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const filters = useMemo<PaymentFilterParams>(() => {
    const params: PaymentFilterParams = {
      page: 1,
      size: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (selectedTab !== 'all') {
      params.status = selectedTab as PaymentStatus;
    }

    if (selectedMethods.length > 0) {
      params.paymentMethod = selectedMethods;
    }

    if (dateRange.from) {
      params.startDate = dateRange.from.toISOString();
    }
    if (dateRange.to) {
      const endOfDay = new Date(dateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      params.endDate = endOfDay.toISOString();
    }

    if (searchQuery.trim()) {
      if (/^#\d+$/.test(searchQuery)) {
        params.orderNumber = searchQuery.substring(1);
      } else if (/^\d+$/.test(searchQuery)) {
        params.query = searchQuery;
      } else {
        params.customerName = searchQuery;
      }
    }

    return params;
  }, [selectedTab, selectedMethods, dateRange, searchQuery]);

  const {
    payments = [],
    isLoading,
    error,
    fetchPayments,
    deletePayment,
    processRefund,
    updatePaymentStatus,
    summaryData: summary
  } = usePayments();

  // Fetch payments when filters change
  useEffect(() => {
    fetchPayments(filters);
  }, [fetchPayments, filters]);

  const handlePageChange = (page: number) => {
    fetchPayments({ ...filters, page });
  };

  const handleRefresh = async () => {
    await fetchPayments(filters);
  };
  
  // Calculate pagination
  const pagination = useMemo(() => ({
    page: filters.page || 1,
    size: filters.size || 10,
    total: payments.length,
    totalPages: Math.max(1, Math.ceil(payments.length / (filters.size || 10)))
  }), [filters.page, filters.size, payments.length]);

  const handleStatusUpdate = async (paymentId: number, status: PaymentStatus) => {
    try {
      await updatePaymentStatus(paymentId, status, 'Status updated via UI');
      toast({ title: 'Success', description: 'Payment status updated successfully' });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({ title: 'Error', description: 'Failed to update payment status', variant: 'destructive' });
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await deletePayment(paymentId);
        toast({ title: 'Success', description: 'Payment deleted successfully' });
      } catch (error) {
        console.error('Error deleting payment:', error);
        toast({ title: 'Error', description: 'Failed to delete payment', variant: 'destructive' });
      }
    }
  };

  const handleRefund = async (paymentId: number, amount?: number) => {
    const refundAmount = amount || prompt('Enter refund amount:');
    if (!refundAmount) return;

    const parsedAmount = parseFloat(refundAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid positive number', variant: 'destructive' });
      return;
    }

    try {
      await processRefund(paymentId, parsedAmount, 'Refund processed via UI');
      toast({ title: 'Success', description: 'Refund processed successfully' });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({ title: 'Error', description: 'Failed to process refund', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  if (isLoading) {
    return (
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Payments</h1>
              <p className="text-muted-foreground">Loading payments...</p>
            </div>
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[110px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Payments</h1>
              <p className="text-muted-foreground">Error loading payments</p>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
          <div className="rounded-lg border border-destructive p-4 text-destructive">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              <h3 className="font-medium">Failed to load payments</h3>
            </div>
            <p className="mt-2 text-sm">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">Manage and track payment transactions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/payments/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Payment
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PaymentsSummary
              totalPayments={summary?.totalPayments || 0}
              totalAmount={summary?.totalAmount || 0}
              successfulPayments={summary?.successfulPayments || 0}
              failedPayments={summary?.failedPayments || 0}
              loading={isLoading}
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                  placeholder="Search payments..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {PAYMENT_TABS.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select
                    value={selectedMethods}
                    onValueChange={setSelectedMethods}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                          dateRange.to ? (
                              <>
                                {format(dateRange.from, 'MMM d, yyyy')} -{' '}
                                {format(dateRange.to, 'MMM d, yyyy')}
                              </>
                          ) : (
                              format(dateRange.from, 'MMM d, yyyy')
                          )
                      ) : (
                          <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from || new Date()}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end">
                <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTab('all');
                      setSelectedMethods([]);
                      setDateRange({});
                    }}
                    className="text-muted-foreground"
                >
                  Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Payments</CardTitle>
              <CardDescription>
                {pagination?.total || 0} {pagination?.total === 1 ? 'payment' : 'payments'} found
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-8">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length > 0 ? (
                      payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">#{payment.id}</TableCell>
                            <TableCell>
                              {payment.order?.orderNumber ? (
                                  <Button
                                      variant="link"
                                      className="h-auto p-0"
                                      onClick={() => navigate(`/orders/${payment.orderId}`)}
                                  >
                                    #{payment.order.orderNumber}
                                  </Button>
                              ) : (
                                  'N/A'
                              )}
                            </TableCell>
                            <TableCell>{payment.order?.customerName || 'Guest'}</TableCell>
                            <TableCell>{formatDate(payment.createdAt)}</TableCell>
                            <TableCell className="capitalize">
                              {payment.paymentMethod.toLowerCase().replace('_', ' ')}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>
                              <PaymentStatusBadge status={payment.status} />
                            </TableCell>
                            <TableCell>
                              <PaymentActions
                                  payment={payment}
                                  onView={() => navigate(`/payments/${payment.id}`)}
                                  onEdit={() => navigate(`/payments/${payment.id}/edit`)}
                                  onDelete={() => handleDeletePayment(payment.id)}
                                  onRefund={() => handleRefund(payment.id)}
                                  onStatusChange={(status) => handleStatusUpdate(payment.id, status)}
                              />
                            </TableCell>
                          </TableRow>
                      ))
                  ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No payments found
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">
                  {pagination.pageSize * (pagination.page - 1) + 1}
                </span> to{' '}
                    <span className="font-medium">
                  {Math.min(pagination.pageSize * pagination.page, pagination.total)}
                </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> payments
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                          Previous
                        </Button>
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page > pagination.totalPages - 3) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                            <PaginationItem key={pageNum}>
                              <Button
                                  variant={pagination.page === pageNum ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                        >
                          Next
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}