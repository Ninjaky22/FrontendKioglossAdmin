import * as React from 'react';
import { extractErrorMessage } from '../utils/errorUtils';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import EditIcon from '@mui/icons-material/Edit';
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
} from '../store/selectors/product';
import PageContainer from './PageContainer';

export default function ProductShow() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const product = useSelector(productoActualSelector);
  const isLoading = useSelector(obtenerProductoEnProgresoSelector);
  const error = useSelector(errorObtenerProductoSelector);

  const loadData = React.useCallback(async () => {
    if (productId) {
      await dispatch(AccionesProduct.obtenerProductoPorId(Number(productId)));
    }
  }, [productId, dispatch]);

  React.useEffect(() => {
    loadData();

    // Cleanup: limpiar el producto actual cuando se desmonte el componente
    return () => {
      dispatch(AccionesProduct.limpiarProductoActual());
    };
  }, [loadData, dispatch]);

  const handleProductEdit = React.useCallback(() => {
    navigate(`/products/${productId}/edit`);
  }, [navigate, productId]);

  const handleManageImages = React.useCallback(() => {
    navigate(`/products/${productId}/images`);
  }, [navigate, productId]);

  const handleProductDelete = React.useCallback(async () => {
    if (!product) {
      return;
    }

    const confirmed = await dialogs.confirm(
      `¿Deseas eliminar "${product.title}"?`,
      {
        title: `¿Eliminar producto?`,
        severity: 'error',
        okText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    );

    if (confirmed) {
      try {
        await dispatch(AccionesProduct.borrarProducto(Number(productId)));

        navigate('/products');

        notifications.show('Producto eliminado exitosamente.', {
          severity: 'success',
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          extractErrorMessage(deleteError),
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    }
  }, [product, dialogs, productId, navigate, notifications, dispatch]);

  const handleBack = React.useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const renderShow = React.useMemo(() => {
    if (isLoading) {
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
        <Grid container spacing={3} sx={{ width: '100%' }}>
          {/* Información básica */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Título</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {product.title}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Estado</Typography>
              <Box sx={{ mb: 1 }}>
                <Chip
                  label={product.status === 'published' ? 'Publicado' : 'Borrador'}
                  color={product.status === 'published' ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </Paper>
          </Grid>

          <Grid size={12}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Slug</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {product.slug}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={12}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Descripción</Typography>
              <Box 
                className="quill-content"
                dangerouslySetInnerHTML={{ __html: product.description || '' }}
                sx={{ mb: 1, '& img': { maxWidth: '100%', height: 'auto' } }}
              />
            </Paper>
          </Grid>

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <Grid size={12}>
              <Paper sx={{ px: 2, py: 1 }}>
                <Typography variant="overline">Ficha Técnica</Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={key}>
                      <Box sx={{ display: 'flex', borderBottom: '1px solid #eee', py: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ width: '40%', fontWeight: 'bold' }}>{key}</Typography>
                        <Typography variant="body2" sx={{ width: '60%' }}>{String(value)}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Precio</Typography>
              <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                ${product.price}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Stock</Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {product.stock}
              </Typography>
            </Paper>
          </Grid>

          {/* Atributos */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Atributos
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Variantes</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                {!product.variants || product.variants.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Sin variantes
                  </Typography>
                ) : (
                  product.variants.map((v: any) => (
                    <Box key={v.id} sx={{ p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>SKU: {v.sku} - Stock: {v.stock}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {v.options?.map((opt: any) => (
                          <Chip 
                            key={opt.id} 
                            label={opt.value} 
                            size="small" 
                            variant="outlined" 
                            icon={opt.metaValue ? <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: opt.metaValue, ml: 1, border: '1px solid #ddd' }} /> : undefined}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Categorías</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {product.tags.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Sin categorías
                  </Typography>
                ) : (
                  product.tags.map((tag: any) => (
                    <Chip key={tag.id} label={tag.name} size="small" color="secondary" variant="outlined" />
                  ))
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Imágenes */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Imágenes ({product.images.length})
            </Typography>
          </Grid>

          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              {product.images.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay imágenes para este producto
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleManageImages}
                    sx={{ mt: 2 }}
                    startIcon={<ImageIcon />}
                  >
                    Agregar Imágenes
                  </Button>
                </Box>
              ) : (
                <>
                  <ImageList cols={4} gap={8}>
                    {product.images.map((image: any, index: number) => (
                      <ImageListItem key={image.id || index}>
                        <img
                          src={image.url}
                          alt={`${product.title} ${index + 1}`}
                          loading="lazy"
                          style={{ borderRadius: 8 }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={handleManageImages}
                      startIcon={<ImageIcon />}
                    >
                      Gestionar Imágenes
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Atrás
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleProductEdit}
            >
              Editar
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleProductDelete}
            >
              Eliminar
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }, [
    isLoading,
    error,
    product,
    handleBack,
    handleProductEdit,
    handleManageImages,
    handleProductDelete,
  ]);

  const pageTitle = `Producto ${productId}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Productos', path: '/products' },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>
    </PageContainer>
  );
}