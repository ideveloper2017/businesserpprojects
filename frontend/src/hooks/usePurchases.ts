import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import purchaseService, {
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchaseStatus,
} from '../services/purchaseService';
import { ApiError } from '../types/api';

export const usePurchases = (params = {}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch all purchases with pagination and filters
  const {
    data: purchasesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['purchases', params],
    queryFn: () => purchaseService.getPurchases(params),
    keepPreviousData: true,
  });

  // Fetch a single purchase by ID
  const usePurchase = (id: number) => {
    return useQuery({
      queryKey: ['purchase', id],
      queryFn: () => purchaseService.getPurchase(id),
      enabled: !!id,
    });
  };

  // Create a new purchase
  const createPurchase = useMutation({
    mutationFn: (data: CreatePurchaseRequest) =>
      purchaseService.createPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('Purchase created successfully');
      navigate('/purchases');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to create purchase');
    },
  });

  // Update an existing purchase
  const updatePurchase = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePurchaseRequest }) =>
      purchaseService.updatePurchase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('Purchase updated successfully');
      navigate('/purchases');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to update purchase');
    },
  });

  // Delete a purchase
  const deletePurchase = useMutation({
    mutationFn: (id: number) => purchaseService.deletePurchase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('Purchase deleted successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to delete purchase');
    },
  });

  // Update purchase status
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PurchaseStatus }) =>
      purchaseService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('Purchase status updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  // Record a payment for a purchase
  const recordPayment = useMutation({
    mutationFn: ({
      id,
      amount,
      notes,
    }: {
      id: number;
      amount: number;
      notes?: string;
    }) => purchaseService.recordPayment(id, amount, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    },
  });

  // Mark purchase as received
  const markAsReceived = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      purchaseService.markAsReceived(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('Purchase marked as received');
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message || 'Failed to mark as received'
      );
    },
  });

  return {
    purchases: purchasesData?.data || [],
    pagination: {
      currentPage: purchasesData?.currentPage || 1,
      totalPages: purchasesData?.totalPages || 1,
      totalItems: purchasesData?.totalItems || 0,
    },
    isLoading,
    error,
    refetch,
    usePurchase,
    createPurchase,
    updatePurchase,
    deletePurchase,
    updateStatus,
    recordPayment,
    markAsReceived,
  };
};

export default usePurchases;
