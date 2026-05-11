import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ThemeProvider, createTheme, useTheme, alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { extractErrorMessage } from '../../utils/errorUtils';
import { AccionesVariant } from '../../store/actions/variant';
import {
  listaVariantesSelector,
  obtenerVariantesEnProgresoSelector,
  crearVarianteEnProgresoSelector,
} from '../../store/selectors/variant';
import PageContainer from '../PageContainer';

export default function VariantTypeList() {
  const dispatch = useDispatch<any>();
  const notifications = useNotifications();
  const parentTheme = useTheme();
  const theme = parentTheme;

  const localTheme = React.useMemo(
    () =>
      createTheme(parentTheme, {
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                backgroundColor: alpha(parentTheme.palette.primary.main, parentTheme.palette.mode === 'dark' ? 0.2 : 0.08),
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
                    border: `1px solid ${parentTheme.palette.divider}`,
                    boxShadow: parentTheme.palette.mode === 'dark'
                      ? '0 16px 40px rgba(0, 0, 0, 0.45)'
                      : '0 10px 40px -10px rgba(155, 48, 160, 0.12)',
                    mt: 1,
                    '& .MuiMenuItem-root': {
                      borderRadius: '8px',
                      mx: 1,
                      mb: 0.5,
                      padding: '8px 12px',
                      outline: 'none',
                      '&:focus, &:focus-visible': { outline: 'none' },
                      '&:hover': { backgroundColor: parentTheme.palette.action.hover },
                      '&.Mui-selected': {
                        backgroundColor: parentTheme.palette.action.selected,
                        color: parentTheme.palette.mode === 'dark' ? parentTheme.palette.primary.light : parentTheme.palette.primary.dark,
                        fontWeight: 600,
                        '&:hover': { backgroundColor: parentTheme.palette.action.selected },
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

  const variantes = useSelector(listaVariantesSelector);
  const isLoading = useSelector(obtenerVariantesEnProgresoSelector);
  const isCreating = useSelector(crearVarianteEnProgresoSelector);

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('button');
  const [options, setOptions] = React.useState<{id?: number, value: string, metaValue: string}[]>([{ value: '', metaValue: '' }]);

  React.useEffect(() => {
    dispatch(AccionesVariant.obtenerVariantes());
  }, [dispatch]);

  const [editId, setEditId] = React.useState<number | null>(null);

  const handleOpen = (variant?: any) => {
    if (variant) {
      setEditId(variant.id);
      setName(variant.name);
      setType(variant.type);
      setOptions(variant.options.length > 0 ? variant.options.map((o: any) => ({ id: o.id, value: o.value, metaValue: o.metaValue || '' })) : [{ value: '', metaValue: '' }]);
    } else {
      setEditId(null);
      setName('');
      setType('button');
      setOptions([{ value: '', metaValue: '' }]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddOption = () => {
    setOptions([...options, { value: '', metaValue: '' }]);
  };

  const handleOptionChange = (index: number, field: 'value' | 'metaValue', val: string) => {
    const newOptions = [...options];
    newOptions[index][field] = val;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      notifications.show('El nombre es requerido', { severity: 'error' });
      return;
    }
    
    const validOptions = options.filter(o => o.value.trim() !== '');
    if (validOptions.length === 0) {
      notifications.show('Añade al menos una opción válida', { severity: 'error' });
      return;
    }

    try {
      if (editId) {
        await dispatch(AccionesVariant.actualizarVariante(editId, { name, type, options: validOptions }));
        notifications.show('Tipo de variante actualizado con éxito', { severity: 'success' });
      } else {
        await dispatch(AccionesVariant.crearVariante({ name, type, options: validOptions }));
        notifications.show('Tipo de variante creado con éxito', { severity: 'success' });
      }
      handleClose();
    } catch (error) {
      notifications.show(extractErrorMessage(error), { severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este tipo de variante? Esta acción no se puede deshacer.')) {
      try {
        await dispatch(AccionesVariant.eliminarVariante(id));
        notifications.show('Variante eliminada', { severity: 'success' });
      } catch (error) {
        notifications.show(extractErrorMessage(error), { severity: 'error' });
      }
    }
  };

  return (
    <ThemeProvider theme={localTheme}>
      <PageContainer
        title="Tipos de Variantes"
        breadcrumbs={[{ title: 'Catálogo' }, { title: 'Variantes' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Nuevo Tipo
          </Button>
        }
      >
      <Box sx={{ width: '100%', mt: 2 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : variantes.length === 0 ? (
          <Alert severity="info">No hay tipos de variantes registrados. Crea uno nuevo como "Modelo" o "Almacenamiento".</Alert>
        ) : (
          <Stack spacing={3}>
            {variantes.map(variant => (
              <Paper key={variant.id} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight="bold">{variant.name}</Typography>
                  <Box>
                    <IconButton color="primary" onClick={() => handleOpen(variant)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(variant.id)}><DeleteIcon /></IconButton>
                  </Box>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {variant.options.map(opt => (
                    <Chip 
                      key={opt.id} 
                      label={opt.value} 
                      variant="outlined" 
                      icon={opt.metaValue ? <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: opt.metaValue, ml: 1, border: `1px solid ${theme.palette.divider}` }} /> : undefined}
                    />
                  ))}
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar Tipo de Variante' : 'Crear Tipo de Variante'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              label="Nombre del Tipo (Ej: Almacenamiento, Modelo, Color)" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              fullWidth 
              required 
            />

            <FormControl fullWidth>
              <InputLabel>Tipo de Presentación</InputLabel>
              <Select value={type} label="Tipo de Presentación" onChange={e => setType(e.target.value)}>
                <MenuItem value="button">Botón (texto)</MenuItem>
                <MenuItem value="color">Color (círculo con color)</MenuItem>
                <MenuItem value="select">Lista desplegable</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Opciones Disponibles:</Typography>
            {options.map((opt, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField 
                  label={`Opción ${index + 1}`} 
                  size="small" 
                  value={opt.value} 
                  onChange={e => handleOptionChange(index, 'value', e.target.value)} 
                  fullWidth 
                  required 
                />
                {type === 'color' && (
                  <TextField 
                    label="Código Hex" 
                    size="small" 
                    value={opt.metaValue} 
                    onChange={e => handleOptionChange(index, 'metaValue', e.target.value)} 
                    placeholder="#FF0000"
                    sx={{ width: 150 }}
                    slotProps={{ input: { startAdornment: opt.metaValue ? <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: opt.metaValue, mr: 1, border: `1px solid ${theme.palette.divider}`, flexShrink: 0 }} /> : null } }}
                  />
                )}
                <IconButton color="error" onClick={() => handleRemoveOption(index)} disabled={options.length === 1}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddOption} sx={{ alignSelf: 'flex-start' }}>
              Añadir otra opción
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isCreating}>
            {isCreating ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
      </PageContainer>
    </ThemeProvider>
  );
}
