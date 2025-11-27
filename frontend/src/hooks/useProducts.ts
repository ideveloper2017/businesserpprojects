// src/hooks/useProducts.ts
import { useState, useCallback } from 'react';
import { productApi } from '@/lib/api';
import { UpdateProductRequest, CreateProductRequest, Product } from "@/types/product.types";

export const useProducts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.getAll();
      setProducts(response?.data?.data?.content || []);
      return response?.data?.data?.content || [];
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data: CreateProductRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.create(data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: number, data: UpdateProductRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.update(id, data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.delete(id);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};