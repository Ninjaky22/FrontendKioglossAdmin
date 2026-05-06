import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Person from '@mui/icons-material/Person';
import { styled } from '@mui/material/styles';
import ForgotPassword from '../components/login/ForgotPassword';
import ColorModeSelect from '../theme/ColorModeSelect';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/actions/session';
import { 
    sessionAuthenticationInProgressSelector,
    sessionAuthenticationErrorSelector,
    sessionAuthenticatedSelector
} from '../store/selectors/session';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  maxWidth: 400,
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

export default function SignIn() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  // Selectores de Redux
  const isLoading = useSelector(sessionAuthenticationInProgressSelector);
  const error = useSelector(sessionAuthenticationErrorSelector);
  const isAuthenticated = useSelector(sessionAuthenticatedSelector);

  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
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

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      showToast('¡Bienvenido de vuelta!', 'success');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, showToast]);

  React.useEffect(() => {
    if (!error?.message) {
      return;
    }

    const normalizedMessage = error.message.toLowerCase();
    const isInvalidCredentials =
      normalizedMessage.includes('401') ||
      normalizedMessage.includes('403') ||
      normalizedMessage.includes('unauthorized') ||
      normalizedMessage.includes('forbidden') ||
      normalizedMessage.includes('invalid') ||
      normalizedMessage.includes('credentials') ||
      normalizedMessage.includes('credencial');

    if (isInvalidCredentials) {
      showToast('Credenciales incorrectas. Verifica tu correo y contraseña.', 'error');
      return;
    }

    showToast('Ocurrió un error inesperado. Intenta de nuevo.', 'error');
  }, [error, showToast]);

  const handleToastClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const userData = {
      email: data.get('email') as string,
      password: data.get('password') as string,
    };

    dispatch(loginUser(userData));
  };

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;
    let firstErrorMessage = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValue = email.value.trim();
    const passwordValue = password.value;

    if (!emailValue || !emailRegex.test(emailValue)) {
      setEmailError(true);
      if (!firstErrorMessage) {
        firstErrorMessage =
          'Ingresa un correo con formato válido (ejemplo@dominio.com)';
      }
      isValid = false;
    } else {
      setEmailError(false);
    }

    const passwordLengthValid = passwordValue.length >= 8;
    if (!passwordLengthValid) {
      setPasswordError(true);
      if (!firstErrorMessage) {
        firstErrorMessage = 'La contraseña debe tener al menos 8 caracteres.';
      }
      isValid = false;
    } else {
      setPasswordError(false);
    }

    if (!isValid && firstErrorMessage) {
      showToast(firstErrorMessage, 'error');
    }

    return isValid;
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
                <Person sx={{ color: '#fff' }} />
              </Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{ fontWeight: 800, color: '#610361' }}
              >
                Inicio Sesión
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
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
                <TextField
                  error={emailError}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="tucorreo@gmail.com"
                  autoComplete="email"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={emailError ? 'error' : 'primary'}
                  disabled={isLoading}
                  inputProps={{ maxLength: 200 }}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Contraseña</FormLabel>
                <TextField
                  error={passwordError}
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? 'error' : 'primary'}
                  disabled={isLoading}
                  inputProps={{ minLength: 8, maxLength: 20 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"                          
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          disableRipple
                          sx={{
                            p: 0,
                            '&:hover': { backgroundColor: 'transparent' },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <ForgotPassword open={open} handleClose={handleClose} />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </Button>
              <Link
                component="button"
                type="button"
                onClick={handleClickOpen}
                variant="body2"
                sx={{ alignSelf: 'center' }}
                disabled={isLoading}
              >
                ¿Olvidaste la contraseña?
              </Link>
            </Box>
            <Divider sx={{ my: 2 }}>O</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
                ¿No tienes cuenta?{' '}
                <Link
                  component={RouterLink}
                  to="/sign-up"
                  variant="body2"
                  sx={{ alignSelf: 'center' }}
                >
                  Regístrate
                </Link>
              </Typography>
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