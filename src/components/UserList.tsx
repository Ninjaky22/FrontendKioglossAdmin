import * as React from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { Alert, Box, IconButton, Stack, Tooltip, Chip, Avatar, Paper, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { AccionesUser } from '../store/actions/user';
import {
  listaUsersSelector,
  obtenerUsersEnProgresoSelector,
  errorObtenerUsersSelector,
  totalElementosUsersSelector,
} from '../store/selectors/user';
import PageContainer from './PageContainer';
import type { UserDashboardDTO } from '../models/User';

type PaginationDisplayedRowsParams = {
  from: number;
  to: number;
  count: number;
  estimated: number | undefined;
};

const INITIAL_PAGE_SIZE = 10;

export default function UserList() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const users = useSelector(listaUsersSelector);
  const isLoading = useSelector(obtenerUsersEnProgresoSelector);
  const error = useSelector(errorObtenerUsersSelector);
  const totalElements = useSelector(totalElementosUsersSelector) as number; // Corrección de tipo

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : INITIAL_PAGE_SIZE,
  });

  const loadData = React.useCallback(() => {
    dispatch(AccionesUser.obtenerUsers(paginationModel.page, paginationModel.pageSize));
  }, [dispatch, paginationModel]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    searchParams.set('page', String(model.page));
    searchParams.set('pageSize', String(model.pageSize));
    navigate(`${pathname}?${searchParams.toString()}`);
  };

  const handleViewUser = React.useCallback(
    (user: UserDashboardDTO) => () => navigate(`/users/${user.id}`),
    [navigate],
  );

  const columns = React.useMemo<GridColDef<UserDashboardDTO>[]>(() => [
      { field: 'id', headerName: 'ID', width: 70, align: 'center', headerAlign: 'center' },
      { 
        field: 'profileImage', 
        headerName: 'AVATAR', 
        width: 80,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Avatar src={params.value} alt={params.row.name} sx={{ width: 40, height: 40 }} />
        )
      },
      { 
        field: 'name', 
        headerName: 'NOMBRE', 
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', textAlign: 'center', width: '100%' }}>
            {params.value}
          </Typography>
        )
      },
      { 
        field: 'email', 
        headerName: 'EMAIL', 
        flex: 1.2,
        minWidth: 200,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', width: '100%' }}>
            {params.value}
          </Typography>
        )
      },
      { 
        field: 'totalOrders', 
        headerName: 'PEDIDOS', 
        type: 'number', 
        width: 110,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#610361', textAlign: 'center', width: '100%' }}>
            {params.value}
          </Typography>
        )
      },
      {
        field: 'isActive', 
        headerName: 'ESTADO', 
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip 
            label={params.value ? 'Activo' : 'Inactivo'} 
            size="small" 
            sx={{
              backgroundColor: params.value ? '#e8f5e9' : '#ffebee',
              color: params.value ? '#2e7d32' : '#c62828',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '12px',
              border: `1px solid ${params.value ? '#2e7d3233' : '#c6282833'}`,
            }}
          />
        ),
      },
      {
        field: 'role', 
        headerName: 'ROL', 
        width: 120,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_, row) => row.isSuperuser ? 'Admin' : row.isStaff ? 'Staff' : 'Cliente',
        renderCell: (params) => {
            let bg, color;
            if (params.value === 'Admin') {
              bg = '#fdf4ff'; color = '#9b30a0';
            } else if (params.value === 'Staff') {
              bg = '#e3f2fd'; color = '#1976d2';
            } else {
              bg = '#f5f5f5'; color = '#616161';
            }
            return (
              <Chip 
                label={params.value} 
                size="small" 
                sx={{
                  backgroundColor: bg,
                  color: color,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '12px',
                  border: `1px solid ${color}33`,
                }}
              />
            )
        }
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
            label="Ver" 
            onClick={handleViewUser(row)} 
          />,
        ],
      },
    ], [handleViewUser]);

  return (
    <PageContainer title="Gestión de Usuarios" breadcrumbs={[{ title: 'Usuarios' }]}>
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
                <PeopleIcon />
             </Box>
             <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#610361', lineHeight: 1.2 }}>
                   Listado de Usuarios
                </Typography>
                <Typography variant="caption" color="text.secondary">
                   Administra y gestiona los usuarios de la plataforma
                </Typography>
             </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Refrescar Lista">
              <IconButton 
                onClick={loadData} 
                sx={{ 
                  color: '#fdf4ff', 
                  backgroundColor: '#9b30a0',
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: '#fce4ff', color: '#9b30a0' }
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
          '& .MuiDataGrid-columnHeader': { backgroundColor: '#610361 !important' },
          '& .MuiDataGrid-columnHeaderTitle': { color: '#ffffff !important', fontWeight: 800 },
          '& .MuiDataGrid-columnSeparator': { display: 'block', color: '#ffffff' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
          '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover, & .MuiDataGrid-cell.Mui-selected, & .MuiDataGrid-cell.Mui-selected:focus': { backgroundColor: 'transparent' },
          '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': { borderRight: '1px solid #ffffff' },
          '& .MuiDataGrid-columnHeader:last-of-type, & .MuiDataGrid-cell:last-of-type': { borderRight: 'none' },
          '& .MuiDataGrid-cell': { borderBottom: 'none', display: 'flex', alignItems: 'center' },
          '& .MuiDataGrid-footerContainer': { backgroundColor: '#fdf4ff', borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '4px 12px' },
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
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {(error as any).message || 'Error al conectar con el servidor'}
            </Alert>
          ) : (
            <DataGrid<UserDashboardDTO>
              rows={users || []}
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