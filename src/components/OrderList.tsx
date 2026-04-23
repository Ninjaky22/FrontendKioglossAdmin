import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { AccionesOrder } from '../store/actions/order';
import {
  listaOrdersSelector,
  obtenerOrdersEnProgresoSelector,
  errorObtenerOrdersSelector,
  totalElementosOrdersSelector,
} from '../store/selectors/order';
import PageContainer from './PageContainer';
import type { OrderSummaryDTO, CustomerBasicDTO } from '../models/Order';

const INITIAL_PAGE_SIZE = 10;

export default function OrderList() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const orders = useSelector(listaOrdersSelector);
  const isLoading = useSelector(obtenerOrdersEnProgresoSelector);
  const error = useSelector(errorObtenerOrdersSelector);
  const totalElements = useSelector(totalElementosOrdersSelector);

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : INITIAL_PAGE_SIZE,
  });

  const [statusFilter, setStatusFilter] = React.useState(searchParams.get('status') || 'ALL');

  const loadData = React.useCallback(() => {
    dispatch(AccionesOrder.obtenerOrders(paginationModel.page, paginationModel.pageSize, statusFilter));
  }, [dispatch, paginationModel.page, paginationModel.pageSize, statusFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);
      searchParams.set('page', String(model.page));
      searchParams.set('pageSize', String(model.pageSize));
      navigate(`${pathname}?${searchParams.toString()}`);
    },
    [navigate, pathname, searchParams],
  );

  const handleStatusFilterChange = React.useCallback((e: any) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    if (newStatus === 'ALL') searchParams.delete('status');
    else searchParams.set('status', newStatus);
    searchParams.set('page', '0');
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    navigate(`${pathname}?${searchParams.toString()}`);
  }, [navigate, pathname, searchParams]);

  const handleViewOrder = React.useCallback(
    (order: OrderSummaryDTO) => () => {
      navigate(`/orders/${order.id}`);
    },
    [navigate],
  );

  const getStatusColor = (status: string) => {
    const map: any = { PENDING: 'warning', PROCESSING: 'info', SHIPPED: 'secondary', DELIVERED: 'success', CANCELLED: 'error' };
    return map[status.toUpperCase()] || 'default';
  };

  const columns = React.useMemo<GridColDef<OrderSummaryDTO>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'date', headerName: 'Fecha', width: 120 },
      { 
        field: 'customer', 
        headerName: 'Cliente', 
        width: 200, 
        valueGetter: (value: CustomerBasicDTO) => value?.name || 'N/A' 
      },
      { field: 'amount', headerName: 'Total', type: 'number', width: 120, valueFormatter: (value) => `$${value}` },
      { field: 'itemCount', headerName: 'Items', type: 'number', width: 100 },
      {
        field: 'status', headerName: 'Estado', width: 150,
        renderCell: (params) => (
          <Chip label={params.value} color={getStatusColor(params.value)} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
        ),
      },
      {
        field: 'actions', type: 'actions', flex: 1, align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem key="view-item" icon={<VisibilityIcon />} label="Ver" onClick={handleViewOrder(row)} />,
        ],
      },
    ],
    [handleViewOrder],
  );

  return (
    <PageContainer title="Pedidos" breadcrumbs={[{ title: 'Pedidos' }]}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={statusFilter} label="Estado" onChange={handleStatusFilterChange}>
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="PENDING">Pendiente</MenuItem>
              <MenuItem value="PROCESSING">Procesando</MenuItem>
              <MenuItem value="SHIPPED">Enviado</MenuItem>
              <MenuItem value="DELIVERED">Entregado</MenuItem>
              <MenuItem value="CANCELLED">Cancelado</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Recargar"><IconButton onClick={loadData}><RefreshIcon /></IconButton></Tooltip>
      </Stack>
      <Box sx={{ flex: 1, width: '100%', height: 600 }}>
        {error ? <Alert severity="error">{error.message}</Alert> : (
          <DataGrid<OrderSummaryDTO>
            rows={orders || []}
            rowCount={totalElements || 0}
            columns={columns}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            loading={isLoading}
            pageSizeOptions={[10, 25, 50]}
          />
        )}
      </Box>
    </PageContainer>
  );
}

