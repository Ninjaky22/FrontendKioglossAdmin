import * as React from 'react';
import { extractErrorMessage } from '../utils/errorUtils';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { AccionesProduct } from '../store/actions/product';
import {
  productoActualSelector,
  obtenerProductoEnProgresoSelector,
  errorObtenerProductoSelector,
  subirImagenEnProgresoSelector,
  borrarImagenEnProgresoSelector,
} from '../store/selectors/product';
import PageContainer from './PageContainer';

export default function ProductImages() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const product = useSelector(productoActualSelector);
  const isLoadingProduct = useSelector(obtenerProductoEnProgresoSelector);
  const error = useSelector(errorObtenerProductoSelector);
  const isUploadingImage = useSelector(subirImagenEnProgresoSelector);
  const isDeletingImage = useSelector(borrarImagenEnProgresoSelector);

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadData = React.useCallback(async () => {
    if (productId) {
      await dispatch(AccionesProduct.obtenerProductoPorId(Number(productId)));
    }
  }, [productId, dispatch]);

  React.useEffect(() => {
    loadData();

    // Cleanup
    return () => {
      dispatch(AccionesProduct.limpiarProductoActual());
      setImagePreview(null);
    };
  }, [loadData, dispatch]);

  const handleBack = React.useCallback(() => {
    navigate(`/products/${productId}`);
  }, [navigate, productId]);

  const handleImageSelect = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      notifications.show('Por favor selecciona una imagen válida', {
        severity: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifications.show('La imagen no debe superar los 5MB', {
        severity: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [notifications]);

  const handleUploadImage = React.useCallback(async () => {
    if (!imagePreview || !productId) return;

    try {
      await dispatch(AccionesProduct.subirImagenProducto({
        productId: Number(productId),
        imageBase64: imagePreview,
      }));

      notifications.show('Imagen subida exitosamente', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Recargar el producto para ver la nueva imagen
      await loadData();
    } catch (error) {
      notifications.show(
        extractErrorMessage(error),
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
    }
  }, [imagePreview, productId, dispatch, notifications, loadData]);

  const handleDeleteImage = React.useCallback(async (imageId: number) => {
    const confirmed = await dialogs.confirm(
      '¿Deseas eliminar esta imagen?',
      {
        title: 'Eliminar imagen',
        severity: 'error',
        okText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    );

    if (confirmed) {
      try {
        await dispatch(AccionesProduct.borrarImagenProducto(imageId));

        notifications.show('Imagen eliminada exitosamente', {
          severity: 'success',
          autoHideDuration: 3000,
        });

        // Recargar el producto
        await loadData();
      } catch (error) {
        notifications.show(
          extractErrorMessage(error),
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    }
  }, [dialogs, dispatch, notifications, loadData]);

  const handleCancelPreview = React.useCallback(() => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const renderContent = React.useMemo(() => {
    if (isLoadingProduct) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    if (!product) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="warning">Producto no encontrado</Alert>
        </Box>
      );
    }

    return (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        {/* Upload Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Subir Nueva Imagen
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              id="image-upload-input"
            />
            <label htmlFor="image-upload-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                disabled={isUploadingImage}
              >
                Seleccionar Imagen
              </Button>
            </label>
          </Box>

          {imagePreview && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Vista previa:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                />
              </Paper>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleUploadImage}
                  disabled={isUploadingImage}
                  startIcon={isUploadingImage ? <CircularProgress size={20} /> : <UploadIcon />}
                >
                  {isUploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelPreview}
                  disabled={isUploadingImage}
                >
                  Cancelar
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Existing Images */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Imágenes Actuales ({product.images.length})
          </Typography>

          {product.images.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No hay imágenes para este producto
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Sube la primera imagen usando el formulario de arriba
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {product.images.map((image, index) => (
                <Grid key={image.id || index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Paper variant="outlined" sx={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={isDeletingImage}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        typography: 'caption',
                      }}
                    >
                      #{index + 1}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Volver al Producto
          </Button>
        </Box>
      </Box>
    );
  }, [
    isLoadingProduct,
    error,
    product,
    imagePreview,
    isUploadingImage,
    isDeletingImage,
    handleImageSelect,
    handleUploadImage,
    handleCancelPreview,
    handleDeleteImage,
    handleBack,
  ]);

  const pageTitle = product ? `Imágenes - ${product.title}` : 'Gestionar Imágenes';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Productos', path: '/products' },
        { title: `Producto ${productId}`, path: `/products/${productId}` },
        { title: 'Imágenes' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderContent}</Box>
    </PageContainer>
  );
}