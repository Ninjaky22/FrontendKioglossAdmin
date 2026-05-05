import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
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
  const [emailError, setEmailError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [alert, setAlert] = React.useState<
    { type: 'success' | 'error'; message: string } | null
  >(null);

  const validateEmail = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('El correo es obligatorio.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setEmailError('Ingresa un correo válido.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlert(null);

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPasswordService(email.trim());
      const message =
        response?.data?.message ||
        'Si el email existe, recibirás un enlace para restablecer tu contraseña';
      setAlert({ type: 'success', message });
      setEmail('');
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'No se pudo enviar el enlace. Intenta de nuevo.',
      });
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
      <Box sx={{ height: 6, backgroundColor: '#610361' }} />
      <DialogTitle sx={{ fontWeight: 800, color: '#610361' }}>
        Recuperar contraseña
      </DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecer
          tu contraseña.
        </DialogContentText>
        {alert && <Alert severity={alert.type}>{alert.message}</Alert>}
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
            error={Boolean(emailError)}
            helperText={emailError}
            disabled={isLoading}
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
    </Dialog>
  );
}
