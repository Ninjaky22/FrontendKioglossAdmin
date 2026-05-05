import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
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
import PersonAdd from '@mui/icons-material/PersonAdd';
import { styled } from '@mui/material/styles';
import ColorModeSelect from '../theme/ColorModeSelect';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { signUpUser } from '../store/actions/signUp';
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
  maxWidth: 660,
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

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(2),
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
}));

export default function SignUp() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  // Selectores de Redux
  const isLoading = useSelector(sessionAuthenticationInProgressSelector);
  const error = useSelector(sessionAuthenticationErrorSelector);
  const isAuthenticated = useSelector(sessionAuthenticatedSelector);

  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [nameError, setNameError] = React.useState(false);
  const [phoneError, setPhoneError] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    if (error) {
      setToastMessage(error.message || 'Error al registrar usuario');
      setToastOpen(true);
    }
  }, [error]);

  const handleToastClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setToastOpen(false);
  };

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const name = document.getElementById('name') as HTMLInputElement;
    const phone = document.getElementById('phone') as HTMLInputElement;

    let isValid = true;
    let firstErrorMessage = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
    const phoneRegex = /^\d{10}$/;

    const nameValue = name.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phone.value.trim();
    const passwordValue = password.value;

    if (!nameValue || nameValue.length < 3) {
      setNameError(true);
      if (!firstErrorMessage) firstErrorMessage = 'El nombre debe tener al menos 3 caracteres.';
      isValid = false;
    } else {
      setNameError(false);
    }

    if (!emailValue || !emailRegex.test(emailValue)) {
      setEmailError(true);
      if (!firstErrorMessage) firstErrorMessage = 'Ingresa un correo válido.';
      isValid = false;
    } else {
      setEmailError(false);
    }

    if (!phoneValue || !phoneRegex.test(phoneValue)) {
      setPhoneError(true);
      if (!firstErrorMessage) firstErrorMessage = 'El teléfono debe tener 10 dígitos.';
      isValid = false;
    } else {
      setPhoneError(false);
    }

    const passwordLengthValid = passwordValue.length >= 8 && passwordValue.length <= 20;
    const passwordFormatValid = passwordRegex.test(passwordValue);
    if (!passwordLengthValid || !passwordFormatValid) {
      setPasswordError(true);
      if (!firstErrorMessage)
        firstErrorMessage = 'La contraseña debe tener mayúscula, número y carácter especial.';
      isValid = false;
    } else {
      setPasswordError(false);
    }

    if (!isValid && firstErrorMessage) {
      setToastMessage(firstErrorMessage);
      setToastOpen(true);
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) return;

    const data = new FormData(event.currentTarget);
    const userData = {
      email: data.get('email') as string,
      name: data.get('name') as string,
      password: data.get('password') as string,
      phoneNumber: data.get('phone') as string,
      profileImage: '',
      isSuperuser: true,
      account: { pointsPerPurchase: 0, isActive: true },
      address: {
        street: (data.get('street') as string) || '',
        streetNumber: (data.get('streetNumber') as string) || '',
        distric: (data.get('district') as string) || '',
      },
    };

    dispatch(signUpUser(userData));
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column">
        <ColorModeSelect
          sx={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: (theme) => theme.zIndex.modal + 1,
          }}
        />
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
                <PersonAdd sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography
                component="h1"
                variant="h5"
                sx={{ fontWeight: 800, color: '#610361', lineHeight: 1.2 }}
              >
                Regístrate
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Completa tus datos para empezar.
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                // ✅ Gap reducido de 2→1.5 para ahorrar espacio vertical
                gap: 1.5,
              }}
            >
              {/* Fila 1: Nombre + Email */}
              <FormControl>
                <FormLabel htmlFor="name" sx={{ fontSize: '0.78rem', mb: 0.3 }}>
                  Nombre completo
                </FormLabel>
                <TextField
                  autoComplete="name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  placeholder="Tu nombre"
                  error={nameError}
                  color={nameError ? 'error' : 'primary'}
                  disabled={isLoading}
                  size="small"
                  inputProps={{ maxLength: 50 }}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="email" sx={{ fontSize: '0.78rem', mb: 0.3 }}>
                  Email
                </FormLabel>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder="tucorreo@dominio.com"
                  name="email"
                  autoComplete="email"
                  variant="outlined"
                  error={emailError}
                  color={emailError ? 'error' : 'primary'}
                  disabled={isLoading}
                  size="small"
                  inputProps={{ maxLength: 200 }}
                />
              </FormControl>

              {/* Fila 2: Teléfono + Contraseña */}
              <FormControl>
                <FormLabel htmlFor="phone" sx={{ fontSize: '0.78rem', mb: 0.3 }}>
                  Teléfono
                </FormLabel>
                <TextField
                  required
                  fullWidth
                  id="phone"
                  placeholder="3001234567"
                  name="phone"
                  autoComplete="tel"
                  variant="outlined"
                  error={phoneError}
                  color={phoneError ? 'error' : 'primary'}
                  disabled={isLoading}
                  size="small"
                  inputProps={{
                    inputMode: 'numeric',
                    maxLength: 10,
                    pattern: '[0-9]*',
                    onInput: (event) => {
                      const target = event.currentTarget as HTMLInputElement;
                      target.value = target.value.replace(/\D/g, '').slice(0, 10);
                    },
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="password" sx={{ fontSize: '0.78rem', mb: 0.3 }}>
                  Contraseña
                </FormLabel>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  variant="outlined"
                  error={passwordError}
                  color={passwordError ? 'error' : 'primary'}
                  disabled={isLoading}
                  size="small"
                  inputProps={{ minLength: 8, maxLength: 20 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          disableRipple
                          sx={{
                            p: 0,
                            '&:hover': { backgroundColor: 'transparent' },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormHelperText sx={{ color: 'text.secondary', fontSize: '0.68rem', mt: 0.3 }}>
                  Mínimo una mayúscula, un número y un carácter especial.
                </FormHelperText>
              </FormControl>
            
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 0.5,
                  mb: 0,
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '18px',                
                  color: '#610361',
                  gridColumn: '1 / -1',
                }}
              >
                Dirección (opcional)
              </Typography>

              <Box
                sx={{
                  gridColumn: '1 / -1',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                  gap: 1.5,
                }}
              >
                <FormControl>
                  <FormLabel htmlFor="street" sx={{ fontSize: '0.78rem', mb: 0.3 }}>
                    Calle
                  </FormLabel>
                  <TextField
                    fullWidth
                    id="street"
                    name="street"
                    placeholder="Calle 10"
                    variant="outlined"
                    disabled={isLoading}
                    size="small"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="streetNumber" sx={{ fontSize: '0.78rem', mb: 0.3 }}>
                    Número
                  </FormLabel>
                  <TextField
                    fullWidth
                    id="streetNumber"
                    name="streetNumber"
                    placeholder="15-20"
                    variant="outlined"
                    disabled={isLoading}
                    size="small"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="district" sx={{ fontSize: '0.78rem', mb: 0.3 }}>
                    Barrio
                  </FormLabel>
                  <TextField
                    fullWidth
                    id="district"
                    name="district"
                    placeholder="Centro"
                    variant="outlined"
                    disabled={isLoading}
                    size="small"
                  />
                </FormControl>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{
                  gridColumn: '1 / -1',
                  backgroundColor: '#610361',
                  '&:hover': { backgroundColor: '#4a024a' },
                  fontWeight: 700,
                  letterSpacing: 1,
                  py: 1,
                }}
              >
                {isLoading ? 'Registrando...' : 'Registrarme'}
              </Button>
            </Box>

            <Divider sx={{ my: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                o
              </Typography>
            </Divider>

            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              ¿Ya tienes cuenta?{' '}
              <Link component={RouterLink} to="/log-in" variant="body2" sx={{ fontWeight: 600 }}>
                Iniciar sesión
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleToastClose} severity="error" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}