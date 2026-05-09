import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { extractErrorMessage } from '../utils/errorUtils';
import { AccionesProduct } from '../store/actions/product';
import {
  productoActualSelector,
  obtenerProductoEnProgresoSelector,
  errorObtenerProductoSelector,
} from '../store/selectors/product';
import ProductForm, {
  type FormFieldValue,
  type ProductFormState,
} from './ProductForm';
import PageContainer from './PageContainer';
import type { UpdateProductRequest } from '../models/Product';
import httpClient from '../services/httpClient';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Validación simple
const validateProduct = (values: Partial<UpdateProductRequest>) => {
  const errors: Partial<Record<keyof UpdateProductRequest, string>> = {};

  if (values.title !== undefined && values.title.trim() === '') {
    errors.title = 'El título no puede estar vacío';
  }

  if (values.slug !== undefined && values.slug.trim() === '') {
    errors.slug = 'El slug no puede estar vacío';
  }

  if (values.price !== undefined && values.price <= 0) {
    errors.price = 'El precio debe ser mayor a 0';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

function ProductEditForm({
  initialValues,
  onSubmit,
  variantTypes,
  tags,
  productImages,
}: {
  initialValues: Partial<ProductFormState['values']>;
  onSubmit: (formValues: Partial<ProductFormState['values']>) => Promise<void>;
  variantTypes: any[];
  tags: any[];
  productImages: any[];
}) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<ProductFormState>(() => ({
    values: initialValues,
    errors: {},
  }));

  const handleFormFieldChange = React.useCallback(
    (name: keyof ProductFormState['values'], value: FormFieldValue) => {
      setFormState((prevState) => {
        let newValues: Partial<ProductFormState['values']>;
        if (name === 'title' && value) {
          newValues = { 
            ...prevState.values, 
            title: value as string,
            slug: generateSlug(value as string)
          };
        } else {
          newValues = { ...prevState.values, [name]: value };
        }

        const { errors } = validateProduct(newValues as UpdateProductRequest);
        const newErrors = {
          ...prevState.errors,
          [name]: errors[name as keyof UpdateProductRequest],
        };

        return {
          values: newValues,
          errors: newErrors,
        };
      });
    },
    [],
  );

  const handleFormSubmit = React.useCallback(async () => {
    const { errors, isValid } = validateProduct(formState.values as UpdateProductRequest);
    
    if (!isValid) {
      setFormState((prev) => ({
        ...prev,
        errors,
      }));
      return;
    }
    
    setFormState((prev) => ({
      ...prev,
      errors: {},
    }));

    try {
      await onSubmit(formState.values);
      notifications.show('Producto actualizado exitosamente.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/products');
    } catch (editError) {
      notifications.show(
        extractErrorMessage(editError),
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
    }
  }, [formState.values, navigate, notifications, onSubmit]);

  return (
    <ProductForm
      formState={formState}
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      submitButtonLabel="Guardar"
      backButtonPath={`/products/${productId}`}
      variantTypes={variantTypes}
      tags={tags}
      productImages={productImages}
    />
  );
}

export default function ProductEdit() {
  const { productId } = useParams();
  const dispatch = useDispatch<any>();
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

  const product = useSelector(productoActualSelector);
  const isLoading = useSelector(obtenerProductoEnProgresoSelector);
  const error = useSelector(errorObtenerProductoSelector);

  // Cargar datos necesarios para el formulario
  const [variantTypes, setVariantTypes] = React.useState([]);
  const [tags, setTags] = React.useState([]);

  React.useEffect(() => {
    // Cargar variantTypes y tags desde el backend
    const loadFormData = async () => {
      try {
        const variantsData = await httpClient.get('/admin/variants/types');
        setVariantTypes(variantsData.data);
        const tagsData = await httpClient.get('/admin/tags');
        setTags(tagsData.data);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    loadFormData();
  }, []);

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

  const handleSubmit = React.useCallback(
    async (formValues: Partial<ProductFormState['values']>) => {
      if (productId) {
        await dispatch(
          AccionesProduct.actualizarProducto(Number(productId), formValues as UpdateProductRequest)
        );
      }
    },
    [productId, dispatch],
  );

  const renderEdit = React.useMemo(() => {
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

    // Convertir el producto a formato del formulario
    const INITIAL_FORM_VALUES: Partial<ProductFormState['values']> = {
      title: product.title,
      price: Number(product.price),
      description: product.description,
      slug: product.slug,
      status: product.status,
      stock: product.stock ?? 0,
      tagIds: product.tags.map((t: any) => t.id),
      attributes: product.attributes || {},
      variants: product.variants ? product.variants.map((v: any) => ({
        id: v.id,
        optionIds: v.options ? v.options.map((o: any) => o.id) : [],
        stock: v.stock,
        sku: v.sku,
        imageUrl: v.imageUrl
      })) : [],
    };

    return (
      <ProductEditForm
        initialValues={INITIAL_FORM_VALUES}
        onSubmit={handleSubmit}
        variantTypes={variantTypes}
        tags={tags}
        productImages={product.images || []}
      />
    );
  }, [isLoading, error, product, handleSubmit, variantTypes, tags]);

  return (
    <ThemeProvider theme={localTheme}>
      <PageContainer
        title={`Editar Producto ${productId}`}
        breadcrumbs={[
          { title: 'Productos', path: '/products' },
          { title: `Producto ${productId}`, path: `/products/${productId}` },
          { title: 'Editar' },
        ]}
      >
        <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>
      </PageContainer>
    </ThemeProvider>
  );
}