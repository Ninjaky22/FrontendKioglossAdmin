import * as React from 'react';
import { extractErrorMessage } from '../utils/errorUtils';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import { useNavigate } from 'react-router';
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { AccionesVideo } from '../store/actions/video';
import {
  listaVideosSelector,
  obtenerVideosEnProgresoSelector,
  errorObtenerVideosSelector,
} from '../store/selectors/video';
import PageContainer from './PageContainer';
import type { VideoReel } from '../models/VideoReel';

type PaginationDisplayedRowsParams = {
  from: number;
  to: number;
  count: number;
  estimated: number | undefined;
};

export default function VideoList() {
  const theme = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { mode } = useColorScheme();
  const paletteMode = !mode || mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;
  const isDark = paletteMode === 'dark';
  const accentText = isDark ? theme.palette.common.white : theme.palette.primary.dark;
  const accentSoft = alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08);
  const listTextColor = isDark ? theme.palette.common.white : theme.palette.text.primary;

  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const videos = useSelector(listaVideosSelector);
  const isLoading = useSelector(obtenerVideosEnProgresoSelector);
  const error = useSelector(errorObtenerVideosSelector);

  const loadData = React.useCallback(() => {
    dispatch(AccionesVideo.obtenerVideos());
  }, [dispatch]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) loadData();
  }, [isLoading, loadData]);

  const handleCreateClick = React.useCallback(() => {
    navigate('/videos/new');
  }, [navigate]);

  const handleRowEdit = React.useCallback(
    (video: VideoReel) => () => {
      navigate(`/videos/${video.id}/edit`);
    },
    [navigate],
  );

  const handleRowDelete = React.useCallback(
    (video: VideoReel) => async () => {
      const confirmed = await dialogs.confirm(
        `¿Deseas eliminar el video de "${video.username}"?`,
        {
          title: '¿Eliminar video?',
          severity: 'error',
          okText: 'Eliminar',
          cancelText: 'Cancelar',
        },
      );
      if (confirmed) {
        try {
          await dispatch(AccionesVideo.borrarVideo(video.id));
          notifications.show('Video eliminado exitosamente.', {
            severity: 'success',
            autoHideDuration: 3000,
          });
          loadData();
        } catch (deleteError) {
          notifications.show(
            extractErrorMessage(deleteError),
            { severity: 'error', autoHideDuration: 3000 },
          );
        }
      }
    },
    [dialogs, notifications, loadData, dispatch],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 70, align: 'center', headerAlign: 'center' },
      {
        field: 'thumbnailUrl',
        headerName: 'MINIATURA',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            {params.value ? (
              <Box
                component="img"
                src={params.value}
                alt="thumb"
                sx={{ width: 40, height: 56, objectFit: 'cover', borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }}
              />
            ) : (
              <PlayArrowIcon color="disabled" />
            )}
          </Box>
        ),
      },
      {
        field: 'username',
        headerName: 'USUARIO',
        flex: 1,
        minWidth: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: listTextColor, textAlign: 'center', width: '100%' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'productTitle',
        headerName: 'PRODUCTO',
        flex: 2,
        minWidth: 180,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: listTextColor, textAlign: 'center', width: '100%', opacity: 0.85 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'productPrice',
        headerName: 'PRECIO',
        width: 110,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: listTextColor, textAlign: 'center', width: '100%' }}>
            {params.value ? `$${params.value.toLocaleString('es-CO')}` : '-'}
          </Typography>
        ),
      },
      {
        field: 'videoUrl',
        headerName: 'PLATAFORMA',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          if (!params.value) return <Chip label="Sin video" size="small" sx={{ backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.14 : 0.06), color: listTextColor, fontWeight: 600 }} />;
          let platform = 'Enlace';
          let color = '#1976d2';
          
          if (params.value.includes('youtube') || params.value.includes('youtu.be')) {
            platform = 'YouTube'; color = '#c62828';
          } else if (params.value.includes('tiktok')) {
            platform = 'TikTok'; color = '#212121';
          } else if (params.value.includes('instagram')) {
            platform = 'Instagram'; color = '#c2185b';
          } else if (params.value.includes('facebook')) {
            platform = 'Facebook'; color = '#3f51b5';
          } else if (/\.(mp4|webm|ogg|mov)/i.test(params.value)) {
            platform = 'MP4'; color = theme.palette.primary.main;
          }

          const bg = alpha(color, isDark ? 0.22 : 0.12);

          return (
            <Chip 
              label={platform} 
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
          );
        },
      },
      {
        field: 'createdAt',
        headerName: 'FECHA CREACIÓN',
        width: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: listTextColor, fontSize: '0.85rem', textAlign: 'center', width: '100%', opacity: 0.85 }}>
            {params.value ? new Date(params.value).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
          </Typography>
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'ACCIONES',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />}
            label="Editar"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />}
            label="Eliminar"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete, theme.palette, accentText, isDark, accentSoft, listTextColor],
  );

  return (
    <PageContainer title="Gestión de Videos" breadcrumbs={[{ title: 'Videos' }]}>
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
                <OndemandVideoIcon />
             </Box>
             <Box>
               <Typography variant="h6" sx={{ fontWeight: 800, color: accentText, lineHeight: 1.2 }}>
                   Listado de Videos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                   Administra los reels y videos asociados a productos
                </Typography>
             </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Refrescar Lista">
              <IconButton 
                onClick={handleRefresh} 
                sx={{ 
                  color: theme.palette.primary.main, 
                  backgroundColor: accentSoft,
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.primary.main }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              onClick={handleCreateClick} 
              startIcon={<AddIcon />}
              sx={{ 
                backgroundColor: theme.palette.primary.main, 
                borderRadius: '12px', 
                textTransform: 'none', 
                fontWeight: 700, 
                '&:hover': { backgroundColor: theme.palette.primary.dark } 
              }}
            >
              Nuevo Video
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
          '& .MuiDataGrid-footerContainer': { backgroundColor: isDark ? '#121018' : theme.palette.background.paper, borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '4px 12px', overflow: 'hidden' },
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
            <DataGrid
              rows={videos || []}
              columns={columns}
              loading={isLoading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
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