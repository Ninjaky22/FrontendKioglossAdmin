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
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LabelIcon from '@mui/icons-material/Label';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
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

type PaginationDisplayedRowsParams = {
  from: number;
  to: number;
  count: number;
  estimated: number | undefined;
};

export default function TagList() {
  const dispatch = useDispatch<any>();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const parentTheme = useTheme();

  const localTheme = React.useMemo(
    () =>
      createTheme(parentTheme, {
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                backgroundColor: '#fdf4ff',
                outline: 'none',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused': { boxShadow: 'none' },
                '&:focus': { outline: 'none' },
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              select: {
                '&:focus': {
                  backgroundColor: 'transparent',
                  outline: 'none',
                },
              },
            },
            defaultProps: {
              MenuProps: {
                PaperProps: {
                  sx: {
                    borderRadius: '12px',
                    border: '1px solid #f0d6fb',
                    boxShadow: '0 10px 40px -10px rgba(155, 48, 160, 0.1)',
                    mt: 1,
                    '& .MuiMenuItem-root': {
                      borderRadius: '8px',
                      mx: 1,
                      mb: 0.5,
                      padding: '8px 12px',
                      outline: 'none',
                      '&:focus, &:focus-visible': { outline: 'none' },
                      '&:hover': { backgroundColor: '#fdf4ff' },
                      '&.Mui-selected': {
                        backgroundColor: '#fce4ff',
                        color: '#610361',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: '#f0d6fb' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    [parentTheme]
  );

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
      { field: 'id', headerName: 'ID', width: 80, align: 'center', headerAlign: 'center' },
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
        field: 'imageURL',
        headerName: 'URL IMAGEN',
        flex: 2,
        minWidth: 220,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          params.value ? (
            <Tooltip title={params.value}>
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  width: '100%'
                }}
              >
                {params.value}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>
              Sin imagen
            </Typography>
          )
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
            icon={<EditIcon fontSize="small" sx={{ color: '#9b30a0' }} />}
            label="Editar"
            onClick={handleOpenEdit(row)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />}
            label="Eliminar"
            onClick={handleDelete(row)}
          />,
        ],
      },
    ],
    [handleOpenEdit, handleDelete]
  );

  return (
    <ThemeProvider theme={localTheme}>
      <PageContainer title="Categorías" breadcrumbs={[{ title: 'Categorías' }]}>
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
                <LabelIcon />
             </Box>
             <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#610361', lineHeight: 1.2 }}>
                   Listado de Categorías
                </Typography>
                <Typography variant="caption" color="text.secondary">
                   Administra las etiquetas y clasificaciones
                </Typography>
             </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Recargar datos">
              <IconButton 
                onClick={handleRefresh} 
                sx={{ 
                  color: '#9b30a0', 
                  backgroundColor: '#fdf4ff',
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: '#fce4ff', color: '#9b30a0' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              onClick={handleOpenCreate} 
              startIcon={<AddIcon />}
              sx={{ 
                backgroundColor: '#9b30a0', 
                borderRadius: '12px', 
                textTransform: 'none', 
                fontWeight: 700, 
                '&:hover': { backgroundColor: '#610361' } 
              }}
            >
              Nueva Categoría
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
            <DataGrid
              rows={tags || []}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, color: '#610361', textAlign: 'center', mt: 1 }}>
            {editingTag ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                autoFocus
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="URL de Imagen (opcional)"
                value={formData.imageURL}
                onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                fullWidth
                placeholder="https://ejemplo.com/imagen.jpg"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              sx={{ color: '#666', fontWeight: 600, borderRadius: '12px' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating || isUpdating}
              startIcon={(isCreating || isUpdating) ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                backgroundColor: '#9b30a0', 
                borderRadius: '12px', 
                fontWeight: 700, 
                px: 4,
                '&:hover': { backgroundColor: '#610361' } 
              }}
            >
              {editingTag ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      </PageContainer>
    </ThemeProvider>
  );
}