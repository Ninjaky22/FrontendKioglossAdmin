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

const dayOptions = [7, 14, 30];
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            📊 Reportes y Estadísticas
          </Typography>
          <ExportExcelButton
            summary={summary}
            salesByDay={salesByDay}
            topProducts={topProducts}
            orderStatusDistribution={orderStatusDistribution}
            days={days}
          />
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

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2,
          }}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`kpi-skeleton-${index}`}
                variant="rounded"
                height={120}
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

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            boxShadow: '0 16px 30px rgba(17, 24, 39, 0.08)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Ventas por día
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dayOptions.map((option) => (
                <Button
                  key={`days-${option}`}
                  onClick={() => setDays(option)}
                  sx={filterButtonSx(days === option)}
                >
                  {option}d
                </Button>
              ))}
            </Box>
          </Stack>
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
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              boxShadow: '0 16px 30px rgba(17, 24, 39, 0.08)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              boxShadow: '0 16px 30px rgba(17, 24, 39, 0.08)',
            }}
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
      </Stack>
    </Box>
  );
}
