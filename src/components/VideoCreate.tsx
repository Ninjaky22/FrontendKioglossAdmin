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
import { ThemeProvider, createTheme, useTheme, alpha } from '@mui/material/styles';

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
  const parentTheme = useTheme();

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
    <ThemeProvider theme={localTheme}>
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
    </ThemeProvider>
  );
}