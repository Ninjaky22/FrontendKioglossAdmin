import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { extractErrorMessage } from '../utils/errorUtils';
import { AccionesVideo } from '../store/actions/video';
import {
  videoActualSelector,
  obtenerVideoEnProgresoSelector,
  productosParaVideosSelector,
} from '../store/selectors/video';
import VideoForm, { type FormFieldValue, type VideoFormState } from './VideoForm';
import PageContainer from './PageContainer';
import type { UpdateVideoRequest } from '../models/VideoReel';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme, useTheme, alpha } from '@mui/material/styles';

const isInstagramUrl = (url: string) =>
  /instagram\.com\/(reel|p|tv)\/[a-zA-Z0-9_-]+/.test(url.trim());

const validateVideo = (values: Partial<UpdateVideoRequest & { productId: number }>) => {
  const errors: Partial<Record<string, string>> = {};
  if (!values.thumbnailUrl || values.thumbnailUrl.trim() === '') {
    errors.thumbnailUrl = 'La URL de la miniatura es requerida';
  }
  if (!values.videoUrl || (values.videoUrl as string).trim() === '') {
    errors.videoUrl = 'La URL del video es requerida';
  } else if (!isInstagramUrl(values.videoUrl as string)) {
    errors.videoUrl = 'Solo se aceptan enlaces de Instagram (reel, post o IGTV)';
  }
  if (!values.username || (values.username as string).trim() === '') {
    errors.username = 'El nombre de usuario es requerido';
  }
  if (!values.productId) {
    errors.productId = 'Debes seleccionar un producto';
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
};

export default function VideoEdit() {
  const { videoId } = useParams();
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

  const video = useSelector(videoActualSelector);
  const isLoadingVideo = useSelector(obtenerVideoEnProgresoSelector);
  const products = useSelector(productosParaVideosSelector) || [];

  React.useEffect(() => {
    if (videoId) {
      dispatch(AccionesVideo.obtenerVideoPorId(Number(videoId)));
    }
    dispatch(AccionesVideo.obtenerProductosParaVideos());
    return () => {
      dispatch(AccionesVideo.limpiarVideoActual());
    };
  }, [dispatch, videoId]);

  const [formState, setFormState] = React.useState<VideoFormState>({
    values: {},
    errors: {},
  });

  React.useEffect(() => {
    if (video) {
      setFormState({
        values: {
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          username: video.username,
          productId: video.productId,
        },
        errors: {},
      });
    }
  }, [video]);

  const handleFormFieldChange = React.useCallback(
    (name: keyof VideoFormState['values'], value: FormFieldValue) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { errors } = validateVideo(newValues);
        return {
          values: newValues,
          errors: { ...prev.errors, [name]: errors[name as keyof typeof errors] },
        };
      });
    },
    [],
  );

  const handleFormReset = React.useCallback(() => {
    navigate('/videos');
  }, [navigate]);

  const handleFormSubmit = React.useCallback(async () => {
    const { errors, isValid } = validateVideo(formState.values);
    if (!isValid) {
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    try {
      await dispatch(
        AccionesVideo.actualizarVideo(Number(videoId), formState.values as UpdateVideoRequest),
      );
      notifications.show('Video actualizado exitosamente.', {
        severity: 'success',
        autoHideDuration: 3000,
      });
      navigate('/videos');
    } catch (updateError) {
      notifications.show(
        extractErrorMessage(updateError),
        { severity: 'error', autoHideDuration: 3000 },
      );
    }
  }, [formState.values, videoId, navigate, notifications, dispatch]);

  if (isLoadingVideo || !video) {
    return (
      <ThemeProvider theme={localTheme}>
        <PageContainer
          title="Editar Video"
          breadcrumbs={[{ title: 'Videos', path: '/videos' }, { title: 'Editar' }]}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </PageContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={localTheme}>
      <PageContainer
        title="Editar Video"
        breadcrumbs={[{ title: 'Videos', path: '/videos' }, { title: 'Editar' }]}
      >
        <VideoForm
          formState={formState}
          onFieldChange={handleFormFieldChange}
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
          submitButtonLabel="Actualizar"
          products={products}
        />
      </PageContainer>
    </ThemeProvider>
  );
}
