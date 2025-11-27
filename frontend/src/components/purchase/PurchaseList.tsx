import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Receipt } from '@mui/icons-material';
import { usePurchases } from '../../hooks/usePurchases';
import { PurchaseStatus } from '../../types/purchase';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

const statusColors = {
  [PurchaseStatus.DRAFT]: 'default',
  [PurchaseStatus.PENDING]: 'warning',
  [PurchaseStatus.ORDERED]: 'info',
  [PurchaseStatus.RECEIVED]: 'success',
  [PurchaseStatus.PARTIALLY_RECEIVED]: 'info',
  [PurchaseStatus.CANCELLED]: 'error',
  [PurchaseStatus.RETURNED]: 'error',
  [PurchaseStatus.PAID]: 'success',
};

const PurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  const { purchases, pagination, isLoading, deletePurchase } = usePurchases({
    page: page + 1,
    size: rowsPerPage,
    status: filters.status as PurchaseStatus,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (id: number) => {
    navigate(`/purchases/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/purchases/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      await deletePurchase.mutateAsync(id);
    }
  };

  const handleCreate = () => {
    navigate('/purchases/new');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(0);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Purchases</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleCreate}
        >
          New Purchase
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="">All Status</option>
                {Object.values(PurchaseStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Due</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id} hover>
                    <TableCell>{purchase.invoiceNumber}</TableCell>
                    <TableCell>
                      {format(new Date(purchase.purchaseDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{purchase.supplierName}</TableCell>
                    <TableCell>
                      <Chip
                        label={purchase.status}
                        color={statusColors[purchase.status] as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(purchase.totalAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(purchase.paidAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(purchase.dueAmount)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleView(purchase.id)}
                        title="View"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(purchase.id)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(purchase.id)}
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/purchases/${purchase.id}/receipt`)
                        }
                        title="View Receipt"
                      >
                        <Receipt fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={pagination?.totalItems || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default PurchaseList;
