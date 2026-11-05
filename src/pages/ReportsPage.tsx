import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import GlobalStyles from '@mui/material/GlobalStyles';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TodayIcon from '@mui/icons-material/Today';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import {
  StatusBreakdownTable,
  TopCustomersTable,
  TopProductsTable,
} from '../components/reports/ReportTables';
import KpiCard from '../components/reports/KpiCard';
import SalesLineChart from '../components/reports/SalesLineChart';
import TopProductsChart from '../components/reports/TopProductsChart';
import OrdersDonutChart from '../components/reports/OrdersDonutChart';
import ExportExcelButton from '../components/reports/ExportExcelButton';
import useReports from '../hooks/useReports';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dayOptions = [7, 14, 30, 90];
const limitOptions = [5, 10];

const filterButtonSx = (isActive: boolean) => ({
  textTransform: 'none',
  borderRadius: 999,
  px: 2,
  py: 0.5,
  border: '1px solid',
  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-secondary)',
  color: isActive ? '#fff' : 'var(--color-secondary)',
  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
  fontWeight: 600,
  fontFamily: "'Winky Sans', sans-serif",
  '&:hover': {
    backgroundColor: isActive
      ? 'var(--color-secondary)'
      : 'rgba(155, 48, 160, 0.08)',
    borderColor: 'var(--color-secondary)',
  },
});

const paperSx = {
  p: { xs: 2, sm: 3 },
  borderRadius: 3,
  boxShadow: '0 16px 30px rgba(17, 24, 39, 0.08)',
};

const kpiGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
  gap: 2.5,
};

const chartSkeletonSx = {
  borderRadius: 3,
  width: '100%',
  height: { xs: 250, sm: 300, lg: 380 },
};

export default function ReportsPage() {
  const [days, setDays] = React.useState(30);
  const [limit, setLimit] = React.useState(5);

  const {
    summary,
    detail,
    salesByDay,
    topProducts,
    orderStatusDistribution,
    loading,
    error,
    refetch,
  } = useReports(days, limit);

  const todayLabel = dateFormatter.format(new Date());

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1440,
        mx: 'auto',
        fontFamily: "'Winky Sans', sans-serif",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        '& .MuiTypography-root, & .MuiButton-root, & .MuiAlert-message': {
          fontFamily: "'Winky Sans', sans-serif",
        },
      }}
    >
      <GlobalStyles
        styles={(theme) => {
          const darkSelector = theme.getColorSchemeSelector
            ? theme.getColorSchemeSelector('dark')
            : '[data-mui-color-scheme="dark"]';
          return {
            ':root': {
              '--color-primary': theme.palette.primary.dark,
              '--color-secondary': theme.palette.primary.main,
              '--color-accent': theme.palette.primary.light,
            },
            [darkSelector]: {
              '--color-primary': theme.palette.primary.main,
              '--color-secondary': theme.palette.primary.light,
              '--color-accent': theme.palette.primary.light,
            },
          };
        }}
      />
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center', pt: 1 }}>
          <Typography
            component="h1"
            sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.4rem' }, color: 'var(--color-accent)' }}
          >
             Reportes y Estadísticas
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, mt: 0.5 }}>
            {detail
              ? `Del ${dateFormatter.format(new Date(`${detail.startDate}T00:00:00`))} al ${dateFormatter.format(new Date(`${detail.endDate}T00:00:00`))}`
              : 'Resumen del rendimiento de la tienda'}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.5,
              mt: 2.5,
            }}
          >
            {dayOptions.map((option) => (
              <Button
                key={`days-${option}`}
                onClick={() => setDays(option)}
                sx={filterButtonSx(days === option)}
              >
                Últimos {option} días
              </Button>
            ))}
            <ExportExcelButton
              summary={summary}
              salesByDay={salesByDay}
              topProducts={topProducts}
              orderStatusDistribution={orderStatusDistribution}
              days={days}
            />
          </Box>
        </Box>

        {error ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={refetch}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                Reintentar
              </Button>
            }
            sx={{ borderRadius: 2 }}
          >
            {error}
          </Alert>
        ) : null}

        <Box sx={kpiGridSx}>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`kpi-skeleton-${index}`}
                variant="rounded"
                height={168}
                sx={{ borderRadius: 3 }}
              />
            ))
          ) : summary ? (
            <>
              <KpiCard
                title="Ingresos totales"
                value={currencyFormatter.format(summary.totalRevenue)}
                icon={<AttachMoneyIcon />}
              />
              <KpiCard
                title="Órdenes totales"
                value={summary.totalOrders}
                icon={<ShoppingCartIcon />}
              />
              <KpiCard
                title="Productos activos"
                value={summary.activeProducts}
                icon={<Inventory2Icon />}
              />
              <KpiCard
                title="Ventas hoy"
                value={currencyFormatter.format(summary.revenueToday)}
                subtitle={`Actualizado: ${todayLabel}`}
                icon={<TodayIcon />}
              />
            </>
          ) : null}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', pt: 1 }}>
          Detalle del periodo ({days} días)
        </Typography>
        <Box sx={kpiGridSx}>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`detail-skeleton-${index}`}
                variant="rounded"
                height={168}
                sx={{ borderRadius: 3 }}
              />
            ))
          ) : detail ? (
            <>
              <KpiCard
                title="Ingresos netos"
                value={currencyFormatter.format(detail.netRevenue)}
                trend={detail.revenueTrend ?? undefined}
                subtitle={`Bruto: ${currencyFormatter.format(detail.grossRevenue)}`}
                icon={<AttachMoneyIcon />}
              />
              <KpiCard
                title="Pedidos"
                value={detail.totalOrders}
                trend={detail.ordersTrend ?? undefined}
                subtitle={`${detail.cancelledOrders} cancelados (${detail.cancellationRate}%)`}
                icon={<ShoppingCartIcon />}
              />
              <KpiCard
                title="Ticket promedio"
                value={currencyFormatter.format(detail.averageTicket)}
                subtitle={`${detail.unitsSold} unidades vendidas`}
                icon={<ReceiptLongIcon />}
              />
              <KpiCard
                title="Clientes activos"
                value={detail.uniqueCustomers}
                subtitle={
                  detail.bestDay
                    ? `Mejor día: ${dateFormatter.format(new Date(`${detail.bestDay.date}T00:00:00`))} (${currencyFormatter.format(detail.bestDay.totalAmount)})`
                    : 'Sin ventas en el periodo'
                }
                icon={<PeopleIcon />}
              />
            </>
          ) : null}
        </Box>

        <Paper elevation={0} sx={paperSx}>
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
            Ventas por día
          </Typography>
          <Box sx={{ mt: 2 }}>
            {loading ? (
              <Skeleton variant="rounded" sx={chartSkeletonSx} />
            ) : salesByDay.length > 0 ? (
              <SalesLineChart data={salesByDay} />
            ) : (
              <Typography color="text.secondary">
                No hay datos disponibles para este periodo.
              </Typography>
            )}
          </Box>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={paperSx}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
              Órdenes por estado
            </Typography>
            <Box sx={{ mt: 2 }}>
              {loading ? (
                <Skeleton variant="rounded" sx={chartSkeletonSx} />
              ) : orderStatusDistribution.length > 0 ? (
                <OrdersDonutChart data={orderStatusDistribution} />
              ) : (
                <Typography color="text.secondary">
                  No hay datos disponibles para las órdenes.
                </Typography>
              )}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={paperSx}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Top productos
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {limitOptions.map((option) => (
                  <Button
                    key={`limit-${option}`}
                    onClick={() => setLimit(option)}
                    sx={filterButtonSx(limit === option)}
                  >
                    Top {option}
                  </Button>
                ))}
              </Box>
            </Stack>
            <Box sx={{ mt: 2 }}>
              {loading ? (
                <Skeleton variant="rounded" sx={chartSkeletonSx} />
              ) : topProducts.length > 0 ? (
                <TopProductsChart data={topProducts} />
              ) : (
                <Typography color="text.secondary">
                  No hay productos disponibles para este corte.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          <Paper elevation={0} sx={paperSx}>
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
              Desglose por estado de pedido
            </Typography>
            {loading ? <Skeleton variant="rounded" height={220} /> : <StatusBreakdownTable data={detail?.statusBreakdown ?? []} />}
          </Paper>
          <Paper elevation={0} sx={paperSx}>
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
              Mejores clientes
            </Typography>
            {loading ? <Skeleton variant="rounded" height={220} /> : <TopCustomersTable data={detail?.topCustomers ?? []} />}
          </Paper>
        </Box>

        <Paper elevation={0} sx={paperSx}>
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
            Productos más vendidos (últimos {days} días)
          </Typography>
          {loading ? <Skeleton variant="rounded" height={220} /> : <TopProductsTable data={topProducts} />}
        </Paper>
      </Stack>
    </Box>
  );
}
