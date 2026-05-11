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
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
          <Typography variant="body2" sx={{ fontWeight: 600, color: listTextColor, textAlign: 'center', width: '100%' }}>
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
          <Typography variant="body2" sx={{ color: listTextColor, textAlign: 'center', width: '100%', opacity: 0.85 }}>
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
          <Typography variant="body2" sx={{ fontWeight: 700, color: listTextColor, textAlign: 'center', width: '100%' }}>
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
              backgroundColor: params.value
                ? alpha(theme.palette.success.main, isDark ? 0.22 : 0.12)
                : alpha(theme.palette.error.main, isDark ? 0.22 : 0.12),
              color: isDark ? theme.palette.common.white : params.value ? theme.palette.success.main : theme.palette.error.main,
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '12px',
              border: `1px solid ${alpha(isDark ? theme.palette.common.white : params.value ? theme.palette.success.main : theme.palette.error.main, 0.35)}`,
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
              color = theme.palette.primary.main;
              bg = alpha(theme.palette.primary.main, isDark ? 0.22 : 0.12);
            } else if (params.value === 'Staff') {
              color = theme.palette.info.main;
              bg = alpha(theme.palette.info.main, isDark ? 0.22 : 0.12);
            } else {
              color = theme.palette.text.secondary;
              bg = alpha(theme.palette.text.primary, isDark ? 0.14 : 0.06);
            }
            return (
              <Chip 
                label={params.value} 
                size="small" 
                sx={{
                  backgroundColor: bg,
                  color: isDark ? theme.palette.common.white : color,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '12px',
                  border: `1px solid ${alpha(isDark ? theme.palette.common.white : color, 0.3)}`,
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
            label="Ver" 
            onClick={handleViewUser(row)} 
          />,
        ],
      },
    ], [handleViewUser, theme.palette, accentText, isDark, listTextColor]);

  return (
    <PageContainer title="Gestión de Usuarios" breadcrumbs={[{ title: 'Usuarios' }]}>
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
                <PeopleIcon />
             </Box>
             <Box>
               <Typography variant="h6" sx={{ fontWeight: 800, color: accentText, lineHeight: 1.2 }}>
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
                  color: theme.palette.getContrastText(theme.palette.primary.main), 
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: theme.palette.primary.dark, color: theme.palette.getContrastText(theme.palette.primary.dark) }
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
          '& .MuiDataGrid-columnHeader': { backgroundColor: `${theme.palette.primary.dark} !important` },
          '& .MuiDataGrid-columnHeaderTitle': { color: `${theme.palette.getContrastText(theme.palette.primary.dark)} !important`, fontWeight: 800 },
          '& .MuiDataGrid-columnSeparator': { display: 'block', color: theme.palette.getContrastText(theme.palette.primary.dark) },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
          '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover, & .MuiDataGrid-cell.Mui-selected, & .MuiDataGrid-cell.Mui-selected:focus': { backgroundColor: 'transparent' },
          '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': { borderRight: `1px solid ${theme.palette.divider}` },
          '& .MuiDataGrid-columnHeader:last-of-type, & .MuiDataGrid-cell:last-of-type': { borderRight: 'none' },
          '& .MuiDataGrid-cell': { borderBottom: 'none', display: 'flex', alignItems: 'center' },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: isDark ? '#121018' : theme.palette.background.paper,
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            padding: '4px 12px',
            overflow: 'hidden',
          },
          '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
          '& .MuiDataGrid-scrollbar--horizontal': { display: 'none' },
          '& .MuiTablePagination-root, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': { color: listTextColor, fontWeight: 600 },
          '& .MuiTablePagination-select': { backgroundColor: theme.palette.background.paper, borderRadius: '10px', padding: '4px 28px 4px 10px', color: listTextColor },
          '& .MuiTablePagination-selectIcon': { color: listTextColor },
          '& .MuiTablePagination-actions .MuiIconButton-root': {
            color: listTextColor,
            backgroundColor: theme.palette.background.paper,
            borderRadius: '10px',
            border: `1px solid ${theme.palette.divider}`,
            marginLeft: '4px',
            '&:hover': { backgroundColor: theme.palette.action.hover },
          },
          '& .MuiTablePagination-actions .MuiIconButton-root.Mui-disabled': { color: theme.palette.text.disabled, borderColor: theme.palette.divider },
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