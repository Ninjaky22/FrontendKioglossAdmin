import * as React from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { Alert, Box, IconButton, Stack, Tooltip, Chip, Avatar } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

const INITIAL_PAGE_SIZE = 10;

export default function UserList() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const users = useSelector(listaUsersSelector);
  const isLoading = useSelector(obtenerUsersEnProgresoSelector);
  const error = useSelector(errorObtenerUsersSelector);
  const totalElements = useSelector(totalElementosUsersSelector);

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
      { field: 'id', headerName: 'ID', width: 80 },
      { 
        field: 'profileImage', 
        headerName: 'Avatar', 
        width: 80,
        renderCell: (params) => <Avatar src={params.value} alt={params.row.name} sx={{ width: 32, height: 32, mt: 1 }} />
      },
      { field: 'name', headerName: 'Nombre', width: 200 },
      { field: 'email', headerName: 'Email', width: 250 },
      { field: 'totalOrders', headerName: 'Pedidos', type: 'number', width: 100 },
      {
        field: 'isActive', headerName: 'Estado', width: 120,
        renderCell: (params) => (
          <Chip label={params.value ? 'Activo' : 'Inactivo'} color={params.value ? 'success' : 'error'} size="small" />
        ),
      },
      {
        field: 'role', headerName: 'Rol', width: 150,
        valueGetter: (_, row) => row.isSuperuser ? 'Admin' : row.isStaff ? 'Staff' : 'Cliente',
        renderCell: (params) => (
            <Chip label={params.value} color={params.value === 'Admin' ? 'secondary' : params.value === 'Staff' ? 'primary' : 'default'} size="small" />
        )
      },
      {
        field: 'actions', type: 'actions', flex: 1, align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem key="view" icon={<VisibilityIcon />} label="Ver" onClick={handleViewUser(row)} />,
        ],
      },
    ], [handleViewUser]);

  return (
    <PageContainer title="Usuarios" breadcrumbs={[{ title: 'Usuarios' }]}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Tooltip title="Recargar"><IconButton onClick={loadData}><RefreshIcon /></IconButton></Tooltip>
      </Stack>
      <Box sx={{ flex: 1, width: '100%', height: 600 }}>
        {error ? <Alert severity="error">{(error as any).message}</Alert> : (
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
          />
        )}
      </Box>
    </PageContainer>
  );
}