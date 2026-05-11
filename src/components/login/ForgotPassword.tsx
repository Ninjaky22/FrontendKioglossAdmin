import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { forgotPasswordService } from '../../services/authService';

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
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

  const handleToastClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
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

  const validateEmail = () => {
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setEmailError(true);
      showToast('Ingresa un correo con formato válido.', 'error');
      return false;
    }

    setEmailError(false);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordService(email.trim());
      showToast('Te enviamos un correo con el enlace de recuperación.', 'success');
      setEmail('');
    } catch (error) {
      const { status, message } = getErrorDetails(error);
      const normalizedMessage = message.toLowerCase();
      const isEmailNotFound =
        status === 404 ||
        normalizedMessage.includes('no existe') ||
        normalizedMessage.includes('not found');

      if (isEmailNotFound) {
        showToast('No encontramos una cuenta con ese correo.', 'warning');
      } else {
        showToast('Ocurrió un error inesperado. Intenta de nuevo.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
          sx: {
            backgroundImage: 'none',
            borderRadius: 3,
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ height: 6, backgroundColor: 'primary.main' }} />
      <DialogTitle
        sx={{
          fontWeight: 800,
          color: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.palette.primary.light
              : theme.palette.primary.dark,
        }}
      >
        Recuperar contraseña
      </DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecer
          tu contraseña.
        </DialogContentText>
        <FormControl>
          <FormLabel htmlFor="email">Correo</FormLabel>
          <TextField
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            placeholder="ejemplo@gmail.com"
            type="email"
            autoComplete="email"
            fullWidth
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError}
            disabled={isLoading}
            inputProps={{ maxLength: 200 }}
          />
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Enviando...' : 'Enviar enlace'}
        </Button>
      </DialogActions>
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
    </Dialog>
  );
}
