import * as React from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Divider, 
  Grid, // Usamos Grid2 para evitar alertas de depreciación
  Paper, 
  Stack, 
  Typography, 
  Chip, 
  Avatar, 
  FormGroup, 
  FormControlLabel, 
  Switch 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { alpha, useTheme } from '@mui/material/styles';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { AccionesUser } from '../store/actions/user';
import httpClient from '../services/httpClient';
import { ordersUrl } from '../constants/serviceUrl';
import { 
  userActualSelector, 
  obtenerUserEnProgresoSelector, 
  actualizarUserEnProgresoSelector 
} from '../store/selectors/user';
import PageContainer from './PageContainer';

export default function UserShow() {
  const { userId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const notifications = useNotifications();

  const user = useSelector(userActualSelector);
  const isLoading = useSelector(obtenerUserEnProgresoSelector);
  const isUpdating = useSelector(actualizarUserEnProgresoSelector);

  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [ordersByUser, setOrdersByUser] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    if (userId) dispatch(AccionesUser.obtenerUserPorId(Number(userId)));
    return () => { dispatch(AccionesUser.limpiarUserActual()); };
  }, [dispatch, userId]);

  React.useEffect(() => {
    if (!userId) return;
    let isActive = true;

    const loadOrdersByUser = async () => {
      setOrdersLoading(true);
      try {
        const params = new URLSearchParams({
          page: '0',
          page_size: '200',
        });
        const { data } = await httpClient.get(ordersUrl, { params });
        const payload = data && typeof data === 'object' && 'data' in data ? data.data : data;
        const list = Array.isArray(payload) ? payload : payload?.content ?? [];
        const userIdNumber = Number(userId);
        const filtered = list.filter((order: any) => (
          order?.customer?.userId === userIdNumber ||
          order?.user?.id === userIdNumber ||
          order?.userId === userIdNumber
        ));

        if (isActive) setOrdersByUser(filtered);
      } catch (err) {
        if (isActive) setOrdersByUser([]);
        notifications.show('Error al cargar pedidos del usuario', { severity: 'error' });
      } finally {
        if (isActive) setOrdersLoading(false);
      }
    };

    loadOrdersByUser();
    return () => { isActive = false; };
  }, [notifications, userId]);

  const handleToggleStatus = async () => {
    if (!userId) return;
    try {
      await dispatch(AccionesUser.toggleUserStatus(Number(userId)));
      notifications.show('Estado de la cuenta actualizado', { severity: 'success' });
    } catch (err) {
      notifications.show('Error al cambiar el estado', { severity: 'error' });
    }
  };

  const handleRoleChange = async (isAdmin: boolean) => {
    if (!userId) return;
    try {
      // Simplificamos: si es Admin, el sistema lo marca como Staff y Superuser internamente
      await dispatch(AccionesUser.updateRoles(Number(userId), { 
        isStaff: isAdmin, 
        isSuperuser: isAdmin 
      }));
      notifications.show('Privilegios actualizados', { severity: 'success' });
    } catch (err) {
      notifications.show('Error al actualizar privilegios', { severity: 'error' });
    }
  };

  const ordersSource = React.useMemo(() => {
    // Usar resultados de la API externa solo si encontró coincidencias reales
    if (Array.isArray(ordersByUser) && ordersByUser.length > 0) return ordersByUser;
    // Fallback: los recentOrders que devuelve el backend directamente en UserDetailDTO
    const anyUser = user as any;
    return anyUser?.recentOrders ?? [];
  }, [ordersByUser, user]);

  const favoritesSource = React.useMemo(() => {
    const anyUser = user as any;
    return (
      anyUser?.account?.favorite ??
      anyUser?.account?.favorites ??
      anyUser?.favorites ??
      anyUser?.favourites ??
      anyUser?.wishlist ??
      anyUser?.favoritos ??
      []
    );
  }, [user]);

  const totalOrders = React.useMemo(() => {
    // user.totalOrders viene del backend (campo raíz de UserDetailDTO)
    if (typeof user?.totalOrders === 'number') return user.totalOrders;
    return Array.isArray(ordersSource) ? ordersSource.length : 0;
  }, [user?.totalOrders, ordersSource]);

  const totalFavorites = React.useMemo(() => {
    if (typeof user?.totalFavorites === 'number' && user.totalFavorites > 0) return user.totalFavorites;
    return Array.isArray(favoritesSource) ? favoritesSource.length : 0;
  }, [user?.totalFavorites, favoritesSource]);

  // Obtenemos solo los 5 pedidos mas recientes
  const displayedOrders = React.useMemo(() => {
    const orders = Array.isArray(ordersSource) ? [...ordersSource] : [];
    orders.sort((a, b) => {
      const dateA = a?.date ?? a?.createdAt ?? a?.created_at;
      const dateB = b?.date ?? b?.createdAt ?? b?.created_at;
      const timeA = dateA ? new Date(dateA).getTime() : 0;
      const timeB = dateB ? new Date(dateB).getTime() : 0;
      return timeB - timeA;
    });
    return orders.slice(0, 5);
  }, [ordersSource]);

  if (isLoading || !user) {
    return (
      <PageContainer title="Usuario">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="secondary" />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title={`Usuario: ${user.name}`} 
      breadcrumbs={[{ title: 'Usuarios', path: '/users' }, { title: user.name }]}
    >
      <Grid container spacing={3}>
        {/* COLUMNA IZQUIERDA: PERFIL Y CONFIG */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center', 
            mb: 3, 
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <Avatar 
              src={user.profileImage} 
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2, border: `3px solid ${theme.palette.secondary.main}` }} 
            />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user.email}</Typography>
            
            <Stack direction="row" spacing={1} justifyContent="center">
              <Chip 
                label={user.isActive ? 'Activo' : 'Inactivo'} 
                color={user.isActive ? 'success' : 'error'} 
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Chip 
                label={user.isSuperuser ? 'Administrador' : 'Cliente'} 
                color="secondary" 
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: '20px', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Gestión de Cuenta</Typography>
            <Divider sx={{ mb: 2 }} />
            <FormGroup>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={user.isActive} 
                    onChange={handleToggleStatus} 
                    disabled={isUpdating} 
                    color="secondary"
                  />
                } 
                label="Cuenta Activa" 
              />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={user.isSuperuser} 
                    onChange={(e) => handleRoleChange(e.target.checked)} 
                    disabled={isUpdating} 
                    color="secondary"
                  />
                } 
                label="Es Administrador" 
              />
            </FormGroup>
          </Paper>
        </Grid>

        {/* COLUMNA DERECHA: MÉTRICAS Y PEDIDOS */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: '20px', 
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` 
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Métricas Generales</Typography>
            <Grid container spacing={4} textAlign="center">
              <Grid size={{ xs: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                  {totalOrders}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">Total Pedidos</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.secondary.main }}>
                  {totalFavorites}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">Favoritos</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: '20px', minHeight: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Historial Reciente (Top 5)</Typography>
            <Divider sx={{ mb: 3 }} />
            
            {ordersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress color="secondary" size={28} />
              </Box>
            ) : displayedOrders.length > 0 ? (
              <Stack spacing={2}>
                {displayedOrders.map((order: any, index: number) => {
                  const orderId = order?.id ?? order?.orderId ?? order?.order_id;
                  const orderDate = order?.date ?? order?.createdAt ?? order?.created_at;
                  const orderAmount = order?.amount ?? order?.total ?? order?.totalAmount ?? order?.total_amount ?? 0;
                  const orderStatus = order?.status ?? order?.state ?? 'Pendiente';
                  const canNavigate = Boolean(orderId);

                  return (
                  <Box 
                    key={orderId ?? index} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      p: 2, 
                      borderRadius: '15px',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.1),
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Pedido #{orderId ?? 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {orderDate ? new Date(orderDate).toLocaleDateString() : 'Sin fecha'}
                      </Typography>
                    </Box>
                    <Chip 
                      label={orderStatus} 
                      variant="outlined" 
                      size="small" 
                      sx={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 800 }} 
                    />
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 800 }}>
                      ${Number(orderAmount).toLocaleString()}
                    </Typography>
                    <Button 
                      variant="text" 
                      onClick={() => canNavigate && navigate(`/orders/${orderId}`)}
                      disabled={!canNavigate}
                      sx={{ fontWeight: 800 }}
                    >
                      Ver
                    </Button>
                  </Box>
                );
                })}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="body1" color="text.secondary">Este usuario aún no tiene pedidos.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/users')}
          sx={{ borderRadius: '12px', px: 4 }}
        >
          Volver al listado
        </Button>
      </Box>
    </PageContainer>
  );
}