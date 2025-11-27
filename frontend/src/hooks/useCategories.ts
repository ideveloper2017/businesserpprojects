import { useState, useCallback } from 'react';
import { CreateCategoryDto, UpdateCategoryDto } from '@/types/category';
import { categoryApi } from '@/lib/api';
import {useToast} from "@/components/ui/toast";


type ApiError = {
  message: string;
  status?: number;
  data?: any;
};

export function useCategories() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((error: any) => {
    console.error('Category API Error:', error);
    const errorMessage = error?.message || 'An error occurred while processing your request.';
    setError({ message: errorMessage, status: error?.status, data: error?.data });
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
    throw error;
  }, [toast]);

      const createCategory = useCallback(async (data: CreateCategoryDto) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[useCategories] Creating category with data:', data);
      const result = await categoryApi.create(data);
      console.log('[useCategories] Category created successfully:', result);
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      return result;
    } catch (error) {
      console.error('[useCategories] Error creating category:', error);
      return handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError, toast]);

  const updateCategory = useCallback(async (id: number, data: UpdateCategoryDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await categoryApi.update(id, data);
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
      return result;
    } catch (error) {
      return handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError, toast]);

  const deleteCategory = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await categoryApi.delete(id);
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, toast]);

  const getCategory = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await categoryApi.getById(id);
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getCategories = useCallback(async (parentId?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return parentId
        ? await categoryApi.getCategoryTree(true)
        : await categoryApi.getCategoryTree(false);
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);



  return {
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getCategories,
  };
}

export default useCategories;
