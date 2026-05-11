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
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  const theme = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { mode } = useColorScheme();
  const paletteMode = !mode || mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;
  const isDark = paletteMode === 'dark';
  const accentText = isDark ? theme.palette.common.white : theme.palette.primary.dark;
  const accentSoft = alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08);
  const listTextColor = isDark ? theme.palette.common.white : theme.palette.text.primary;

  const { pathname } = useLocation();
    const statusConfig = React.useMemo(
      () => ({
        PENDING: {
          label: 'Pendiente',
          color: theme.palette.warning.main,
          bg: alpha(theme.palette.warning.main, isDark ? 0.22 : 0.12),
          icon: <TimerIcon />,
        },
        PROCESSING: {
          label: 'Procesando',
          color: theme.palette.primary.main,
          bg: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.12),
          icon: <SettingsIcon />,
        },
        SHIPPED: {
          label: 'Enviado',
          color: theme.palette.info.main,
          bg: alpha(theme.palette.info.main, isDark ? 0.22 : 0.12),
          icon: <LocalShippingIcon />,
        },
        DELIVERED: {
          label: 'Entregado',
          color: theme.palette.success.main,
          bg: alpha(theme.palette.success.main, isDark ? 0.22 : 0.12),
          icon: <CheckCircleIcon />,
        },
        CANCELLED: {
          label: 'Cancelado',
          color: theme.palette.error.main,
          bg: alpha(theme.palette.error.main, isDark ? 0.22 : 0.12),
          icon: <CancelIcon />,
        },
      }),
      [theme.palette, isDark],
    );

    const menuPropsStyles = React.useMemo(
      () => ({
        PaperProps: {
          sx: {
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark
              ? '0 16px 40px rgba(0, 0, 0, 0.45)'
              : '0 10px 40px -10px rgba(155, 48, 160, 0.12)',
            mt: 1,
            backgroundColor: theme.palette.background.paper,
            '& .MuiMenuItem-root': {
              borderRadius: '8px',
              mx: 1,
              mb: 0.5,
              padding: '8px 12px',
              outline: 'none',
              '&:focus, &:focus-visible': { outline: 'none' },
              '&:hover': { backgroundColor: theme.palette.action.hover },
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                color: theme.palette.text.primary,
                fontWeight: 600,
                '&:hover': { backgroundColor: theme.palette.action.selected },
              },
            },
          },
        },
      }),
      [theme.palette, isDark],
    );

    const getStatusConfig = React.useCallback(
      (status: string) => {
        const normalizedStatus = normalizeStatus(status);
        const variant = STATUS_VARIANTS[normalizedStatus];
        const canonicalKey =
          variant?.canonical ?? (normalizedStatus as keyof typeof statusConfig);
        const baseConfig = statusConfig[canonicalKey];

        if (baseConfig) {
          return { ...baseConfig, label: variant?.label ?? baseConfig.label };
        }

        return {
          label: status,
          color: theme.palette.text.secondary,
          bg: alpha(theme.palette.text.primary, isDark ? 0.14 : 0.06),
          icon: <InventoryIcon />,
        };
      },
      [statusConfig, theme.palette, isDark],
    );
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
          <Typography variant="body2" sx={{ fontWeight: 800, color: listTextColor, fontFamily: 'monospace' }}>
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
              <Typography variant="body2" sx={{ fontWeight: 600, color: listTextColor }}>
                {displayName}
              </Typography>
              {secondaryText ? (
                <Typography variant="caption" sx={{ color: listTextColor, opacity: 0.85 }}>
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
          <Typography variant="body2" sx={{ fontWeight: 700, color: listTextColor }}>
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
          color: isDark ? theme.palette.common.white : config.color,
          fontWeight: 700,
          fontSize: '0.75rem',
          borderRadius: '12px',
          border: `1px solid ${alpha(isDark ? theme.palette.common.white : config.color, 0.3)}`,
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
          <Typography variant="body2" sx={{ color: listTextColor, fontSize: '0.85rem', opacity: 0.85 }}>
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
                <span>
                  <VisibilityIcon
                    fontSize="small"
                    sx={{
                      color: isDark
                        ? theme.palette.primary.light
                        : theme.palette.primary.main,
                    }}
                  />
                </span>
              </Tooltip>
            }
            label="Ver Detalle"
            onClick={() => navigate(`/orders/${params.row.id}`)}
          />,
        ],
      },
    ],
    [navigate, listTextColor, isDark, theme.palette]
  );

  return (
    <PageContainer title="Gestión de Pedidos" breadcrumbs={[{ title: 'Pedidos' }]}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: '24px', 
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : `1px solid ${theme.palette.divider}`,
          boxShadow: isDark
            ? '0 18px 40px rgba(0, 0, 0, 0.35)'
            : '0 10px 40px -10px rgba(155, 48, 160, 0.08)',
          backgroundColor: isDark ? '#0f0d16' : theme.palette.background.paper,
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
               backgroundColor: accentSoft, 
               color: theme.palette.primary.main,
                display: { xs: 'none', md: 'flex' }
             }}>
                <ShoppingBagIcon />
             </Box>
             <Box>
               <Typography variant="h6" sx={{ fontWeight: 800, color: accentText, lineHeight: 1.2 }}>
                   Listado de Pedidos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                   Administra y gestiona las ventas de Kiogloss
                </Typography>
             </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 220 }}>
  <InputLabel sx={{ color: isDark ? theme.palette.common.white : theme.palette.primary.main }}>Filtrar por Estado</InputLabel>
  <Select 
  value={statusFilter}
  label="Filtrar por Estado"
  onChange={handleStatusFilterChange}
  MenuProps={menuPropsStyles}
  sx={{ 
    borderRadius: '12px', 
    backgroundColor: accentSoft,
    
    // ELIMINACIÓN TOTAL DE BORDES
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none', // Quita el borde base
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none', // Quita el borde al pasar el mouse
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none', // Quita el borde cuando está seleccionado
    },

    // LIMPIEZA DE CONTORNOS (OUTLINES)
    '&.MuiOutlinedInput-root': {
      outline: 'none',
      '&:focus': {
        outline: 'none',
      }
    },
    
    '& .MuiSelect-select': { 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      '&:focus': {
        backgroundColor: 'transparent', // Evita el fondo gris al hacer clic
        outline: 'none',
      }
    }
  }}
>
  <MenuItem value="ALL" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <InventoryIcon fontSize="small" sx={{ color: theme.palette.primary.main }} /> Todos los pedidos
  </MenuItem>
  <MenuItem value="PENDING" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <TimerIcon fontSize="small" sx={{ color: theme.palette.warning.main }} /> Pendientes
  </MenuItem>
  <MenuItem value="PROCESSING" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <SettingsIcon fontSize="small" sx={{ color: theme.palette.primary.main }} /> En Proceso
  </MenuItem>
  <MenuItem value="SHIPPED" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <LocalShippingIcon fontSize="small" sx={{ color: theme.palette.info.main }} /> Enviados
  </MenuItem>
  <MenuItem value="DELIVERED" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} /> Entregados
  </MenuItem>
  <MenuItem value="CANCELLED" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CancelIcon fontSize="small" sx={{ color: theme.palette.error.main }} /> Cancelados
  </MenuItem>
</Select>
</FormControl>

            <Tooltip title="Refrescar Lista">
              <IconButton 
                onClick={loadData} 
                sx={{ 
                  color: theme.palette.getContrastText(theme.palette.primary.main),
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: theme.palette.primary.dark }
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
          '& .MuiDataGrid-root': { border: 'none', color: listTextColor },
          '& .MuiDataGrid-cell, & .MuiDataGrid-cellContent, & .MuiDataGrid-row': {
            color: listTextColor,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: `${theme.palette.primary.dark} !important`,
            color: theme.palette.getContrastText(theme.palette.primary.dark),
            borderRadius: '12px',
            borderBottom: 'none',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: `${theme.palette.primary.dark} !important`,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: `${theme.palette.getContrastText(theme.palette.primary.dark)} !important`,
            fontWeight: 800,
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'block',
            color: theme.palette.getContrastText(theme.palette.primary.dark),
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover, & .MuiDataGrid-cell.Mui-selected, & .MuiDataGrid-cell.Mui-selected:focus': {
            backgroundColor: 'transparent',
          },
          '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
            borderRight: `1px solid ${theme.palette.divider}`,
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
            backgroundColor: isDark ? '#121018' : theme.palette.background.paper,
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            padding: '4px 12px',
            overflow: 'hidden',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'hidden',
          },
          '& .MuiDataGrid-scrollbar--horizontal': {
            display: 'none',
          },
          '& .MuiTablePagination-root, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
            color: listTextColor,
            fontWeight: 600,
          },
          '& .MuiTablePagination-select': {
            backgroundColor: theme.palette.background.paper,
            borderRadius: '10px',
            padding: '4px 28px 4px 10px',
            color: listTextColor,
          },
          '& .MuiTablePagination-selectIcon': {
            color: listTextColor,
          },
          '& .MuiTablePagination-actions .MuiIconButton-root': {
            color: listTextColor,
            backgroundColor: theme.palette.background.paper,
            borderRadius: '10px',
            border: `1px solid ${theme.palette.divider}`,
            marginLeft: '4px',
            '&:hover': { backgroundColor: theme.palette.action.hover },
          },
          '& .MuiTablePagination-actions .MuiIconButton-root.Mui-disabled': {
            color: theme.palette.text.disabled,
            borderColor: theme.palette.divider,
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