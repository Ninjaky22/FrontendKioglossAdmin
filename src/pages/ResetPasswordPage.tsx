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

const getResetErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    const message = response?.data?.message;
    if (message) {
      return message;
    }
  }
  return 'No se pudo restablecer la contraseña. Intenta de nuevo.';
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
  const [alert, setAlert] = React.useState<
    { type: 'success' | 'error'; message: string } | null
  >(null);

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
  const showMismatchAlert =
    !alert && confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlert(null);

    if (!passwordsMatch) {
      setAlert({ type: 'error', message: 'Las contraseñas no coinciden' });
      return;
    }

    if (!isPasswordValid) {
      setAlert({
        type: 'error',
        message: 'La contraseña no cumple los requisitos.',
      });
      return;
    }

    if (!token) {
      navigate('/sign-in', { replace: true });
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordService(token, newPassword);
      setAlert({
        type: 'success',
        message: '¡Contraseña actualizada! Redirigiendo al login...',
      });
      window.setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (error) {
      setAlert({ type: 'error', message: getResetErrorMessage(error) });
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
          <Box sx={{ px: 4, py: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  backgroundColor: '#610361',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 10px 22px rgba(97, 3, 97, 0.35)',
                }}
              >
                <LockReset sx={{ color: '#fff' }} />
              </Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{ fontWeight: 800, color: '#610361' }}
              >
                Nueva contraseña
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Actualiza tu acceso de forma segura.
              </Typography>
            </Box>

            {alert ? (
              <Alert severity={alert.type} sx={{ mb: 2 }}>
                {alert.message}
              </Alert>
            ) : showMismatchAlert ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Las contraseñas no coinciden
              </Alert>
            ) : null}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: 2,
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
              <Typography variant="caption">Requisitos (en tiempo real):</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.minLength ? (
                  <CheckCircleOutline color="success" fontSize="small" />
                ) : (
                  <CancelOutlined color="error" fontSize="small" />
                )}
                <Typography
                  variant="caption"
                  sx={{ color: ruleStatus.minLength ? 'success.main' : 'error.main' }}
                >
                  Mínimo 8 caracteres
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.maxLength ? (
                  <CheckCircleOutline color="success" fontSize="small" />
                ) : (
                  <CancelOutlined color="error" fontSize="small" />
                )}
                <Typography
                  variant="caption"
                  sx={{ color: ruleStatus.maxLength ? 'success.main' : 'error.main' }}
                >
                  Máximo 20 caracteres
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.hasUppercase ? (
                  <CheckCircleOutline color="success" fontSize="small" />
                ) : (
                  <CancelOutlined color="error" fontSize="small" />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: ruleStatus.hasUppercase ? 'success.main' : 'error.main',
                  }}
                >
                  Al menos una mayúscula
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.hasNumber ? (
                  <CheckCircleOutline color="success" fontSize="small" />
                ) : (
                  <CancelOutlined color="error" fontSize="small" />
                )}
                <Typography
                  variant="caption"
                  sx={{ color: ruleStatus.hasNumber ? 'success.main' : 'error.main' }}
                >
                  Al menos un número
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ruleStatus.hasSpecialChar ? (
                  <CheckCircleOutline color="success" fontSize="small" />
                ) : (
                  <CancelOutlined color="error" fontSize="small" />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: ruleStatus.hasSpecialChar ? 'success.main' : 'error.main',
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
    </>
  );
}
