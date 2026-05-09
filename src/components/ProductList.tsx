import * as React from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { Alert, Box, IconButton, Stack, Tooltip, Chip, Paper, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Inventory2Icon from '@mui/icons-material/Inventory2';
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
  const handleEditClick = (id: string) => () => navigate(`/products/${id}/edit`);

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
            sx={{ width: 45, height: 45, borderRadius: '8px', objectFit: 'cover', border: '1px solid #f0d6fb', display: 'block', margin: '0 auto' }}
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
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', textAlign: 'center', width: '100%' }}>
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
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#610361', textAlign: 'center', width: '100%' }}>
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
        const stockValue = params.value as number | null | undefined;
        const isMissing = stockValue === null || stockValue === undefined;
        const isLow = !isMissing && stockValue <= 10;
        const label = isMissing ? 'Sin stock' : String(stockValue);
        const bg = isMissing ? '#f5f5f5' : isLow ? '#ffebee' : '#fdf4ff';
        const color = isMissing ? '#9e9e9e' : isLow ? '#c62828' : '#9b30a0';

        return (
          <Chip
            label={label}
            size="small"
            sx={{
              fontWeight: 700,
              backgroundColor: bg,
              color,
            }}
          />
        );
      },
    },
    {
      field: 'tag',
      headerName: 'CATEGORÍA',
      flex: 1,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_, row) => row.tag?.name || 'Sin Categoría',
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" sx={{ borderRadius: '8px', borderColor: '#9b30a033', color: '#610361', fontWeight: 600 }} />
      )
    },
    {
      field: 'status',
      headerName: 'ESTADO',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Disponible' : 'Agotado'} 
          size="small" 
          sx={{
            backgroundColor: params.value ? '#e8f5e9' : '#f5f5f5',
            color: params.value ? '#2e7d32' : '#9e9e9e',
            fontWeight: 700,
            borderRadius: '12px',
          }}
        />
      ),
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
          key="edit"
          icon={<EditIcon fontSize="small" sx={{ color: '#9b30a0' }} />}
          label="Editar"
          onClick={handleEditClick(row.id)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />}
          label="Eliminar"
          onClick={handleDeleteClick(row)}
        />,
      ],
    },
  ], [navigate, dialogs, notifications]);

  return (
    <PageContainer title="Gestión de Inventario" breadcrumbs={[{ title: 'Productos' }]}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: '24px', 
          border: '1px solid #f0d6fb',
          boxShadow: '0 10px 40px -10px rgba(155, 48, 160, 0.05)',
          backgroundColor: '#ffffff',
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
             <Box sx={{ p: 1.5, borderRadius: 3, backgroundColor: '#fdf4ff', color: '#9b30a0' }}>
                <Inventory2Icon />
             </Box>
             <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#610361', lineHeight: 1.2 }}>
                   Catálogo de Productos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                   Administra el stock y precios de Kiogloss
                </Typography>
             </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Refrescar">
              <IconButton onClick={loadData} sx={{ color: '#9b30a0', backgroundColor: '#fdf4ff', borderRadius: '12px' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleCreateClick}
              sx={{ backgroundColor: '#9b30a0', borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&:hover': { backgroundColor: '#610361' } }}
            >
              Nuevo Producto
            </Button>
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
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          },
          '& .MuiDataGrid-columnHeader': { backgroundColor: '#610361 !important' },
          '& .MuiDataGrid-columnHeaderTitle': { color: '#ffffff !important', fontWeight: 800 },
          '& .MuiDataGrid-cell': { borderBottom: 'none', display: 'flex', alignItems: 'center', borderRight: '1px solid #f0d6fb33' },
          '& .MuiDataGrid-footerContainer': { backgroundColor: '#fdf4ff', borderTop: 'none', borderRadius: '0 0 16px 16px' },
          '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
          '& .MuiDataGrid-scrollbar--horizontal': { display: 'none' },
          '& .MuiTablePagination-root, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': { color: '#610361', fontWeight: 600 },
          '& .MuiTablePagination-select': { backgroundColor: '#ffffff', borderRadius: '10px', padding: '4px 28px 4px 10px' },
          '& .MuiTablePagination-actions .MuiIconButton-root': {
            color: '#610361',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #f0d6fb',
            marginLeft: '4px',
            '&:hover': { backgroundColor: '#fce4ff' },
          },
          '& .MuiTablePagination-actions .MuiIconButton-root.Mui-disabled': { color: '#b58bb9', borderColor: '#f7e7fb' },
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