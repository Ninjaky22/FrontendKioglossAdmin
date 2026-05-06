import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import LockReset from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router';
import ColorModeSelect from '../theme/ColorModeSelect';
import { resetPasswordService } from '../services/authService';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  maxWidth: 420,
  margin: 'auto',
  padding: 0,
  overflow: 'hidden',
  borderRadius: 24,
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.7)',
  boxShadow: '0 28px 70px rgba(97, 3, 97, 0.22)',
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(30, 15, 36, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 28px 70px rgba(0, 0, 0, 0.35)',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
}));

const passwordRules = {
  minLength: (v: string) => v.length >= 8,
  maxLength: (v: string) => v.length <= 20,
  hasUppercase: (v: string) => /[A-Z]/.test(v),
  hasNumber: (v: string) => /[0-9]/.test(v),
  hasSpecialChar: (v: string) => /[!@#$%^&*(),.?":{}|<>+-]/.test(v),
};

const getErrorDetails = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { status?: number; data?: { message?: string } } })
      .response;
    const message =
      response?.data?.message || (error as { message?: string }).message || '';
    return { status: response?.status, message };
  }
  return { status: undefined, message: '' };
};

export default function ResetPasswordPage(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastSeverity, setToastSeverity] = React.useState<'success' | 'warning' | 'error'>('error');

  const toastDuration = toastSeverity === 'success' ? 3000 : 4000;
  const toastBackground =
    toastSeverity === 'success'
      ? '#2e7d32'
      : toastSeverity === 'warning'
      ? '#ed6c02'
      : '#d32f2f';

  const showToast = React.useCallback(
    (message: string, severity: 'success' | 'warning' | 'error') => {
      setToastMessage(message);
      setToastSeverity(severity);
      setToastOpen(true);
    },
    []
  );

  React.useEffect(() => {
    if (!token) {
      navigate('/sign-in', { replace: true });
    }
  }, [token, navigate]);

  const ruleStatus = {
    minLength: passwordRules.minLength(newPassword),
    maxLength: passwordRules.maxLength(newPassword),
    hasUppercase: passwordRules.hasUppercase(newPassword),
    hasNumber: passwordRules.hasNumber(newPassword),
    hasSpecialChar: passwordRules.hasSpecialChar(newPassword),
  };

  const isPasswordValid = Object.values(ruleStatus).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const canSubmit = isPasswordValid && passwordsMatch && !isLoading;

  const handleToastClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordsMatch) {
      showToast(
        'Las contraseñas no coinciden. Verifica e intenta de nuevo.',
        'error'
      );
      return;
    }

    if (!isPasswordValid) {
      showToast(
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.',
        'error'
      );
      return;
    }

    if (!token) {
      navigate('/sign-in', { replace: true });
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordService(token, newPassword);
      showToast('¡Contraseña actualizada! Ya puedes iniciar sesión.', 'success');
      window.setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (error) {
      const { status, message } = getErrorDetails(error);
      const normalizedMessage = message.toLowerCase();
      const isTokenIssue =
        status === 400 ||
        status === 401 ||
        status === 403 ||
        status === 404 ||
        normalizedMessage.includes('token') ||
        normalizedMessage.includes('expir') ||
        normalizedMessage.includes('invalid');

      if (isTokenIssue) {
        showToast('El enlace de recuperación ha expirado. Solicita uno nuevo.', 'warning');
      } else {
        showToast('Ocurrió un error inesperado. Intenta de nuevo.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <Box sx={{ height: 6, backgroundColor: '#610361' }} />
          <Box sx={{ px: 4, py: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  backgroundColor: '#610361',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  boxShadow: '0 10px 22px rgba(97, 3, 97, 0.35)',
                }}
              >
                <LockReset sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Typography
                component="h1"
                variant="h5"
                sx={{ fontWeight: 800, color: '#610361' }}
              >
                Nueva contraseña
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Actualiza tu acceso de forma segura.
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: 1.5,
              }}
            >
            <FormControl>
              <FormLabel htmlFor="new-password">Nueva contraseña</FormLabel>
              <TextField
                id="new-password"
                name="new-password"
                placeholder="••••••"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                size="small"
                disabled={isLoading}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        type="button"
                        aria-label={
                          showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                        }
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="confirm-password">Confirmar contraseña</FormLabel>
              <TextField
                id="confirm-password"
                name="confirm-password"
                placeholder="••••••"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                size="small"
                disabled={isLoading}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? 'Ocultar contraseña'
                            : 'Mostrar contraseña'
                        }
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>
                Requisitos (en tiempo real):
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.minLength ? (
                  <CheckCircleOutline color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelOutlined color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: ruleStatus.minLength ? 'success.main' : 'error.main',
                    fontSize: '0.72rem',
                  }}
                >
                  Mínimo 8 caracteres
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.maxLength ? (
                  <CheckCircleOutline color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelOutlined color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: ruleStatus.maxLength ? 'success.main' : 'error.main',
                    fontSize: '0.72rem',
                  }}
                >
                  Máximo 20 caracteres
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.hasUppercase ? (
                  <CheckCircleOutline color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelOutlined color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: ruleStatus.hasUppercase ? 'success.main' : 'error.main',
                    fontSize: '0.72rem',
                  }}
                >
                  Al menos una mayúscula
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.hasNumber ? (
                  <CheckCircleOutline color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelOutlined color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: ruleStatus.hasNumber ? 'success.main' : 'error.main',
                    fontSize: '0.72rem',
                  }}
                >
                  Al menos un número
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.hasSpecialChar ? (
                  <CheckCircleOutline color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelOutlined color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: ruleStatus.hasSpecialChar ? 'success.main' : 'error.main',
                    fontSize: '0.72rem',
                  }}
                >
                  Al menos un carácter especial
                </Typography>
              </Box>
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!canSubmit}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </Button>

            <Link
              component={RouterLink}
              to="/sign-in"
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              ← Volver al inicio de sesión
            </Link>
          </Box>
          </Box>
        </Card>
      </SignInContainer>
      <Snackbar
        open={toastOpen}
        autoHideDuration={toastDuration}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastSeverity}
          variant="filled"
          sx={{ width: '100%', backgroundColor: toastBackground }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
