import * as React from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { extractErrorMessage } from '../utils/errorUtils';
import { AccionesVideo } from '../store/actions/video';
import { productosParaVideosSelector } from '../store/selectors/video';
import VideoForm, { type FormFieldValue, type VideoFormState } from './VideoForm';
import PageContainer from './PageContainer';
import type { CreateVideoRequest } from '../models/VideoReel';

const INITIAL_FORM_VALUES: Partial<CreateVideoRequest> = {
  videoUrl: '',
  thumbnailUrl: '',
  username: '',
  productId: undefined,
};

const validateVideo = (values: Partial<CreateVideoRequest>) => {
  const errors: Partial<Record<keyof CreateVideoRequest, string>> = {};
  if (!values.thumbnailUrl || values.thumbnailUrl.trim() === '') {
    errors.thumbnailUrl = 'La URL de la miniatura es requerida';
  }
  if (!values.username || values.username.trim() === '') {
    errors.username = 'El nombre de usuario es requerido';
  }
  if (!values.productId) {
    errors.productId = 'Debes seleccionar un producto';
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
};

export default function VideoCreate() {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const notifications = useNotifications();

  const products = useSelector(productosParaVideosSelector) || [];

  React.useEffect(() => {
    dispatch(AccionesVideo.obtenerProductosParaVideos());
  }, [dispatch]);

  const [formState, setFormState] = React.useState<VideoFormState>(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));

  const handleFormFieldChange = React.useCallback(
    (name: keyof VideoFormState['values'], value: FormFieldValue) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { errors } = validateVideo(newValues as CreateVideoRequest);
        return {
          values: newValues,
          errors: { ...prev.errors, [name]: errors[name as keyof CreateVideoRequest] },
        };
      });
    },
    [],
  );

  const handleFormReset = React.useCallback(() => {
    navigate('/videos');
  }, [navigate]);

  const handleFormSubmit = React.useCallback(async () => {
    const { errors, isValid } = validateVideo(formState.values as CreateVideoRequest);
    if (!isValid) {
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    try {
      await dispatch(AccionesVideo.crearVideo(formState.values as CreateVideoRequest));
      notifications.show('Video creado exitosamente.', {
        severity: 'success',
        autoHideDuration: 3000,
      });
      navigate('/videos');
    } catch (createError) {
      notifications.show(
        extractErrorMessage(createError),
        { severity: 'error', autoHideDuration: 3000 },
      );
    }
  }, [formState.values, navigate, notifications, dispatch]);

  return (
    <PageContainer
      title="Nuevo Video"
      breadcrumbs={[{ title: 'Videos', path: '/videos' }, { title: 'Nuevo' }]}
    >
      <VideoForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Crear"
        products={products}
      />
    </PageContainer>
  );
}
