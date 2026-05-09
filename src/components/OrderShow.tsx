import * as React from 'react';
import { Box, Button, CircularProgress, Divider, Grid, Paper, Stack, Typography, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { extractErrorMessage } from '../utils/errorUtils';
import { AccionesOrder } from '../store/actions/order';
import { orderActualSelector, obtenerOrderEnProgresoSelector, actualizarEstadoOrderEnProgresoSelector } from '../store/selectors/order';
import PageContainer from './PageContainer';

export default function OrderShow() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const notifications = useNotifications();

  const order = useSelector(orderActualSelector);
  const isLoading = useSelector(obtenerOrderEnProgresoSelector);
  const isUpdating = useSelector(actualizarEstadoOrderEnProgresoSelector);

  const [status, setStatus] = React.useState('');

  React.useEffect(() => {
    if (orderId) dispatch(AccionesOrder.obtenerOrderPorId(Number(orderId)));
    return () => { dispatch(AccionesOrder.limpiarOrderActual()); };
  }, [dispatch, orderId]);

  React.useEffect(() => { if (order) setStatus(order.status); }, [order]);

  const handleStatusChange = async () => {
    if (!orderId || !status || status === order?.status) return;
    try {
      await dispatch(AccionesOrder.actualizarEstadoOrder(Number(orderId), status));
      notifications.show('Estado de la orden actualizado exitosamente.', { severity: 'success' });
    } catch (err) {
      notifications.show(extractErrorMessage(err), { severity: 'error' });
    }
  };

  if (isLoading || !order) return <PageContainer title="Pedido"><Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box></PageContainer>;

  return (
    <PageContainer title={`Pedido #${order.id}`} breadcrumbs={[{ title: 'Pedidos', path: '/orders' }, { title: `Pedido #${order.id}` }]}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Productos</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {order.items.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  {item.product?.firstImage ? (
                    <Box component="img" src={item.product.firstImage} alt={item.product.title} sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                  ) : <Box sx={{ width: 60, height: 60, bgcolor: 'grey.200', borderRadius: 1 }} />}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{item.product?.title || 'Producto'}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.variantDetails}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">Cant: {item.quantity}</Typography>
                    <Typography variant="subtitle2" color="primary.main">${item.price}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">${order.amount}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Cliente</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2">{order.customer?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{order.customer?.email}</Typography>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Estado</Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Estado</InputLabel>
              <Select value={status} label="Estado" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="PENDING" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimerIcon fontSize="small" sx={{ color: '#af5f00' }} /> PENDIENTES
                </MenuItem>
                <MenuItem value="PROCESSING" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon fontSize="small" sx={{ color: '#9b30a0' }} /> PROCESANDO
                </MenuItem>
                <MenuItem value="SHIPPED" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingIcon fontSize="small" sx={{ color: '#0070f3' }} /> ENVIADO
                </MenuItem>
                <MenuItem value="DELIVERED" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon fontSize="small" sx={{ color: '#008a00' }} /> ENTREGADO
                </MenuItem>
                <MenuItem value="CANCELLED" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelIcon fontSize="small" sx={{ color: '#d32f2f' }} /> CANCELADO
                </MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" fullWidth onClick={handleStatusChange} disabled={isUpdating || status === order.status}>
              Actualizar
            </Button>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}><Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')}>Volver</Button></Box>
    </PageContainer>
  );
}



