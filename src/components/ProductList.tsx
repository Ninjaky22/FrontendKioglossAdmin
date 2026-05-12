import * as React from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { Alert, Box, IconButton, Stack, Tooltip, Chip, Paper, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { AccionesProduct } from '../store/actions/product';
import {
  listaProductosSelector,
  obtenerProductosEnProgresoSelector,
  errorObtenerProductosSelector,
  totalElementosProductosSelector,
} from '../store/selectors/product';
import PageContainer from './PageContainer';
import { extractErrorMessage } from '../utils/errorUtils';

const INITIAL_PAGE_SIZE = 10;

type PaginationDisplayedRowsParams = {
  from: number;
  to: number;
  count: number;
  estimated: number | undefined;
};

export default function ProductList() {
  const theme = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { mode } = useColorScheme();
  const paletteMode = !mode || mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;
  const isDark = paletteMode === 'dark';
  const accentText = isDark ? theme.palette.common.white : theme.palette.primary.dark;
  const accentSoft = alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08);
  const listTextColor = isDark ? theme.palette.common.white : theme.palette.text.primary;

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const products = useSelector(listaProductosSelector);
  const isLoading = useSelector(obtenerProductosEnProgresoSelector);
  const error = useSelector(errorObtenerProductosSelector);
  const totalElements = useSelector(totalElementosProductosSelector) as number;

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : INITIAL_PAGE_SIZE,
  });

  const loadData = React.useCallback(() => {
    dispatch(AccionesProduct.obtenerProductos(paginationModel.page, paginationModel.pageSize));
  }, [dispatch, paginationModel]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    searchParams.set('page', String(model.page));
    searchParams.set('pageSize', String(model.pageSize));
    navigate(`${pathname}?${searchParams.toString()}`);
  };

  const handleCreateClick = () => navigate('/products/new');
  const handleViewClick = (id: string) => () => navigate(`/products/${id}`);

  const handleDeleteClick = (product: any) => async () => {
    const confirmed = await dialogs.confirm(`¿Deseas eliminar "${product.name}"?`, {
      title: 'Eliminar Producto',
      severity: 'error',
      okText: 'Eliminar',
    });

    if (confirmed) {
      try {
        await dispatch(AccionesProduct.borrarProducto(product.id));
        notifications.show('Producto eliminado', { severity: 'success' });
        loadData();
      } catch (err) {
        notifications.show(extractErrorMessage(err), { severity: 'error' });
      }
    }
  };

  const columns = React.useMemo<GridColDef[]>(() => [
    { field: 'id', headerName: 'ID', width: 70, align: 'center', headerAlign: 'center' },
    {
      field: 'images',
      headerName: 'IMAGEN',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const imageUrl = params.row?.images?.[0]?.url || params.row?.imageUrl || '/placeholder-product.png';
        return (
          <Box
            component="img"
            src={imageUrl}
            alt="product"
            sx={{ width: 45, height: 45, borderRadius: '8px', objectFit: 'cover', border: `1px solid ${theme.palette.divider}`, display: 'block', margin: '0 auto' }}
          />
        );
      },
    },
    {
      field: 'title',
      headerName: 'PRODUCTO',
      flex: 1,
      minWidth: 160,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: listTextColor, textAlign: 'center', width: '100%' }}>
          {params.value || params.row?.name || 'Sin nombre'}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: 'PRECIO',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: listTextColor, textAlign: 'center', width: '100%' }}>
          ${params.value?.toLocaleString('es-CO')}
        </Typography>
      ),
    },
    {
      field: 'stock',
      headerName: 'STOCK',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const stockValue = Number(params.value) as number | null | undefined;
        const isMissing = stockValue === null || stockValue === undefined || stockValue <= 0;
        const isLow = !isMissing && stockValue <= 10;
        const label = isMissing ? 'Sin stock' : String(stockValue);
        const bg = isMissing
          ? alpha(theme.palette.text.primary, isDark ? 0.14 : 0.06)
          : isLow
          ? alpha(theme.palette.error.main, isDark ? 0.22 : 0.12)
          : accentSoft;
        const color = isMissing
          ? theme.palette.text.secondary
          : isLow
          ? theme.palette.error.main
          : theme.palette.primary.main;

        return (
          <Chip
            label={label}
            size="small"
            sx={{
              fontWeight: 700,
              backgroundColor: bg,
              color: isDark ? theme.palette.common.white : color,
            }}
          />
        );
      },
    },
    {
      field: 'tags',
      headerName: 'CATEGORÍA',
      flex: 1,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => {
        const rawTags = row?.tags ?? row?.tag ?? row?.categories ?? row?.category;

        if (Array.isArray(rawTags)) {
          const names = rawTags
            .map((tag) => (typeof tag === 'string' ? tag : tag?.name ?? tag?.title ?? tag?.label))
            .filter(Boolean);
          return names.length > 0 ? names.join(', ') : 'Sin Categoría';
        }

        if (rawTags && typeof rawTags === 'object') {
          return rawTags?.name ?? rawTags?.title ?? rawTags?.label ?? 'Sin Categoría';
        }

        if (typeof rawTags === 'string') {
          return rawTags;
        }

        return 'Sin Categoría';
      },
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" sx={{ borderRadius: '8px', borderColor: alpha(theme.palette.primary.main, 0.3), color: isDark ? theme.palette.common.white : accentText, fontWeight: 600 }} />
      )
    },
    {
      field: 'status',
      headerName: 'ESTADO',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const status = params.value as string | undefined;
        const label = status === 'published' ? 'Publicado' : status === 'draft' ? 'Borrador' : (status ? String(status) : 'Desconocido');
        const isPublished = status === 'published';
        const bg = isPublished
          ? alpha(theme.palette.success.main, isDark ? 0.22 : 0.12)
          : alpha(theme.palette.text.primary, isDark ? 0.14 : 0.06);
        const color = isDark ? theme.palette.common.white : isPublished ? theme.palette.success.main : theme.palette.text.secondary;

        return (
          <Chip
            label={label}
            size="small"
            sx={{
              backgroundColor: bg,
              color,
              fontWeight: 700,
              borderRadius: '12px',
            }}
          />
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'ACCIONES',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />}
          label="Ver"
          onClick={handleViewClick(row.id)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />}
          label="Eliminar"
          onClick={handleDeleteClick(row)}
        />,
      ],
    },
  ], [navigate, dialogs, notifications, theme.palette, accentText, accentSoft, isDark, listTextColor]);

  return (
    <PageContainer title="Gestión de Inventario" breadcrumbs={[{ title: 'Productos' }]}>
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
          overflow: 'hidden'
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
             <Box sx={{ p: 1.5, borderRadius: 3, backgroundColor: accentSoft, color: theme.palette.primary.main }}>
                <Inventory2Icon />
             </Box>
             <Box>
               <Typography variant="h6" sx={{ fontWeight: 800, color: accentText, lineHeight: 1.2 }}>
                   Catálogo de Productos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                   Administra el stock y precios de Kiogloss
                </Typography>
             </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Refrescar">
              <IconButton onClick={loadData} sx={{ color: theme.palette.primary.main, backgroundColor: accentSoft, borderRadius: '12px' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleCreateClick}
              sx={{ backgroundColor: theme.palette.primary.main, borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&:hover': { backgroundColor: theme.palette.primary.dark } }}
            >
              Nuevo Producto
            </Button>
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
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          },
          '& .MuiDataGrid-columnHeader': { backgroundColor: `${theme.palette.primary.dark} !important` },
          '& .MuiDataGrid-columnHeaderTitle': { color: `${theme.palette.getContrastText(theme.palette.primary.dark)} !important`, fontWeight: 800 },
          '& .MuiDataGrid-cell': { borderBottom: 'none', display: 'flex', alignItems: 'center', borderRight: `1px solid ${theme.palette.divider}` },
          '& .MuiDataGrid-footerContainer': { backgroundColor: isDark ? '#121018' : theme.palette.background.paper, borderTop: 'none', borderRadius: '0 0 16px 16px', overflow: 'hidden' },
          '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
          '& .MuiDataGrid-scrollbar--horizontal': { display: 'none' },
          '& .MuiTablePagination-root, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': { color: listTextColor, fontWeight: 600 },
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : theme.palette.background.paper,
          '& .MuiTablePagination-selectIcon': { color: listTextColor },
          '& .MuiTablePagination-actions .MuiIconButton-root': {
            color: isDark ? '#ffffff !important' : theme.palette.text.primary, '& .MuiSvgIcon-root': { color: isDark ? '#ffffff !important' : 'inherit' },
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            marginLeft: '4px',
            '&:hover': { backgroundColor: theme.palette.action.hover },
          },
          '& .MuiTablePagination-actions .MuiIconButton-root.Mui-disabled': { color: theme.palette.text.disabled, borderColor: theme.palette.divider },
        }}>
          {error ? (
            <Alert severity="error">{(error as any).message || 'Error al cargar productos'}</Alert>
          ) : (
            <DataGrid
              rows={products || []}
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
              disableColumnMenu
              disableColumnSorting
              disableColumnFilter
              disableColumnSelector
              disableRowSelectionOnClick
              rowHeight={75}
              rowSelection={false}
            />
          )}
        </Box>
      </Paper>
    </PageContainer>
  );
}