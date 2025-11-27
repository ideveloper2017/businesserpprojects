import React from 'react';
import { Unit } from '@/types/unit.types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye } from 'lucide-react';

interface UnitsTableProps {
  units: Unit[];
  onEdit: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
  onView: (unit: Unit) => void;
  onToggleStatus: (unit: Unit) => void;
  isLoading?: boolean;
}

export const UnitsTable: React.FC<UnitsTableProps> = ({
  units,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No units found. Create your first unit to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell className="font-medium">{unit.code}</TableCell>
              <TableCell>{unit.name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div
                    className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      unit.active ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></div>
                  <Badge variant={unit.active ? 'default' : 'secondary'}>
                    {unit.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {unit.create_at ? new Date(unit.create_at).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(unit)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(unit)}
                    title="Edit unit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(unit)}
                    title={unit.active ? 'Deactivate' : 'Activate'}
                  >
                    <div
                      className={`h-4 w-4 rounded-full ${
                        unit.active ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(unit)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete unit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
