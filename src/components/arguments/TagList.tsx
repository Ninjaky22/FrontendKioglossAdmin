import * as React from 'react';
import { extractErrorMessage } from '../../utils/errorUtils';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
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
import { useDispatch, useSelector } from 'react-redux';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { AccionesTag, type Tag } from '../../store/actions/tag';
import {
  listaTagsSelector,
  obtenerTagsEnProgresoSelector,
  errorObtenerTagsSelector,
  crearTagEnProgresoSelector,
  actualizarTagEnProgresoSelector,
} from '../../store/selectors/tag';
import PageContainer from './../PageContainer';

export default function TagList() {
  const dispatch = useDispatch<any>();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const tags = useSelector(listaTagsSelector);
  const isLoading = useSelector(obtenerTagsEnProgresoSelector);
  const error = useSelector(errorObtenerTagsSelector);
  const isCreating = useSelector(crearTagEnProgresoSelector);
  const isUpdating = useSelector(actualizarTagEnProgresoSelector);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null);
  const [formData, setFormData] = React.useState({ name: '', imageURL: '' });

  const loadData = React.useCallback(() => {
    dispatch(AccionesTag.obtenerTags());
  }, [dispatch]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  const handleOpenCreate = React.useCallback(() => {
    setEditingTag(null);
    setFormData({ name: '', imageURL: '' });
    setOpenDialog(true);
  }, []);

  const handleOpenEdit = React.useCallback((tag: Tag) => () => {
    setEditingTag(tag);
    setFormData({ name: tag.name, imageURL: tag.imageURL || '' });
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setOpenDialog(false);
    setEditingTag(null);
    setFormData({ name: '', imageURL: '' });
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notifications.show('El nombre es requerido', { severity: 'error' });
      return;
    }

    try {
      if (editingTag) {
        await dispatch(AccionesTag.actualizarTag({
          ...editingTag,
          name: formData.name,
          imageURL: formData.imageURL || undefined,
        }));
        notifications.show('Categoría actualizada exitosamente', { severity: 'success' });
      } else {
        await dispatch(AccionesTag.crearTag({
          name: formData.name,
          imageURL: formData.imageURL || undefined,
        }));
        notifications.show('Categoría creada exitosamente', { severity: 'success' });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      notifications.show(
        extractErrorMessage(error),
        { severity: 'error' }
      );
    }
  }, [formData, editingTag, dispatch, notifications, handleCloseDialog, loadData]);

  const handleDelete = React.useCallback((tag: Tag) => async () => {
    const confirmed = await dialogs.confirm(
      `¿Deseas eliminar la categoría "${tag.name}"?`,
      {
        title: '¿Eliminar categoría?',
        severity: 'error',
        okText: 'Eliminar',
        cancelText: 'Cancelar',
      }
    );

    if (confirmed) {
      try {
        await dispatch(AccionesTag.borrarTag(tag.id));
        notifications.show('Categoría eliminada exitosamente', { severity: 'success' });
        loadData();
      } catch (error) {
        notifications.show(
          extractErrorMessage(error),
          { severity: 'error' }
        );
      }
    }
  }, [dialogs, dispatch, notifications, loadData]);

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 200 },
      {
        field: 'imageURL',
        headerName: 'URL Imagen',
        flex: 1,
        minWidth: 300,
        renderCell: (params) => (
          params.value ? (
            <Tooltip title={params.value}>
              <Box
                component="span"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {params.value}
              </Box>
            </Tooltip>
          ) : (
            <Box component="span" sx={{ color: 'text.secondary' }}>
              Sin imagen
            </Box>
          )
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Acciones',
        width: 100,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Editar"
            onClick={handleOpenEdit(row)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Eliminar"
            onClick={handleDelete(row)}
          />,
        ],
      },
    ],
    [handleOpenEdit, handleDelete]
  );

  return (
    <PageContainer
      title="Categorías"
      breadcrumbs={[{ title: 'Categorías' }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Recargar datos">
            <div>
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button
            variant="contained"
            onClick={handleOpenCreate}
            startIcon={<AddIcon />}
          >
            Nueva Categoría
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : (
          <DataGrid
            rows={tags || []}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: {
                outline: 'none',
              },
            }}
          />
        )}
      </Box>

      {/* Dialog para Crear/Editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingTag ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="URL de Imagen (opcional)"
                value={formData.imageURL}
                onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                fullWidth
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating || isUpdating}
              startIcon={
                (isCreating || isUpdating) ? <CircularProgress size={20} /> : null
              }
            >
              {editingTag ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
}