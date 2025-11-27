import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';
import { Unit } from '@/types/unit.types';
import { UnitsTable } from '@/components/units/UnitsTable';
import { UnitForm } from '@/components/units/UnitForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {useToast} from "@/components/ui/toast.tsx";

export const UnitsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    units,
    loading,
    error,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    toggleUnitStatus,
  } = useUnits();

  // Filter units based on search term
  const filteredUnits = React.useMemo(() => {
    if (!units) return [];
    const term = searchTerm.toLowerCase();
    return units.filter(
      (unit) =>
        unit.name?.toLowerCase().includes(term) ||
        unit.code?.toLowerCase().includes(term)
    );
  }, [units, searchTerm]);

  // Fetch units on component mount
  useEffect(() => {
    const loadUnits = async () => {
      try {
        await fetchUnits();
      } catch (err) {
        console.error('Failed to load units:', err);
      }
    };

    loadUnits();
  }, [fetchUnits]);

  // Handle form submission (create/update)
  const handleSubmit = async (data: any) => {
    try {
      if (selectedUnit) {
        // Update existing unit
        await updateUnit(selectedUnit.id!, data);
      } else {
        // Create new unit
        await createUnit(data);
      }
      setIsFormOpen(false);
      setSelectedUnit(null);
    } catch (err) {
      // Error is handled by the useUnits hook
      console.error('Error saving unit:', err);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!selectedUnit) return;
    
    try {
      await deleteUnit(selectedUnit.id!);
      setIsDeleteDialogOpen(false);
      setSelectedUnit(null);
    } catch (err) {
      // Error is handled by the useUnits hook
      console.error('Error deleting unit:', err);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (unit: Unit) => {
    try {
      await toggleUnitStatus(unit.id!, !unit.active);
    } catch (err) {
      // Error is handled by the useUnits hook
      console.error('Error toggling unit status:', err);
    }
  };

  // Open form in edit mode
  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsViewMode(false);
    setIsFormOpen(true);
  };

  // Open form in view mode
  const handleView = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsViewMode(true);
    setIsFormOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  // Reset form state when dialog is closed
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUnit(null);
    setIsViewMode(false);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Units</h1>
            <p className="text-muted-foreground">
              Manage your measurement units
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search units..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <UnitsTable
          units={filteredUnits}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          onToggleStatus={handleToggleStatus}
          isLoading={loading}
        />
      </div>

      {/* Create/Edit Unit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUnit ? (isViewMode ? 'View' : 'Edit') : 'Create New'} Unit
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <UnitForm
              unit={selectedUnit || undefined}
              onSubmit={handleSubmit}
              onCancel={handleFormClose}
              isLoading={loading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the unit "{selectedUnit?.name}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UnitsPage;
