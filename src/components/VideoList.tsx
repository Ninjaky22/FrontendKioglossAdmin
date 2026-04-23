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
  gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router';
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

export default function VideoList() {
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
      { field: 'id', headerName: 'ID', width: 80 },
      {
        field: 'thumbnailUrl',
        headerName: 'Miniatura',
        width: 100,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {params.value ? (
              <Box
                component="img"
                src={params.value}
                alt="thumb"
                sx={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 1 }}
              />
            ) : (
              <PlayArrowIcon color="disabled" />
            )}
          </Box>
        ),
      },
      { field: 'username', headerName: 'Usuario', width: 150 },
      { field: 'productTitle', headerName: 'Producto', width: 200 },
      {
        field: 'productPrice',
        headerName: 'Precio',
        width: 120,
        valueFormatter: (value) => value ? `$${value}` : '-',
      },
      {
        field: 'videoUrl',
        headerName: 'Video',
        width: 120,
        renderCell: (params) => {
          if (!params.value) return <Chip label="Sin video" size="small" color="default" />;
          let platform = 'Enlace';
          if (params.value.includes('youtube') || params.value.includes('youtu.be')) platform = 'YouTube';
          else if (params.value.includes('tiktok')) platform = 'TikTok';
          else if (params.value.includes('instagram')) platform = 'Instagram';
          else if (params.value.includes('facebook')) platform = 'Facebook';
          else if (/\.(mp4|webm|ogg|mov)/i.test(params.value)) platform = 'MP4';
          return <Chip label={platform} size="small" color="primary" variant="outlined" />;
        },
      },
      {
        field: 'createdAt',
        headerName: 'Creado',
        width: 180,
        valueFormatter: (value) => value ? new Date(value).toLocaleDateString('es') : '-',
      },
      {
        field: 'actions',
        type: 'actions',
        flex: 1,
        align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Editar"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Eliminar"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete],
  );

  return (
    <PageContainer
      title="Videos"
      breadcrumbs={[{ title: 'Videos' }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Recargar datos">
            <div>
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button variant="contained" onClick={handleCreateClick} startIcon={<AddIcon />}>
            Crear
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : (
          <DataGrid
            rows={videos || []}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            sx={{
              [`& .${gridClasses.row}:hover`]: { cursor: 'pointer' },
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'circular-progress',
                noRowsVariant: 'circular-progress',
              },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}
