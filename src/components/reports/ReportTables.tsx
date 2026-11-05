import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type {
  StatusBreakdown,
  TopCustomer,
  TopProduct,
} from '../../models/report.model';
import { getOrderStatusLabel } from '../../utils/orderStatus';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const headSx = {
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase',
  fontSize: 12,
  letterSpacing: 0.6,
  fontFamily: "'Winky Sans', sans-serif",
};

const cellSx = { fontFamily: "'Winky Sans', sans-serif" };

function Empty({ text }: { text: string }) {
  return (
    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
      {text}
    </Typography>
  );
}

function ShareBar({ value }: { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, value))}
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          '& .MuiLinearProgress-bar': { backgroundColor: 'var(--color-secondary)' },
        }}
      />
      <Typography variant="caption" sx={{ width: 40, textAlign: 'right', ...cellSx }}>
        {value.toFixed(1)}%
      </Typography>
    </Box>
  );
}

export function StatusBreakdownTable({ data }: { data: StatusBreakdown[] }) {
  if (data.length === 0) return <Empty text="Sin pedidos en este periodo." />;
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={headSx}>Estado</TableCell>
          <TableCell sx={headSx} align="right">Pedidos</TableCell>
          <TableCell sx={headSx} align="right">Monto</TableCell>
          <TableCell sx={headSx}>Participación</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.status}>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{getOrderStatusLabel(row.status)}</TableCell>
            <TableCell sx={cellSx} align="right">{row.count}</TableCell>
            <TableCell sx={cellSx} align="right">{currency.format(row.totalAmount)}</TableCell>
            <TableCell><ShareBar value={row.percentage} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TopProductsTable({ data }: { data: TopProduct[] }) {
  if (data.length === 0) return <Empty text="Sin ventas de productos en este periodo." />;
  const totalRevenue = data.reduce((acc, p) => acc + (p.totalRevenue ?? 0), 0);
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={headSx}>#</TableCell>
          <TableCell sx={headSx}>Producto</TableCell>
          <TableCell sx={headSx} align="right">Unidades</TableCell>
          <TableCell sx={headSx} align="right">Ingresos</TableCell>
          <TableCell sx={headSx}>% del top</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((p, i) => (
          <TableRow key={p.productId}>
            <TableCell sx={cellSx}>{i + 1}</TableCell>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{p.productTitle}</TableCell>
            <TableCell sx={cellSx} align="right">{p.totalQuantitySold}</TableCell>
            <TableCell sx={cellSx} align="right">{currency.format(p.totalRevenue ?? 0)}</TableCell>
            <TableCell>
              <ShareBar value={totalRevenue > 0 ? ((p.totalRevenue ?? 0) / totalRevenue) * 100 : 0} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TopCustomersTable({ data }: { data: TopCustomer[] }) {
  if (data.length === 0) return <Empty text="Sin compras de clientes en este periodo." />;
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={headSx}>#</TableCell>
          <TableCell sx={headSx}>Cliente</TableCell>
          <TableCell sx={headSx} align="right">Pedidos</TableCell>
          <TableCell sx={headSx} align="right">Total gastado</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((c, i) => (
          <TableRow key={c.accountId}>
            <TableCell sx={cellSx}>{i + 1}</TableCell>
            <TableCell sx={cellSx}>
              <Typography sx={{ fontWeight: 600, ...cellSx }}>{c.name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={cellSx}>{c.email}</Typography>
            </TableCell>
            <TableCell sx={cellSx} align="right">{c.orders}</TableCell>
            <TableCell sx={cellSx} align="right">{currency.format(c.totalSpent)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
