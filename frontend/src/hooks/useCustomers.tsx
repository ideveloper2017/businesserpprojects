import { useState } from 'react';
import {ApiResponse, customerApi} from '@/lib/api';
import {Customer} from "@/types/customer.types";

export function useCustomers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async (): Promise<Customer[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getCustomers();
      setLoading(false);

      if (!response.success) {
        setError(response.error || 'Failed to fetch customers');
        return null;
      }

      console.log(response.data || []);
      return response.data || [];
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred');
      return null;
    }
  };

  const fetchCustomerById = async (id: number): Promise<Customer | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getCustomerById(id);
      setLoading(false);

      if (!response.success) {
        setError(response.error || 'Failed to fetch customer');
        return null;
      }

      return response.data || null;
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred');
      return null;
    }
  };

  const addCustomer = async (customer: Customer): Promise<Customer | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.createCustomer(customer);
      setLoading(false);

      if (!response.success) {
        setError(response.error || 'Failed to create customer');
        return null;
      }

      return response.data || null;
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred');
      return null;
    }
  };

  const editCustomer = async (id: number, customer: Customer): Promise<Customer | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.updateCustomer(id, customer);
      setLoading(false);

      if (!response.success) {
        setError(response.error || 'Failed to update customer');
        return null;
      }

      return response.data || null;
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred');
      return null;
    }
  };

  const removeCustomer = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.deleteCustomer(id);
      setLoading(false);

      if (!response.success) {
        setError(response.error || 'Failed to delete customer');
        return false;
      }

      return true;
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred');
      return false;
    }
  };

  const searchForCustomers = async (query: string): Promise<ApiResponse<Customer[]> | any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.searchCustomers(query);
      setLoading(false);

      if (!response.success) {
        setError(response.error || 'Failed to search customers');
        return null;
      }

      return response?.data || [];
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred');
      return null;
    }
  };

  return {
    loading,
    error,
    fetchCustomers,
    fetchCustomerById,
    addCustomer,
    editCustomer,
    removeCustomer,
    searchForCustomers
  };
}
