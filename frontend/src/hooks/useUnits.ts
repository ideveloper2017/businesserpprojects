import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Unit, CreateUnitDto, UpdateUnitDto } from '@/types/unit.types';
import { unitApi } from '@/lib/api';

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all units
  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await unitApi.getAll();
      // Ensure we have an array, even if the response is empty or malformed
      const units = Array.isArray(response?.data) ? response.data : [];
      console.log('Fetched units:', units);
      setUnits(units);
      return units;
    } catch (err) {
      console.error('Error fetching units:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch units';
      setError(message);
      toast.error(message);
      // Ensure we always have an array, even on error
      setUnits([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new unit
  const createUnit = useCallback(async (unitData: CreateUnitDto) => {
    setLoading(true);
    setError(null);
    try {
      const newUnit = await unitApi.create(unitData);
      setUnits(prev => [...prev, newUnit]);
      toast.success('Unit created successfully');
      return newUnit;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create unit';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing unit
  const updateUnit = useCallback(async (id: number, unitData: UpdateUnitDto) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUnit = await unitApi.update(id, unitData);
      setUnits(prev => 
        prev.map(unit => unit.id === id ? { ...unit, ...updatedUnit } : unit)
      );
      toast.success('Unit updated successfully');
      return updatedUnit;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update unit';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a unit
  const deleteUnit = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await unitApi.delete(id);
      setUnits(prev => prev.filter(unit => unit.id !== id));
      toast.success('Unit deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete unit';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle unit active status
  const toggleUnitStatus = useCallback(async (id: number, currentStatus: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = currentStatus;
      const response = await unitApi.toggleStatus(id, newStatus);
      setUnits(prev => 
        prev.map(unit => unit.id === id ? { ...unit, active: newStatus } : unit)
      );
      toast.success(`Unit ${newStatus ? 'activated' : 'deactivated'} successfully`);
      console.log(newStatus)
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update unit status';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    units,
    loading,
    error,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    toggleUnitStatus,
  };
};
