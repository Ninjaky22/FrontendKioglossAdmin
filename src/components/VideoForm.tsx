import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { Product } from '../models/Product';
import type { CreateVideoRequest } from '../models/VideoReel';
import httpClient from '../services/httpClient';

export interface VideoFormState {
  values: Partial<CreateVideoRequest>;
  errors: Partial<Record<keyof CreateVideoRequest, string>>;
}

export type FormFieldValue = string | number;

interface VideoFormProps {
  formState: VideoFormState;
  onFieldChange: (name: keyof VideoFormState['values'], value: FormFieldValue) => void;
  onSubmit: () => void;
  onReset: () => void;
  submitButtonLabel?: string;
  products: Product[];
}

const SUPPORTED_PLATFORMS = ['Instagram'];

const isInstagramUrl = (url: string) =>
  /instagram\.com\/(reel|p|tv)\/[a-zA-Z0-9_-]+/.test(url.trim());

export default function VideoForm({
  formState,
  onFieldChange,
  onSubmit,
  onReset,
  submitButtonLabel = 'Guardar',
  products,
}: VideoFormProps) {
  const { values, errors } = formState;
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    file: File,
    fieldName: 'thumbnailUrl' | 'videoUrl',
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await httpClient.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onFieldChange(fieldName, data.url);
    } catch {
      // Error handled by httpClient interceptors
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <TextField
          label="URL de Miniatura"
          value={values.thumbnailUrl || ''}
          onChange={(e) => onFieldChange('thumbnailUrl', e.target.value)}
          error={!!errors.thumbnailUrl}
          helperText={errors.thumbnailUrl}
          placeholder="https://ejemplo.com/miniatura.jpg"
          required
          fullWidth
        />

        <Button
          component="label"
          variant="outlined"
          startIcon={isUploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
          disabled={isUploading}
        >
          {isUploading ? 'Subiendo...' : 'Subir miniatura desde PC'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'thumbnailUrl', setIsUploading);
              e.target.value = '';
            }}
          />
        </Button>

        {values.thumbnailUrl && (
          <Box sx={{ width: 120, aspectRatio: '9/16', borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.100' }}>
            <img
              src={values.thumbnailUrl}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </Box>
        )}

        <Box>
          <TextField
            label="URL del Video de Instagram"
            value={values.videoUrl || ''}
            onChange={(e) => onFieldChange('videoUrl', e.target.value)}
            error={!!errors.videoUrl || !!(values.videoUrl && !isInstagramUrl(values.videoUrl))}
            helperText={
              errors.videoUrl
              || (values.videoUrl && !isInstagramUrl(values.videoUrl)
                  ? 'Solo se aceptan enlaces de Instagram (reel, post o IGTV)'
                  : 'Pega el enlace del reel o publicación de Instagram')
            }
            placeholder="https://www.instagram.com/reel/ABC123..."
            fullWidth
          />
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Plataforma aceptada:
            </Typography>
            {SUPPORTED_PLATFORMS.map((p) => (
              <Chip key={p} label={p} size="small" color="primary" variant="outlined" />
            ))}
          </Stack>
          {values.videoUrl && isInstagramUrl(values.videoUrl) && (
            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
              ✓ Enlace de Instagram válido
            </Typography>
          )}
        </Box>

        <TextField
          label="Nombre de usuario"
          value={values.username || ''}
          onChange={(e) => onFieldChange('username', e.target.value)}
          error={!!errors.username}
          helperText={errors.username}
          placeholder="@usuario"
          required
          fullWidth
        />

        <TextField
          select
          label="Producto relacionado"
          value={values.productId || ''}
          onChange={(e) => onFieldChange('productId', Number(e.target.value))}
          error={!!errors.productId}
          helperText={errors.productId}
          required
          fullWidth
        >
          <MenuItem value="">
            <em>Seleccionar producto...</em>
          </MenuItem>
          {products.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.title} - ${p.price}
            </MenuItem>
          ))}
        </TextField>

        {Object.values(errors).some(Boolean) && (
          <Alert severity="error">Por favor corrige los errores antes de continuar.</Alert>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onReset}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onSubmit}>
            {submitButtonLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
