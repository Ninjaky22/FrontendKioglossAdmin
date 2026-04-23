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
import { AccionesSize, type Size } from '../../store/actions/size';
import {
  listaSizesSelector,
  obtenerSizesEnProgresoSelector,
  errorObtenerSizesSelector,
  crearSizeEnProgresoSelector,
  actualizarSizeEnProgresoSelector,
} from '../../store/selectors/size';
import PageContainer from './../PageContainer';

export default function SizeList() {
  const dispatch = useDispatch<any>();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const sizes = useSelector(listaSizesSelector);
  const isLoading = useSelector(obtenerSizesEnProgresoSelector);
  const error = useSelector(errorObtenerSizesSelector);
  const isCreating = useSelector(crearSizeEnProgresoSelector);
  const isUpdating = useSelector(actualizarSizeEnProgresoSelector);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingSize, setEditingSize] = React.useState<Size | null>(null);
  const [formData, setFormData] = React.useState({ name: '' });

  const loadData = React.useCallback(() => {
    dispatch(AccionesSize.obtenerSizes());
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
    setEditingSize(null);
    setFormData({ name: '' });
    setOpenDialog(true);
  }, []);

  const handleOpenEdit = React.useCallback((size: Size) => () => {
    setEditingSize(size);
    setFormData({ name: size.name });
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setOpenDialog(false);
    setEditingSize(null);
    setFormData({ name: '' });
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notifications.show('El nombre es requerido', { severity: 'error' });
      return;
    }

    try {
      if (editingSize) {
        await dispatch(AccionesSize.actualizarSize({
          ...editingSize,
          name: formData.name,
        }));
        notifications.show('Talla actualizada exitosamente', { severity: 'success' });
      } else {
        await dispatch(AccionesSize.crearSize({
          name: formData.name,
        }));
        notifications.show('Talla creada exitosamente', { severity: 'success' });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      notifications.show(
        extractErrorMessage(error),
        { severity: 'error' }
      );
    }
  }, [formData, editingSize, dispatch, notifications, handleCloseDialog, loadData]);

  const handleDelete = React.useCallback((size: Size) => async () => {
    const confirmed = await dialogs.confirm(
      `¿Deseas eliminar la talla "${size.name}"?`,
      {
        title: '¿Eliminar talla?',
        severity: 'error',
        okText: 'Eliminar',
        cancelText: 'Cancelar',
      }
    );

    if (confirmed) {
      try {
        await dispatch(AccionesSize.borrarSize(size.id));
        notifications.show('Talla eliminada exitosamente', { severity: 'success' });
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
      title="Tallas"
      breadcrumbs={[{ title: 'Tallas' }]}
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
            Nueva Talla
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : (
          <DataGrid
            rows={sizes || []}
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
            {editingSize ? 'Editar Talla' : 'Nueva Talla'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                required
                fullWidth
                autoFocus
                placeholder="Ej: XL, M, S"
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
              {editingSize ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
}