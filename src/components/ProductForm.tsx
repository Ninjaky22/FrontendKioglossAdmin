import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import type { CreateProductRequest, UpdateProductRequest, TagDTO, ProductVariantRequestDTO, ImageDTO } from '../models/Product';
import type { VariantTypeDTO as StoreVariantTypeDTO, VariantOptionDTO } from '../models/Variant';

export interface ProductFormState {
  values: Partial<CreateProductRequest | UpdateProductRequest>;
  errors: Partial<Record<keyof CreateProductRequest, string>>;
}

export type FormFieldValue = string | number | number[] | Record<string, string> | ProductVariantRequestDTO[] | null;

export interface ProductFormProps {
  formState: ProductFormState;
  onFieldChange: (
    name: keyof ProductFormState['values'],
    value: FormFieldValue,
  ) => void;
  onSubmit: (formValues: Partial<ProductFormState['values']>) => Promise<void>;
  submitButtonLabel: string;
  backButtonPath?: string;
  variantTypes: StoreVariantTypeDTO[];
  tags: TagDTO[];
  productImages?: ImageDTO[];
}

// Sub-componente para gestionar Variantes como combinaciones (cada variante = 1 opción por cada tipo + stock + imagen)
const VariantBuilder = React.memo(({ initialVariants, variantTypes, productImages = [], onChange }: { initialVariants: ProductVariantRequestDTO[], variantTypes: StoreVariantTypeDTO[], productImages?: ImageDTO[], onChange: (v: ProductVariantRequestDTO[]) => void }) => {
  const [variants, setVariants] = React.useState<ProductVariantRequestDTO[]>(initialVariants || []);

  // Derive which variant types are used in this product (selected via checkboxes)
  const [selectedTypeIds, setSelectedTypeIds] = React.useState<number[]>(() => {
    if (!initialVariants?.length || !variantTypes.length) return [];
    const ids = new Set<number>();
    initialVariants.forEach(v => {
      v.optionIds?.forEach(optId => {
        const vt = variantTypes.find(t => t.options.some(o => o.id === optId));
        if (vt) ids.add(vt.id);
      });
    });
    return Array.from(ids);
  });

  // Re-derive selectedTypeIds when variantTypes loads asynchronously
  React.useEffect(() => {
    if (variantTypes.length === 0 || selectedTypeIds.length > 0) return;
    const ids = new Set<number>();
    variants.forEach(v => {
      v.optionIds?.forEach(optId => {
        const vt = variantTypes.find(t => t.options.some(o => o.id === optId));
        if (vt) ids.add(vt.id);
      });
    });
    if (ids.size > 0) setSelectedTypeIds(Array.from(ids));
  }, [variantTypes, variants, selectedTypeIds]);

  const activeTypes = React.useMemo(
    () => variantTypes.filter(vt => selectedTypeIds.includes(vt.id)),
    [variantTypes, selectedTypeIds]
  );

  // Helper: get the option selected in a variant for a given type
  const getOptionForType = (variant: ProductVariantRequestDTO, type: StoreVariantTypeDTO): VariantOptionDTO | null => {
    if (!variant.optionIds) return null;
    return type.options.find(o => variant.optionIds!.includes(o.id)) || null;
  };

  const handleToggleType = (typeId: number, checked: boolean) => {
    const next = checked ? [...selectedTypeIds, typeId] : selectedTypeIds.filter(id => id !== typeId);
    setSelectedTypeIds(next);
    // Clean optionIds from removed types
    if (!checked) {
      const removedType = variantTypes.find(vt => vt.id === typeId);
      if (removedType) {
        const removedOptionIds = new Set(removedType.options.map(o => o.id));
        const updatedVariants = variants.map(v => ({
          ...v,
          optionIds: (v.optionIds || []).filter(id => !removedOptionIds.has(id))
        }));
        setVariants(updatedVariants);
        onChange(updatedVariants);
      }
    }
  };

  const handleOptionChange = (idx: number, type: StoreVariantTypeDTO, optionId: number | undefined) => {
    const next = [...variants];
    const currentOptionIds = next[idx].optionIds || [];
    // Remove any existing option from this type, add the new one
    const typeOptionIds = new Set(type.options.map(o => o.id));
    const filtered = currentOptionIds.filter(id => !typeOptionIds.has(id));
    next[idx] = { ...next[idx], optionIds: optionId ? [...filtered, optionId] : filtered };
    setVariants(next);
    onChange(next);
  };

  const handleChange = (idx: number, field: keyof ProductVariantRequestDTO, val: any) => {
    const next = [...variants];
    next[idx] = { ...next[idx], [field]: val };
    setVariants(next);
    onChange(next);
  };

  const handleAdd = () => {
    const newVariant: ProductVariantRequestDTO = { stock: 0, sku: `SKU-${Date.now()}`, optionIds: [] };
    const next = [...variants, newVariant];
    setVariants(next);
    onChange(next);
  };

  const handleRemove = (idx: number) => {
    const next = variants.filter((_, i) => i !== idx);
    setVariants(next);
    onChange(next);
  };

  // Generate cartesian product of all active types' options
  const handleGenerateCombinations = () => {
    if (activeTypes.length === 0) return;
    const optionArrays = activeTypes.map(t => t.options);
    const cartesian = (arrays: VariantOptionDTO[][]): VariantOptionDTO[][] => {
      if (arrays.length === 0) return [[]];
      const [first, ...rest] = arrays;
      const restCombos = cartesian(rest);
      return first.flatMap(opt => restCombos.map(combo => [opt, ...combo]));
    };
    const combos = cartesian(optionArrays);

    // Keep existing variants that match a combo, create new ones for missing
    const newVariants: ProductVariantRequestDTO[] = combos.map(combo => {
      const comboIds = combo.map(o => o.id).sort((a, b) => a - b);
      const existing = variants.find(v => {
        const vIds = [...(v.optionIds || [])].sort((a, b) => a - b);
        return vIds.length === comboIds.length && vIds.every((id, i) => id === comboIds[i]);
      });
      if (existing) return existing;
      const label = combo.map(o => o.value).join('-');
      return { stock: 0, sku: `SKU-${label}-${Date.now()}`, optionIds: comboIds };
    });

    setVariants(newVariants);
    onChange(newVariants);
  };

  // Summary chip for a variant row
  const getVariantLabel = (v: ProductVariantRequestDTO): string => {
    if (!v.optionIds?.length) return 'Sin opciones';
    return v.optionIds.map(id => {
      for (const vt of variantTypes) {
        const opt = vt.options.find(o => o.id === id);
        if (opt) return opt.value;
      }
      return `#${id}`;
    }).join(' / ');
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, width: '100%', overflowX: 'auto' }}>
      {/* Type selector */}
      <Typography variant="subtitle2" gutterBottom>Tipos de variante del producto:</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {variantTypes.map(vt => (
          <Chip
            key={vt.id}
            label={vt.name}
            color={selectedTypeIds.includes(vt.id) ? 'primary' : 'default'}
            variant={selectedTypeIds.includes(vt.id) ? 'filled' : 'outlined'}
            onClick={() => handleToggleType(vt.id, !selectedTypeIds.includes(vt.id))}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      {activeTypes.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">
              Cada variante = una combinación de {activeTypes.map(t => t.name).join(' × ')}:
            </Typography>
            <Tooltip title="Genera automáticamente todas las combinaciones posibles">
              <Button size="small" variant="outlined" onClick={handleGenerateCombinations} startIcon={<AddIcon />}>
                Generar Combinaciones
              </Button>
            </Tooltip>
          </Box>

          <Stack spacing={2} sx={{ minWidth: 600 }}>
            {variants.map((v, idx) => {
              const selectedImage = productImages.find(img => img.url === v.imageUrl) || null;

              return (
                <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 20 }}>#{idx + 1}</Typography>

                  {activeTypes.map(type => {
                    const selectedOpt = getOptionForType(v, type);
                    return (
                      <Autocomplete
                        key={type.id}
                        size="small"
                        sx={{ minWidth: 140 }}
                        options={type.options}
                        getOptionLabel={(o: VariantOptionDTO) => o.value}
                        value={selectedOpt}
                        onChange={(_, newVal) => handleOptionChange(idx, type, newVal?.id)}
                        renderInput={(params) => <TextField {...params} label={type.name} />}
                        isOptionEqualToValue={(opt, val) => opt.id === val.id}
                      />
                    );
                  })}

                  <TextField label="Stock" type="number" size="small" value={v.stock} onChange={(e) => handleChange(idx, 'stock', Number(e.target.value))} sx={{ width: 90 }} />
                  <TextField label="SKU" size="small" value={v.sku} onChange={(e) => handleChange(idx, 'sku', e.target.value)} sx={{ flex: 1, minWidth: 120 }} />
                  <Autocomplete
                    size="small"
                    sx={{ flex: 2, minWidth: 180 }}
                    options={productImages}
                    getOptionLabel={(img: ImageDTO) => img.url.split('/').pop() || img.url}
                    value={selectedImage}
                    onChange={(_, newVal) => handleChange(idx, 'imageUrl', newVal?.url)}
                    renderInput={(params) => <TextField {...params} label="Imagen (Opcional)" />}
                    renderOption={(props, img) => (
                      <Box component="li" {...props} key={img.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img src={img.url} alt="thumbnail" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
                        <Typography variant="body2" noWrap>{img.url.split('/').pop()}</Typography>
                      </Box>
                    )}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  />
                  <IconButton color="error" onClick={() => handleRemove(idx)}><DeleteIcon /></IconButton>
                </Box>
              );
            })}
            <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAdd} sx={{ alignSelf: 'flex-start' }}>Añadir Variante</Button>
          </Stack>
        </>
      )}

      {activeTypes.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Selecciona al menos un tipo de variante para empezar a crear combinaciones.
        </Typography>
      )}
    </Paper>
  );
});

// Sub-componente para el editor memoizado
const RichTextEditor = React.memo(({ value, onChange, error }: { value: string, onChange: (val: string) => void, error?: string }) => (
  <FormControl fullWidth error={!!error}>
    <Typography variant="body1" sx={{ mb: 1, color: error ? 'error.main' : 'text.secondary' }}>
      Descripción
    </Typography>
    <Paper variant="outlined">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange}
        style={{ height: '250px', marginBottom: '45px' }}
      />
    </Paper>
    <FormHelperText>{error ?? ' '}</FormHelperText>
  </FormControl>
));

// Sub-componente para la ficha técnica memoizada
const TechnicalSpecs = React.memo(({ initialAttributes, onChange }: { initialAttributes: Record<string, string>, onChange: (attrs: Record<string, string>) => void }) => {
  const [localAttrs, setLocalAttrs] = React.useState<{key: string, value: string}[]>(() => 
    Object.entries(initialAttributes || {}).map(([key, value]) => ({ key, value }))
  );

  const handleAdd = () => setLocalAttrs([...localAttrs, { key: '', value: '' }]);
  
  const handleChange = (idx: number, field: 'key' | 'value', val: string) => {
    const next = [...localAttrs];
    next[idx][field] = val;
    setLocalAttrs(next);
    
    const record: Record<string, string> = {};
    next.forEach(a => { if (a.key.trim()) record[a.key.trim()] = a.value; });
    onChange(record);
  };

  const handleRemove = (idx: number) => {
    const next = localAttrs.filter((_, i) => i !== idx);
    setLocalAttrs(next);
    const record: Record<string, string> = {};
    next.forEach(a => { if (a.key.trim()) record[a.key.trim()] = a.value; });
    onChange(record);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        {localAttrs.map((attr, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField label="Nombre" size="small" value={attr.key} onChange={(e) => handleChange(index, 'key', e.target.value)} sx={{ flex: 1 }} />
            <TextField label="Valor" size="small" value={attr.value} onChange={(e) => handleChange(index, 'value', e.target.value)} sx={{ flex: 2 }} />
            <IconButton color="error" onClick={() => handleRemove(index)}><DeleteIcon /></IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAdd} sx={{ alignSelf: 'flex-start' }}>Añadir Especificación</Button>
      </Stack>
    </Paper>
  );
});

// Sub-componente para campos de texto optimizados
const OptimizedTextField = React.memo(({ label, name, value, onChange, error, helperText, type = 'text', fullWidth = true, required = false, slotProps }: any) => {
  const [localValue, setLocalValue] = React.useState(value ?? '');

  // Sincronizar valor local si el valor externo cambia (ej: por carga inicial o slug automático)
  React.useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange({ target: { name, value: localValue } });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    // Para el título y slug queremos actualización inmediata para que se vea el cambio reflejado entre ellos
    if (name === 'title' || name === 'slug') {
        onChange(e);
    }
  };

  return (
    <TextField
      label={label}
      name={name}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      helperText={helperText}
      type={type}
      fullWidth={fullWidth}
      required={required}
      slotProps={slotProps}
    />
  );
});

export default function ProductForm(props: ProductFormProps) {
  const { formState, onFieldChange, onSubmit, submitButtonLabel, backButtonPath, variantTypes, tags, productImages } = props;
  const formValues = formState.values;
  const formErrors = formState.errors;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Toggle: does this product use explicit variants or just a stock field?
  const hasRealVariants = ((formValues.variants as ProductVariantRequestDTO[]) || []).some(v => v.optionIds && v.optionIds.length > 0);
  const [useVariants, setUseVariants] = React.useState(hasRealVariants);

  const handleToggleVariants = React.useCallback((checked: boolean) => {
    setUseVariants(checked);
    if (!checked) {
      onFieldChange('variants', []);
    }
  }, [onFieldChange]);

  const handleDescriptionChange = React.useCallback((content: string) => {
    onFieldChange('description', content);
  }, [onFieldChange]);

  const handleAttributesChange = React.useCallback((attrs: Record<string, string>) => {
    onFieldChange('attributes', attrs);
  }, [onFieldChange]);

  const handleSubmit = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try { await onSubmit(formValues); } finally { setIsSubmitting(false); }
  }, [formValues, onSubmit]);

  const handleTextFieldChange = React.useCallback((event: any) => {
    onFieldChange(event.target.name as keyof ProductFormState['values'], event.target.value);
  }, [onFieldChange]);

  const handleNumberFieldChange = React.useCallback((event: any) => {
    onFieldChange(event.target.name as keyof ProductFormState['values'], Number(event.target.value));
  }, [onFieldChange]);

  const handleSelectFieldChange = React.useCallback((event: SelectChangeEvent) => {
    onFieldChange(event.target.name as keyof ProductFormState['values'], event.target.value);
  }, [onFieldChange]);

  const handleMultiSelectChange = React.useCallback((fieldName: 'tagIds', itemId: number, checked: boolean) => {
    const currentValues = (formValues[fieldName] as number[]) || [];
    const newValues = checked ? [...currentValues, itemId] : currentValues.filter(id => id !== itemId);
    onFieldChange(fieldName, newValues);
  }, [formValues, onFieldChange]);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ width: '100%' }}>
      <FormGroup>
        <Grid container spacing={3} sx={{ mb: 2, width: '100%' }}>
          <Grid size={12}><Typography variant="h6" gutterBottom>Información Básica</Typography></Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <OptimizedTextField 
                label="Título" 
                name="title" 
                value={formValues.title} 
                onChange={handleTextFieldChange} 
                error={!!formErrors.title} 
                helperText={formErrors.title} 
                required 
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth error={!!formErrors.status}>
              <InputLabel>Estado</InputLabel>
              <Select value={formValues.status ?? 'draft'} onChange={handleSelectFieldChange} name="status" label="Estado" fullWidth>
                <MenuItem value="draft">Borrador</MenuItem>
                <MenuItem value="published">Publicado</MenuItem>
              </Select>
              <FormHelperText>{formErrors.status ?? ' '}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <OptimizedTextField 
                label="Slug" 
                name="slug" 
                value={formValues.slug} 
                onChange={handleTextFieldChange} 
                error={!!formErrors.slug} 
                helperText={formErrors.slug ?? 'Se genera automáticamente'} 
                required 
            />
          </Grid>
          <Grid size={12}>
            <RichTextEditor value={formValues.description ?? ''} onChange={handleDescriptionChange} error={formErrors.description} />
          </Grid>
          <Grid size={12} sx={{ mt: 2 }}><Typography variant="h6" gutterBottom>Ficha Técnica (Atributos)</Typography></Grid>
          <Grid size={12}>
            <TechnicalSpecs initialAttributes={formValues.attributes as Record<string, string>} onChange={handleAttributesChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <OptimizedTextField 
                label="Precio" 
                name="price" 
                type="number"
                value={formValues.price} 
                onChange={handleNumberFieldChange} 
                error={!!formErrors.price} 
                helperText={formErrors.price} 
                required 
                slotProps={{htmlInput: { min: 0, step: 0.01 }}}
            />
          </Grid>
          {/* Stock removed, managed by variants */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h6">Stock e Inventario</Typography>
              <FormControlLabel 
                control={<Switch checked={useVariants} onChange={(e) => handleToggleVariants(e.target.checked)} />} 
                label="Usar variantes (Color, Modelo, etc.)" 
              />
            </Box>
          </Grid>
          {useVariants ? (
            <Grid size={12}>
              <VariantBuilder 
                initialVariants={(formValues.variants as ProductVariantRequestDTO[]) || []}
                variantTypes={variantTypes}
                productImages={productImages}
                onChange={(variants) => onFieldChange('variants', variants)}
              />
            </Grid>
          ) : (
            <Grid size={{ xs: 12, sm: 6 }}>
              <OptimizedTextField 
                  label="Stock" 
                  name="stock" 
                  type="number"
                  value={formValues.stock ?? 0} 
                  onChange={handleNumberFieldChange} 
                  slotProps={{htmlInput: { min: 0 }}}
              />
            </Grid>
          )}
          <Grid size={12} sx={{ mt: 2 }}><Typography variant="h6" gutterBottom>Categorías</Typography></Grid>
          <Grid size={12}><Paper variant="outlined" sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {tags.map(t => <FormControlLabel key={t.id} control={<Checkbox checked={((formValues.tagIds as number[]) || []).includes(t.id)} onChange={e => handleMultiSelectChange('tagIds', t.id, e.target.checked)} />} label={t.name} />)}
          </Paper></Grid>
        </Grid>
      </FormGroup>
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 3 }}>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate(backButtonPath ?? '/products')}>Atrás</Button>
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : submitButtonLabel}</Button>
      </Stack>
    </Box>
  );
}