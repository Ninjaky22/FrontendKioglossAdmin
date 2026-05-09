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
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory'; // Para "Todos"
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
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

// Configuración de colores para los estados (Aesthetics)
const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: '#af5f00', bg: '#fff8e1', icon: <TimerIcon /> },
  PROCESSING: { label: 'Procesando', color: '#9b30a0', bg: '#fce4ff', icon: <SettingsIcon /> },
  SHIPPED: { label: 'Enviado', color: '#0070f3', bg: '#e6f2ff', icon: <LocalShippingIcon /> },
  DELIVERED: { label: 'Entregado', color: '#008a00', bg: '#e8f5e9', icon: <CheckCircleIcon /> },
  CANCELLED: { label: 'Cancelado', color: '#d32f2f', bg: '#ffebee', icon: <CancelIcon /> },
} as const;

const STATUS_VARIANTS: Record<string, { canonical: keyof typeof STATUS_CONFIG; label?: string }> = {
  PENDING: { canonical: 'PENDING' },
  PENDIENTE: { canonical: 'PENDING', label: 'Pendiente' },
  PENDIENTES: { canonical: 'PENDING', label: 'Pendientes' },
  PROCESSING: { canonical: 'PROCESSING' },
  PROCESANDO: { canonical: 'PROCESSING', label: 'Procesando' },
  EN_PROCESO: { canonical: 'PROCESSING', label: 'En Proceso' },
  EN_PREPARACION: { canonical: 'PROCESSING', label: 'En Preparacion' },
  SHIPPED: { canonical: 'SHIPPED' },
  ENVIADO: { canonical: 'SHIPPED', label: 'Enviado' },
  ENVIADOS: { canonical: 'SHIPPED', label: 'Enviados' },
  DELIVERED: { canonical: 'DELIVERED' },
  ENTREGADO: { canonical: 'DELIVERED', label: 'Entregado' },
  ENTREGADOS: { canonical: 'DELIVERED', label: 'Entregados' },
  CANCELLED: { canonical: 'CANCELLED' },
  CANCELADO: { canonical: 'CANCELLED', label: 'Cancelado' },
  CANCELADOS: { canonical: 'CANCELLED', label: 'Cancelados' },
};

const normalizeStatus = (status: string) =>
  status
    ? status
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_')
    : '';

const getStatusConfig = (status: string) => {
  const normalizedStatus = normalizeStatus(status);
  const variant = STATUS_VARIANTS[normalizedStatus];
  const canonicalKey = variant?.canonical ?? (normalizedStatus as keyof typeof STATUS_CONFIG);
  const baseConfig = STATUS_CONFIG[canonicalKey];

  if (baseConfig) {
    return { ...baseConfig, label: variant?.label ?? baseConfig.label };
  }

  return { label: status, color: '#666', bg: '#f5f5f5', icon: <InventoryIcon /> };
};

type OrderRow = OrderSummaryDTO & {
  user?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
  };
};

type PaginationDisplayedRowsParams = {
  from: number;
  to: number;
  count: number;
  estimated: number | undefined;
};

export default function OrderList() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const orders = useSelector(listaOrdersSelector);
  const isLoading = useSelector(obtenerOrdersEnProgresoSelector);
  const error = useSelector(errorObtenerOrdersSelector);
  const totalElements = useSelector(totalElementosOrdersSelector);

  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const statusFilter = searchParams.get('status') || 'ALL';

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: urlPage - 1,
    pageSize: INITIAL_PAGE_SIZE,
  });

  // LÓGICA ORIGINAL RESTAURADA EXACTAMENTE COMO LA TENÍAS
  const loadData = React.useCallback(() => {
    dispatch(
      AccionesOrder.obtenerOrders(
        paginationModel.page,
        paginationModel.pageSize,
        statusFilter === 'ALL' ? undefined : statusFilter
      )
    );
  }, [dispatch, paginationModel.page, paginationModel.pageSize, statusFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    navigate(`${pathname}?page=${model.page + 1}${statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}`, { replace: true });
  };

  const handleStatusFilterChange = (event: any) => {
    const newStatus = event.target.value;
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    navigate(`${pathname}?page=1${newStatus !== 'ALL' ? `&status=${newStatus}` : ''}`, { replace: true });
  };

  // Campos del DTO (customer, amount, date)
  const columns: GridColDef<OrderRow>[] = React.useMemo(
    () => [
      { 
        field: 'id', 
        headerName: 'ORDEN', 
        width: 100,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#610361', fontFamily: 'monospace' }}>
            #{params.value}
          </Typography>
        )
      },
      {
        field: 'customer',
        headerName: 'CLIENTE',
        flex: 1,
        minWidth: 280,
        renderCell: (params) => {
          const customer = params.value as CustomerBasicDTO;
          const user = params.row.user;
          const displayName = customer?.name || user?.name || 'Sin cliente';
          const secondaryText = customer?.email || user?.email || user?.phoneNumber || '';
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.2, minHeight: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                {displayName}
              </Typography>
              {secondaryText ? (
                <Typography variant="caption" sx={{ color: '#9b30a0', opacity: 0.8 }}>
                  {secondaryText}
                </Typography>
              ) : null}
            </Box>
          );
        },
      },
      {
        field: 'amount',
        headerName: 'TOTAL',
        width: 150,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#610361' }}>
            ${params.value?.toLocaleString('es-CO')}
          </Typography>
        ),
      },
      {
  field: 'status',
  headerName: 'ESTADO',
  width: 170,
  renderCell: (params) => {
    const config = getStatusConfig(params.value as string);
    return (
      <Chip
        // Pasamos el componente de icono directamente aquí
        icon={config.icon} 
        // El label ahora solo lleva el texto, sin el emoji
        label={config.label} 
        size="small"
        sx={{
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 700,
          fontSize: '0.75rem',
          borderRadius: '12px',
          border: `1px solid ${config.color}33`,
          // Esto asegura que el icono herede el color del texto del Chip
          '& .MuiChip-icon': { 
            color: 'inherit',
            marginLeft: '8px' // Ajuste de margen para que no quede pegado al borde
          },
        }}
      />
    );
  },
},
      {
        field: 'date',
        headerName: 'FECHA DE REGISTRO',
        width: 220,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
            {new Date(params.value as string).toLocaleDateString('es-CO', {
               timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Typography>
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'ACCIONES',
        width: 110,
        getActions: (params) => [
          <GridActionsCellItem
            icon={
              <Tooltip title="Ver Detalles">
                <Box sx={{ 
                  backgroundColor: '#ffffff', 
                  p: 0.8, 
                  borderRadius: 2, 
                  display: 'flex',
                  transition: '0.2s',
                  '&:hover': { backgroundColor: '#9b30a0', color: '#fff' }
                }}>
                  <VisibilityIcon fontSize="small" />
                </Box>
              </Tooltip>
            }
            label="Ver Detalle"
            onClick={() => navigate(`/orders/${params.row.id}`)}
          />,
        ],
      },
    ],
    [navigate]
  );

  return (
    <PageContainer title="Gestión de Pedidos" breadcrumbs={[{ title: 'Pedidos' }]}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: '24px', 
          border: '1px solid #f0d6fb',
          boxShadow: '0 10px 40px -10px rgba(155, 48, 160, 0.05)',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          maxWidth: '100%' 
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3} 
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ mb: 4 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <Box sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                backgroundColor: '#fdf4ff', 
                color: '#9b30a0',
                display: { xs: 'none', md: 'flex' }
             }}>
                <ShoppingBagIcon />
             </Box>
             <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#610361', lineHeight: 1.2 }}>
                   Listado de Pedidos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                   Administra y gestiona las ventas de Kiogloss
                </Typography>
             </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 220 }}>
  <InputLabel sx={{ color: '#9b30a0' }}>Filtrar por Estado</InputLabel>
  <Select 
    value={statusFilter} 
    label="Filtrar por Estado" 
    onChange={handleStatusFilterChange}
    sx={{ 
      borderRadius: '12px', 
      backgroundColor: '#fdf4ff',
      '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 } 
    }}
  >
    <MenuItem value="ALL" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <InventoryIcon fontSize="small" sx={{ color: '#9b30a0' }} /> Todos los pedidos
    </MenuItem>
    <MenuItem value="PENDING" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TimerIcon fontSize="small" sx={{ color: '#af5f00' }} /> Pendientes
    </MenuItem>
    <MenuItem value="PROCESSING" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <SettingsIcon fontSize="small" sx={{ color: '#9b30a0' }} /> En Proceso
    </MenuItem>
    <MenuItem value="SHIPPED" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LocalShippingIcon fontSize="small" sx={{ color: '#0070f3' }} /> Enviados
    </MenuItem>
    <MenuItem value="DELIVERED" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CheckCircleIcon fontSize="small" sx={{ color: '#008a00' }} /> Entregados
    </MenuItem>
    <MenuItem value="CANCELLED" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CancelIcon fontSize="small" sx={{ color: '#d32f2f' }} /> Cancelados
    </MenuItem>
  </Select>
</FormControl>

            <Tooltip title="Refrescar Lista">
              <IconButton 
                onClick={loadData} 
                sx={{ 
                  color: '#fdf4ff', 
                  backgroundColor: '#9b30a0',
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: '#fce4ff' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Box sx={{ 
          width: '100%', 
          height: { xs: 550, lg: 700 },
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#610361 !important',
            color: '#ffffff',
            borderRadius: '12px',
            borderBottom: 'none',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#610361 !important',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: '#ffffff !important',
            fontWeight: 800,
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'block',
            color: '#ffffff',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover, & .MuiDataGrid-cell.Mui-selected, & .MuiDataGrid-cell.Mui-selected:focus': {
            backgroundColor: 'transparent',
          },
          '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
            borderRight: '1px solid #ffffff',
          },
          '& .MuiDataGrid-columnHeader:last-of-type, & .MuiDataGrid-cell:last-of-type': {
            borderRight: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#fdf4ff',
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            padding: '4px 12px',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'hidden',
          },
          '& .MuiDataGrid-scrollbar--horizontal': {
            display: 'none',
          },
          '& .MuiTablePagination-root, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
            color: '#610361',
            fontWeight: 600,
          },
          '& .MuiTablePagination-select': {
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '4px 28px 4px 10px',
          },
          '& .MuiTablePagination-actions .MuiIconButton-root': {
            color: '#610361',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #f0d6fb',
            marginLeft: '4px',
            '&:hover': { backgroundColor: '#fce4ff' },
          },
          '& .MuiTablePagination-actions .MuiIconButton-root.Mui-disabled': {
            color: '#b58bb9',
            borderColor: '#f7e7fb',
          },
        }}>
          {error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {error.message || 'Error al conectar con el servidor'}
            </Alert>
          ) : (
            <DataGrid<OrderRow>
              rows={orders || []}
              rowCount={totalElements || 0}
              columns={columns}
              pagination
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              loading={isLoading}
              pageSizeOptions={[10, 25, 50]}
              localeText={{
                paginationRowsPerPage: 'Filas por pagina',
                paginationDisplayedRows: (params: PaginationDisplayedRowsParams) => {
                  const { from, to, count } = params;
                  return `${from}-${to} de ${count !== -1 ? count : `mas de ${to}`}`;
                },
              }}
              rowSelection={false}
              disableColumnMenu
              disableColumnSorting
              disableColumnFilter
              disableColumnSelector
              disableRowSelectionOnClick
              rowHeight={70}
            />
          )}
        </Box>
      </Paper>
    </PageContainer>
  );
}