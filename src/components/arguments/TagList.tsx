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
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid';
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
  const theme = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { mode } = useColorScheme();
  const dispatch = useDispatch<any>();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const paletteMode = !mode || mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;
  const isDark = paletteMode === 'dark';
  const accentText = isDark ? theme.palette.common.white : theme.palette.primary.dark;
  const accentSoft = alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08);
  const listTextColor = isDark ? theme.palette.common.white : theme.palette.text.primary;

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

  const handleOpenCreate = () => {
    setEditingTag(null);
    setFormData({ name: '', imageURL: '' });
    setOpenDialog(true);
  };

  const handleOpenEdit = React.useCallback((tag: Tag) => () => {
    setEditingTag(tag);
    setFormData({ name: tag.name, imageURL: tag.imageURL || '' });
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTag(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await dispatch(AccionesTag.actualizarTag({ ...editingTag, ...formData }));
        notifications.show('Categoría actualizada', { severity: 'success' });
      } else {
        await dispatch(AccionesTag.crearTag(formData));
        notifications.show('Categoría creada', { severity: 'success' });
      }
      handleCloseDialog();
      loadData();
    } catch (err) {
      notifications.show(extractErrorMessage(err), { severity: 'error' });
    }
  };

  const handleDelete = React.useCallback((tag: Tag) => async () => {
    const confirmed = await dialogs.confirm(`¿Eliminar "${tag.name}"?`, { severity: 'error' });
    if (confirmed) {
      await dispatch(AccionesTag.borrarTag(tag.id));
      loadData();
    }
  }, [dialogs, dispatch, loadData]);

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: listTextColor, fontFamily: 'monospace' }}>
            #{params.value}
          </Typography>
        )
      },
      {
        field: 'name',
        headerName: 'NOMBRE',
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: listTextColor }}>
            {params.value}
          </Typography>
        )
      },
      {
        field: 'imageURL',
        headerName: 'URL IMAGEN',
        flex: 2,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: listTextColor, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value || 'Sin imagen'}
          </Typography>
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'ACCIONES',
        width: 110,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            icon={<Tooltip title="Editar"><EditIcon fontSize="small" sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }} /></Tooltip>}
            label="Editar"
            onClick={handleOpenEdit(row)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<Tooltip title="Eliminar"><DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} /></Tooltip>}
            label="Eliminar"
            onClick={handleDelete(row)}
          />,
        ],
      },
    ],
    [listTextColor, isDark, theme.palette, handleOpenEdit, handleDelete]
  );

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : alpha(theme.palette.primary.main, 0.05),
      color: isDark ? '#fff' : theme.palette.text.primary,
      transition: 'all 0.2s ease-in-out',
      '& fieldset': { border: 'none' },
      '&:hover fieldset': { border: 'none' },
      '&.Mui-focused fieldset': { border: 'none' },
      '&.Mui-focused': {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : alpha(theme.palette.primary.main, 0.1),
      },
    },
    '& .MuiInputBase-input': { p: '16px 20px' }
  };

  return (
    <PageContainer title="Categorías" breadcrumbs={[{ title: 'Categorías' }]}>
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
              p: 1.5, borderRadius: 3,
              backgroundColor: accentSoft, color: theme.palette.primary.main,
              display: { xs: 'none', md: 'flex' }
            }}>
              <LabelIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: accentText, lineHeight: 1.2 }}>
                Listado de Categorías
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administra las etiquetas y clasificaciones
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
                  '&:hover': { backgroundColor: theme.palette.primary.dark }
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
                backgroundColor: theme.palette.primary.main,
                borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                px: 3,
                '&:hover': { backgroundColor: theme.palette.primary.dark }
              }}
            >
              Nueva Categoría
            </Button>
          </Stack>
        </Stack>

        <Box sx={{
          width: '100%',
          height: { xs: 550, lg: 700 },
          '& .MuiDataGrid-root': { border: 'none', color: listTextColor },
          '& .MuiDataGrid-cell, & .MuiDataGrid-cellContent, & .MuiDataGrid-row': { color: listTextColor },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: `${theme.palette.primary.dark} !important`,
            color: theme.palette.getContrastText(theme.palette.primary.dark),
            borderRadius: '12px', borderBottom: 'none', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem',
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
            borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '4px 12px', 
            overflow: 'hidden', // Evita cualquier scroll en el footer
          },
          '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
          '& .MuiDataGrid-scrollbar--horizontal': { display: 'none' },
          
          // --- CORRECCIÓN DEFINITIVA DE PAGINACIÓN ---
          '& .MuiTablePagination-root': {
            color: listTextColor,
            overflow: 'hidden',
          },
          '& .MuiTablePagination-select': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : theme.palette.background.paper,
            borderRadius: '8px',
            color: listTextColor,
          },
          '& .MuiTablePagination-selectIcon': { color: listTextColor },
          '& .MuiTablePagination-actions': {
            display: 'flex',
            gap: '2px',
            marginLeft: '12px',
            overflow: 'hidden !important', // Mata el scroll de las flechas
          },
          '& .MuiTablePagination-actions .MuiIconButton-root': {
            color: `${listTextColor} !important`, // Asegura color blanco en dark mode
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            borderRadius: '10px',
            padding: '6px',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : theme.palette.action.hover,
            },
            '&.Mui-disabled': {
              color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.26) !important',
            }
          }
        }}>
          {error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error.message || 'Error'}</Alert>
          ) : (
            <DataGrid
              rows={tags || []}
              columns={columns}
              loading={isLoading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              localeText={{
                paginationRowsPerPage: 'Filas por pagina',
                paginationDisplayedRows: (params: PaginationDisplayedRowsParams) => {
                  const { from, to, count } = params;
                  return `${from}-${to} de ${count !== -1 ? count : `mas de ${to}`}`;
                },
              }}
              rowSelection={false}
              disableColumnMenu
              rowHeight={70}
            />
          )}
        </Box>
      </Paper>

      {/* Dialog para crear/editar */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            backgroundColor: isDark ? '#1d1b26' : theme.palette.background.paper,
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            p: 1
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, color: isDark ? '#fff' : theme.palette.primary.dark, textAlign: 'center', mt: 2, fontSize: '1.5rem' }}>
            {editingTag ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 900, ml: 1, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Nombre *
                </Typography>
                <TextField
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                  autoFocus
                  placeholder="Ej. Labiales"
                  variant="outlined"
                  sx={inputStyle}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 900, ml: 1, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  URL de Imagen (opcional)
                </Typography>
                <TextField
                  value={formData.imageURL}
                  onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                  fullWidth
                  placeholder="https://vignette.com/foto.jpg"
                  variant="outlined"
                  sx={inputStyle}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2, justifyContent: 'center', gap: 3 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{ color: isDark ? '#fff' : theme.palette.text.secondary, fontWeight: 800, borderRadius: '12px', opacity: 0.7, '&:hover': { opacity: 1, backgroundColor: 'transparent' } }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating || isUpdating}
              sx={{
                borderRadius: '20px', fontWeight: 900, px: 6, py: 1.5, fontSize: '1rem',
                backgroundColor: theme.palette.primary.main,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: `0 12px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              {(isCreating || isUpdating) ? <CircularProgress size={24} color="inherit" /> : (editingTag ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
}