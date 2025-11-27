import { useState } from 'react';
import {
  Customer,
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,

} from '@/lib/api';

export function useCustomers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async (): Promise<Customer[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCustomers();
      setLoading(false);

      if (!response.success) {
        setError(response.error || 'Failed to fetch customers');
        return null;
      }

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
      const response = await getCustomerById(id);
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
      const response = await createCustomer(customer);
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
      const response = await updateCustomer(id, customer);
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
      const response = await deleteCustomer(id);
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

  const searchForCustomers = async (query: string): Promise<Customer[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchCustomers(query);
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
