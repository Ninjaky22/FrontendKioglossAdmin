import * as React from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { extractErrorMessage } from '../utils/errorUtils';
import { AccionesProduct } from '../store/actions/product';
import ProductForm, {
  type FormFieldValue,
  type ProductFormState,
} from './ProductForm';
import PageContainer from './PageContainer';
import type { CreateProductRequest } from '../models/Product';
import { AccionesTag } from '../store/actions/tag';
import { AccionesVariant } from '../store/actions/variant';
import { listaTagsSelector } from '../store/selectors/tag';
import { listaVariantesSelector } from '../store/selectors/variant';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const INITIAL_FORM_VALUES: Partial<ProductFormState['values']> = {
  status: 'draft',
  stock: 0,
  tagIds: [],
  attributes: {},
  variants: []
};

// Validación simple
const validateProduct = (values: Partial<CreateProductRequest>) => {
  const errors: Partial<Record<keyof CreateProductRequest, string>> = {};

  if (!values.title || values.title.trim() === '') {
    errors.title = 'El título es requerido';
  }

  if (!values.slug || values.slug.trim() === '') {
    errors.slug = 'El slug es requerido';
  }

  if (!values.description || values.description.trim() === '') {
    errors.description = 'La descripción es requerida';
  }

  if (!values.price || values.price <= 0) {
    errors.price = 'El precio debe ser mayor a 0';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export default function ProductCreate() {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const notifications = useNotifications();

  // Cargar datos necesarios para el formulario
  const tags = useSelector(listaTagsSelector) || [];
  const variantTypes = useSelector(listaVariantesSelector) || [];

React.useEffect(() => {
    // Cargar tags y variantTypes al montar el componente
    dispatch(AccionesTag.obtenerTags());
    dispatch(AccionesVariant.obtenerVariantes());
  }, [dispatch]);

  const [formState, setFormState] = React.useState<ProductFormState>(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));

  const handleFormFieldChange = React.useCallback(
    (name: keyof ProductFormState['values'], value: FormFieldValue) => {
      setFormState((prevState) => {
        // Si el campo es 'title', también actualizar el slug automáticamente
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

        // Validar los nuevos valores
        const { errors } = validateProduct(newValues as CreateProductRequest);
        const newErrors = {
          ...prevState.errors,
          [name]: errors[name as keyof CreateProductRequest],
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
    const { errors, isValid } = validateProduct(formState.values as CreateProductRequest);
    
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
      await dispatch(AccionesProduct.crearProducto(formState.values as CreateProductRequest));
      
      notifications.show('Producto creado exitosamente.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/products');
    } catch (createError) {
      notifications.show(
        extractErrorMessage(createError),
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
    }
  }, [formState.values, navigate, notifications, dispatch]);

  return (
    <PageContainer
      title="Nuevo Producto"
      breadcrumbs={[{ title: 'Productos', path: '/products' }, { title: 'Nuevo' }]}
    >
      <ProductForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        submitButtonLabel="Crear"
        variantTypes={variantTypes}
        tags={tags}
      />
    </PageContainer>
  );
}