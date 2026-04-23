import * as React from 'react';
import { extractErrorMessage } from '../utils/errorUtils';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
  type GridEventListener,
  gridClasses,
  type GridFilterModel,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
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
import {type Product} from '../models/Product';

const INITIAL_PAGE_SIZE = 10;

export default function ProductList() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  // Selectores de Redux
  const products = useSelector(listaProductosSelector);
  const isLoading = useSelector(obtenerProductosEnProgresoSelector);
  const error = useSelector(errorObtenerProductosSelector);
  const totalElements = useSelector(totalElementosProductosSelector);

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : INITIAL_PAGE_SIZE,
  });

  const [filterModel, setFilterModel] = React.useState<GridFilterModel>(
      searchParams.get('filter')
        ? JSON.parse(searchParams.get('filter') ?? '')
        : { items: [] },
    );

  const searchTerm = React.useMemo(() => {
    return filterModel.quickFilterValues?.join(' ') || '';
  }, [filterModel]);

  const loadData = React.useCallback(() => {
    dispatch(AccionesProduct.obtenerProductos(paginationModel.page, paginationModel.pageSize, searchTerm));
  }, [dispatch, paginationModel.page, paginationModel.pageSize, searchTerm]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);

      searchParams.set('page', String(model.page));
      searchParams.set('pageSize', String(model.pageSize));

      const newSearchParamsString = searchParams.toString();
      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleFilterModelChange = React.useCallback(
    (model: GridFilterModel) => {
      setFilterModel(model);

      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set('search', (model.quickFilterValues ?? []).join(", "));
      } else {
        searchParams.delete('search');
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    ({ row }) => {
      navigate(`/products/${row.id}`);
    },
    [navigate],
  );

  const handleCreateClick = React.useCallback(() => {
    navigate('/products/new');
  }, [navigate]);

  const handleRowEdit = React.useCallback(
    (product: Product) => () => {
      navigate(`/products/${product.id}/edit`);
    },
    [navigate],
  );

  const handleManageImages = React.useCallback(
    (product: Product) => () => {
      navigate(`/products/${product.id}/images`);
    },
    [navigate],
  );

  const handleRowDelete = React.useCallback(
    (product: Product) => async () => {
      const confirmed = await dialogs.confirm(
        `¿Deseas eliminar "${product.title}"?`,
        {
          title: `¿Eliminar producto?`,
          severity: 'error',
          okText: 'Eliminar',
          cancelText: 'Cancelar',
        },
      );

      if (confirmed) {
        try {
          await dispatch(AccionesProduct.borrarProducto(product.id));

          notifications.show('Producto eliminado exitosamente.', {
            severity: 'success',
            autoHideDuration: 3000,
          });
          loadData();
        } catch (deleteError) {
          notifications.show(
            extractErrorMessage(deleteError),
            {
              severity: 'error',
              autoHideDuration: 3000,
            },
          );
        }
      }
    },
    [dialogs, notifications, loadData, dispatch],
  );

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    [],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'title', headerName: 'Título', width: 200 },
      { 
        field: 'price', 
        headerName: 'Precio', 
        type: 'number',
        width: 120,
        valueFormatter: (value) => `$${value}`,
      },
      { 
        field: 'stock', 
        headerName: 'Stock', 
        type: 'number',
        width: 100,
      },
      {
        field: 'status',
        headerName: 'Estado',
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.value === 'published' ? 'Publicado' : 'Borrador'}
            color={params.value === 'published' ? 'success' : 'warning'}
            size="small"
          />
        ),
      },
      {
        field: 'tags',
        headerName: 'Categorías',
        width: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 0.5, flexWrap: 'wrap' }}>
            {params.value?.slice(0, 2).map((tag: any) => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                variant="outlined"
              />
            ))}
            {params.value?.length > 2 && (
              <Chip label={`+${params.value.length - 2}`} size="small" />
            )}
          </Box>
        ),
      },
      {
        field: 'images',
        headerName: 'Imágenes',
        width: 100,
        align: 'center',
        renderCell: (params) => (
          <Chip
            icon={<ImageIcon />}
            label={params.value?.length || 0}
            size="small"
            color={params.value?.length > 0 ? 'primary' : 'default'}
          />
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        flex: 1,
        align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit-item"
            icon={<EditIcon />}
            label="Editar"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="images-item"
            icon={<ImageIcon />}
            label="Imágenes"
            onClick={handleManageImages(row)}
          />,
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label="Eliminar"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleManageImages, handleRowDelete],
  );

  const pageTitle = 'Productos';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Recargar datos" placement="right" enterDelay={1000}>
            <div>
              <IconButton size="small" aria-label="refresh" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button
            variant="contained"
            onClick={handleCreateClick}
            startIcon={<AddIcon />}
          >
            Crear
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{error.message}</Alert>
          </Box>
        ) : (
          <DataGrid
            rows={products || []}
            rowCount={totalElements || 0}
            columns={columns}
            pagination
            sortingMode="client"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={isLoading}
            initialState={initialState}
            showToolbar
            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25, 50]}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                {
                  outline: 'none',
                },
              [`& .${gridClasses.row}:hover`]: {
                cursor: 'pointer',
              },
            }}
            slotProps={{
              toolbar: {
                quickFilterProps: { debounceMs: 500 },
              },
              loadingOverlay: {
                variant: 'circular-progress',
                noRowsVariant: 'circular-progress',
              },
              baseIconButton: {
                size: 'small',
              },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}