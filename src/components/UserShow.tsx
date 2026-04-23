import * as React from 'react';
import { Box, Button, CircularProgress, Divider, Grid, Paper, Stack, Typography, Chip, Avatar, FormGroup, FormControlLabel, Switch } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { AccionesUser } from '../store/actions/user';
import { userActualSelector, obtenerUserEnProgresoSelector, actualizarUserEnProgresoSelector } from '../store/selectors/user';
import PageContainer from './PageContainer';

export default function UserShow() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const notifications = useNotifications();

  const user = useSelector(userActualSelector);
  const isLoading = useSelector(obtenerUserEnProgresoSelector);
  const isUpdating = useSelector(actualizarUserEnProgresoSelector);

  React.useEffect(() => {
    if (userId) dispatch(AccionesUser.obtenerUserPorId(Number(userId)));
    return () => { dispatch(AccionesUser.limpiarUserActual()); };
  }, [dispatch, userId]);

  const handleToggleStatus = async () => {
    if (!userId) return;
    try {
      await dispatch(AccionesUser.toggleUserStatus(Number(userId)));
      notifications.show('Estado del usuario actualizado', { severity: 'success' });
    } catch (err) {
      notifications.show('Error al actualizar estado', { severity: 'error' });
    }
  };

  const handleRoleChange = async (isStaff: boolean, isSuperuser: boolean) => {
    if (!userId) return;
    try {
      await dispatch(AccionesUser.updateRoles(Number(userId), { isStaff, isSuperuser }));
      notifications.show('Roles del usuario actualizados', { severity: 'success' });
    } catch (err) {
      notifications.show('Error al actualizar roles', { severity: 'error' });
    }
  };

  if (isLoading || !user) return <PageContainer title="Usuario"><Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box></PageContainer>;

  return (
    <PageContainer title={`Usuario: ${user.name}`} breadcrumbs={[{ title: 'Usuarios', path: '/users' }, { title: user.name }]}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
            <Avatar src={user.profileImage} sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }} />
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>{user.email}</Typography>
            {user.phoneNumber && <Typography variant="body2">{user.phoneNumber}</Typography>}
            <Box sx={{ mt: 2 }}>
              <Chip label={user.isActive ? 'Activo' : 'Inactivo'} color={user.isActive ? 'success' : 'error'} sx={{ mr: 1 }} />
              <Chip label={user.isSuperuser ? 'Admin' : user.isStaff ? 'Staff' : 'Cliente'} color="primary" />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Configuración</Typography>
            <Divider sx={{ mb: 2 }} />
            <FormGroup>
              <FormControlLabel 
                control={<Switch checked={user.isActive} onChange={handleToggleStatus} disabled={isUpdating} />} 
                label="Cuenta Activa" 
              />
              <FormControlLabel 
                control={<Switch checked={user.isStaff} onChange={(e) => handleRoleChange(e.target.checked, user.isSuperuser)} disabled={isUpdating} />} 
                label="Es Staff (Vendedor)" 
              />
              <FormControlLabel 
                control={<Switch checked={user.isSuperuser} onChange={(e) => handleRoleChange(user.isStaff, e.target.checked)} disabled={isUpdating} />} 
                label="Es Administrador" 
              />
            </FormGroup>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Métricas de la Cuenta</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} textAlign="center">
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="h4" color="primary">{user.totalOrders}</Typography>
                <Typography variant="body2" color="text.secondary">Pedidos</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="h4" color="secondary">{user.totalFavorites}</Typography>
                <Typography variant="body2" color="text.secondary">Favoritos</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="h4" color="success.main">{user.account?.pointsPerPurchase || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Puntos</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Últimos Pedidos</Typography>
            <Divider sx={{ mb: 2 }} />
            {user.recentOrders && user.recentOrders.length > 0 ? (
              <Stack spacing={2}>
                {user.recentOrders.map((order: any) => (
                  <Box key={order.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid #eee', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="subtitle2">Pedido #{order.id}</Typography>
                      <Typography variant="body2" color="text.secondary">{order.date}</Typography>
                    </Box>
                    <Chip label={order.status} size="small" />
                    <Typography variant="subtitle2" color="primary">${order.amount}</Typography>
                    <Button size="small" onClick={() => navigate(`/orders/${order.id}`)}>Ver</Button>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No hay pedidos recientes.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}><Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>Volver</Button></Box>
    </PageContainer>
  );
}
