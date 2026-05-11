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
import { ThemeProvider, createTheme, useTheme, alpha, useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  const theme = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { mode } = useColorScheme();
  
  // VARIABLES DE ESTILO COPIADAS EXACTAMENTE DE ORDERLIST
  const paletteMode = !mode || mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;
  const isDark = paletteMode === 'dark';
  const accentText = isDark ? theme.palette.common.white : theme.palette.primary.dark;
  const accentSoft = alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08);
  const listTextColor = isDark ? theme.palette.common.white : theme.palette.text.primary;

  // LÓGICA DE DATOS
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

  const handleOpenEdit = (tag: Tag) => () => {
    setEditingTag(tag);
    setFormData({ name: tag.name, imageURL: tag.imageURL || '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTag(null);
    setFormData({ name: '', imageURL: '' });
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

  const handleDelete = (tag: Tag) => async () => {
    const confirmed = await dialogs.confirm(`¿Eliminar "${tag.name}"?`, { severity: 'error' });
    if (confirmed) {
      await dispatch(AccionesTag.borrarTag(tag.id));
      loadData();
    }
  };

  // COLUMNAS CON EL ESTILO DE TEXTO DE ORDERLIST
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
    [listTextColor, isDark, theme.palette]
  );

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
            borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '4px 12px', overflow: 'hidden',
          },
          '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
          '& .MuiDataGrid-scrollbar--horizontal': { display: 'none' },
          '& .MuiTablePagination-root, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': { color: listTextColor, fontWeight: 600 },
          '& .MuiTablePagination-select': { backgroundColor: theme.palette.background.paper, borderRadius: '10px', padding: '4px 28px 4px 10px', color: listTextColor },
          '& .MuiTablePagination-selectIcon': { color: listTextColor },
          '& .MuiTablePagination-actions .MuiIconButton-root': {
            color: listTextColor, backgroundColor: theme.palette.background.paper, borderRadius: '10px', border: `1px solid ${theme.palette.divider}`, marginLeft: '4px',
            '&:hover': { backgroundColor: theme.palette.action.hover },
          },
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
              rowSelection={false}
              disableColumnMenu
              rowHeight={70}
            />
          )}
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, color: isDark ? '#fff' : theme.palette.primary.dark, textAlign: 'center', mt: 1 }}>
            {editingTag ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField label="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required fullWidth autoFocus />
              <TextField label="URL de Imagen (opcional)" value={formData.imageURL} onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: theme.palette.text.secondary, fontWeight: 600, borderRadius: '12px' }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isCreating || isUpdating} sx={{ borderRadius: '12px', fontWeight: 700, px: 4 }}>
              {(isCreating || isUpdating) ? <CircularProgress size={20} color="inherit" /> : (editingTag ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
}