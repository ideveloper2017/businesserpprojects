import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { WarehouseDetail } from './WarehouseDetail';
import WarehouseList from "@/components/warehouse/WarehouseList";
import { WarehouseForm } from "@/components/warehouse/WarehouseForm";

export const WarehouseRoutes: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/warehouses');
  };

  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/" element={<WarehouseList />} />
        <Route path="/new" element={<WarehouseForm onSuccess={handleSuccess} />} />
        <Route path=":id">
          <Route path="edit" element={<WarehouseForm onSuccess={handleSuccess} />} />
          <Route index element={<WarehouseDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/warehouses" replace />} />
      </Routes>
    </div>
  );
};

export default WarehouseRoutes;
