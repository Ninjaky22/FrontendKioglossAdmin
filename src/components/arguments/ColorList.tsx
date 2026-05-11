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
import { AccionesColor, type Color } from '../../store/actions/color';
import {
  listaColorsSelector,
  obtenerColorsEnProgresoSelector,
  errorObtenerColorsSelector,
  crearColorEnProgresoSelector,
  actualizarColorEnProgresoSelector,
} from '../../store/selectors/color';
import PageContainer from './../PageContainer';

export default function ColorList() {
  const dispatch = useDispatch<any>();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const colors = useSelector(listaColorsSelector);
  const isLoading = useSelector(obtenerColorsEnProgresoSelector);
  const error = useSelector(errorObtenerColorsSelector);
  const isCreating = useSelector(crearColorEnProgresoSelector);
  const isUpdating = useSelector(actualizarColorEnProgresoSelector);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingColor, setEditingColor] = React.useState<Color | null>(null);
  const [formData, setFormData] = React.useState({ name: '', hexCode: '#000000' });

  const loadData = React.useCallback(() => {
    dispatch(AccionesColor.obtenerColors());
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
    setEditingColor(null);
    setFormData({ name: '', hexCode: '#000000' });
    setOpenDialog(true);
  }, []);

  const handleOpenEdit = React.useCallback((color: Color) => () => {
    setEditingColor(color);
    setFormData({ name: color.name, hexCode: color.hexCode || '#000000' });
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setOpenDialog(false);
    setEditingColor(null);
    setFormData({ name: '', hexCode: '#000000' });
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notifications.show('El nombre es requerido', { severity: 'error' });
      return;
    }

    try {
      if (editingColor) {
        await dispatch(AccionesColor.actualizarColor({
          ...editingColor,
          name: formData.name,
          hexCode: formData.hexCode,
        }));
        notifications.show('Color actualizado exitosamente', { severity: 'success' });
      } else {
        await dispatch(AccionesColor.crearColor({
          name: formData.name,
          hexCode: formData.hexCode,
        }));
        notifications.show('Color creado exitosamente', { severity: 'success' });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      notifications.show(
        extractErrorMessage(error),
        { severity: 'error' }
      );
    }
  }, [formData, editingColor, dispatch, notifications, handleCloseDialog, loadData]);

  const handleDelete = React.useCallback((color: Color) => async () => {
    const confirmed = await dialogs.confirm(
      `¿Deseas eliminar el color "${color.name}"?`,
      {
        title: '¿Eliminar color?',
        severity: 'error',
        okText: 'Eliminar',
        cancelText: 'Cancelar',
      }
    );

    if (confirmed) {
      try {
        await dispatch(AccionesColor.borrarColor(color.id));
        notifications.show('Color eliminado exitosamente', { severity: 'success' });
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
      {
        field: 'hexCode',
        headerName: 'Color',
        width: 80,
        renderCell: ({ value }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1, backgroundColor: value || 'action.hover', border: '1px solid', borderColor: 'divider' }} />
          </Box>
        ),
      },
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
      title="Colores"
      breadcrumbs={[{ title: 'Colores' }]}
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
            Nuevo Color
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : (
          <DataGrid
            rows={colors || []}
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
            {editingColor ? 'Editar Color' : 'Nuevo Color'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                fullWidth
                autoFocus
                placeholder="Ej: Rojo Ferrari, Azul Marino"
              />
              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <input
                    type="color"
                    value={formData.hexCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, hexCode: e.target.value }))}
                    style={{ width: 56, height: 40, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                  />
                  <TextField
                    label="Código Hex"
                    value={formData.hexCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, hexCode: e.target.value }))}
                    fullWidth
                    placeholder="#FF0000"
                    size="small"
                  />
                </Stack>
              </Box>
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
              {editingColor ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
}