import * as React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { saveAs } from 'file-saver';
import type { Cell, Borders } from 'exceljs';
import type {
  ReportSummary,
  SalesByDay,
  TopProduct,
  OrderStatusDistribution,
} from '../../models/report.model';
import logoUrl from '../../assets/logo.png';

// ── Brand palette (ARGB: 'FF' + hex sin '#') ──────────────────────────────
const C = {
  primary:   'FF610361',
  secondary: 'FF9B30A0',
  white:     'FFFFFFFF',
  altRow:    'FFF9F0F9',
  dark:      'FF2D1033',
  border:    'FFD4B0D4',
} as const;

const COP = '"$"#,##0.00';

const STATUS_LABELS: Record<string, string> = {
  COMPLETED:  'Completadas',
  DELIVERED:  'Completadas',
  PENDING:    'Pendientes',
  PROCESSING: 'Procesando',
  SHIPPED:    'Enviadas',
  CANCELLED:  'Canceladas',
  CANCELED:   'Canceladas',
};

const normStatus = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toUpperCase().replace(/\s+/g, '_');

const BORDER: Partial<Borders> = {
  top:    { style: 'thin', color: { argb: C.border } },
  bottom: { style: 'thin', color: { argb: C.border } },
  left:   { style: 'thin', color: { argb: C.border } },
  right:  { style: 'thin', color: { argb: C.border } },
};

function applyHdr(cell: Cell) {
  cell.font      = { name: 'Calibri', bold: true, size: 11, color: { argb: C.white } };
  cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.primary } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border    = BORDER;
}

function applyDat(cell: Cell, idx: number, align: 'left' | 'right' | 'center' = 'left') {
  cell.fill      = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: idx % 2 === 0 ? C.altRow : C.white },
  };
  cell.font      = { name: 'Calibri', size: 10, color: { argb: C.dark } };
  cell.alignment = { vertical: 'middle', horizontal: align };
  cell.border    = BORDER;
}

function applyTot(cell: Cell, align: 'left' | 'right' | 'center' = 'right') {
  cell.font      = { name: 'Calibri', bold: true, size: 10, color: { argb: C.white } };
  cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.secondary } };
  cell.alignment = { vertical: 'middle', horizontal: align };
  cell.border    = BORDER;
}

export interface ExportExcelButtonProps {
  summary: ReportSummary | null;
  salesByDay: SalesByDay[];
  topProducts: TopProduct[];
  orderStatusDistribution: OrderStatusDistribution[];
  days: number;
}

export default function ExportExcelButton({
  summary,
  salesByDay,
  topProducts,
  orderStatusDistribution,
  days,
}: ExportExcelButtonProps) {
  const [exporting, setExporting] = React.useState(false);
  const disabled = !summary || salesByDay.length === 0;

  const handleExport = async () => {
    if (disabled || exporting || !summary) return;
    setExporting(true);
    try {
      // Carga diferida — ExcelJS (~1 MB) solo se descarga al hacer clic
      const { Workbook } = await import('exceljs');
      const workbook = new Workbook();
      workbook.creator = 'Kiogloss Admin';
      workbook.created = new Date();

      const logoBuffer = await fetch(logoUrl).then((r) => r.arrayBuffer());
      const logoId = workbook.addImage({ buffer: logoBuffer, extension: 'png' });

      const periodLabel = `Últimos ${days} días`;
      const generatedAt = new Date().toLocaleString('es-CO', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      const today = new Date();
      const dateStr = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('');

      // ── HOJA 1: RESUMEN ─────────────────────────────────────────────────
      const ws1 = workbook.addWorksheet('Resumen', {
        properties: { tabColor: { argb: C.primary } },
      });
      ws1.columns = [{ width: 36 }, { width: 28 }];

      // Filas 1-2: área del logo
      ws1.getRow(1).height = 30;
      ws1.getRow(2).height = 28;
      ws1.addImage(logoId, { tl: { col: 0, row: 0 }, ext: { width: 140, height: 56 } });

      // Fila 3: título
      ws1.getRow(3).height = 28;
      ws1.mergeCells('A3:B3');
      const titleCell = ws1.getCell('A3');
      titleCell.value     = 'Reporte de Ventas — Kiogloss';
      titleCell.font      = { name: 'Calibri', bold: true, size: 15, color: { argb: C.primary } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // Fila 4: período + fecha generación
      ws1.getRow(4).height = 18;
      const p4a = ws1.getCell('A4');
      const p4b = ws1.getCell('B4');
      p4a.value     = `Período: ${periodLabel}`;
      p4a.font      = { name: 'Calibri', italic: true, size: 10, color: { argb: C.secondary } };
      p4b.value     = `Generado: ${generatedAt}`;
      p4b.font      = { name: 'Calibri', italic: true, size: 10, color: { argb: C.secondary } };
      p4b.alignment = { horizontal: 'right' };

      // Fila 5: separador
      ws1.getRow(5).height = 8;

      // Fila 6: cabecera KPIs
      ws1.getRow(6).height = 22;
      ws1.getCell('A6').value = 'Indicador';
      ws1.getCell('B6').value = 'Valor';
      applyHdr(ws1.getCell('A6'));
      applyHdr(ws1.getCell('B6'));

      // Filas 7-11: datos KPI
      const kpis = [
        { label: 'Ingresos Totales',   value: summary.totalRevenue,   fmt: COP },
        { label: 'Ventas Hoy',         value: summary.revenueToday,   fmt: COP },
        { label: 'Órdenes Totales',    value: summary.totalOrders,    fmt: undefined },
        { label: 'Órdenes Hoy',        value: summary.ordersToday,    fmt: undefined },
        { label: 'Productos Activos',  value: summary.activeProducts, fmt: undefined },
      ];
      kpis.forEach(({ label, value, fmt }, i) => {
        const r = 7 + i;
        ws1.getRow(r).height = 20;
        const la = ws1.getCell(`A${r}`);
        const va = ws1.getCell(`B${r}`);
        la.value = label;
        va.value = value;
        applyDat(la, i, 'left');
        la.font = { name: 'Calibri', bold: true, size: 10, color: { argb: C.dark } };
        applyDat(va, i, 'right');
        if (fmt) va.numFmt = fmt;
      });

      // ── HOJA 2: VENTAS POR DÍA ─────────────────────────────────────────
      const ws2 = workbook.addWorksheet('Ventas por Día', {
        properties: { tabColor: { argb: C.secondary } },
      });
      ws2.columns = [
        { header: 'Fecha',                   key: 'date',   width: 16 },
        { header: 'Ingresos (COP)',           key: 'amount', width: 24 },
        { header: 'Órdenes',                 key: 'orders', width: 14 },
        { header: 'Ingreso Prom. por Orden', key: 'avg',    width: 26 },
      ];
      ws2.getRow(1).height = 22;
      ws2.getRow(1).eachCell((cell) => applyHdr(cell));

      let totAmount = 0;
      let totOrders = 0;
      salesByDay.forEach((item, i) => {
        const avg = item.totalOrders > 0 ? item.totalAmount / item.totalOrders : 0;
        const row = ws2.addRow({
          date: item.date, amount: item.totalAmount, orders: item.totalOrders, avg,
        });
        row.height = 18;
        row.eachCell((cell, col) => applyDat(cell, i, col === 1 ? 'left' : 'right'));
        row.getCell('amount').numFmt = COP;
        row.getCell('avg').numFmt   = COP;
        totAmount += item.totalAmount;
        totOrders += item.totalOrders;
      });
      const totRow2 = ws2.addRow({
        date: 'TOTAL', amount: totAmount, orders: totOrders,
        avg: totOrders > 0 ? totAmount / totOrders : 0,
      });
      totRow2.height = 22;
      totRow2.eachCell((cell, col) => applyTot(cell, col === 1 ? 'left' : 'right'));
      totRow2.getCell('amount').numFmt = COP;
      totRow2.getCell('avg').numFmt   = COP;

      // ── HOJA 3: TOP PRODUCTOS ──────────────────────────────────────────
      const ws3 = workbook.addWorksheet('Top Productos', {
        properties: { tabColor: { argb: C.secondary } },
      });
      ws3.columns = [
        { header: '#',                 key: 'rank',    width: 6  },
        { header: 'Producto',          key: 'title',   width: 36 },
        { header: 'Unidades Vendidas', key: 'qty',     width: 20 },
        { header: 'Ingresos (COP)',    key: 'revenue', width: 24 },
      ];
      ws3.getRow(1).height = 22;
      ws3.getRow(1).eachCell((cell) => applyHdr(cell));

      topProducts.forEach((item, i) => {
        const row = ws3.addRow({
          rank: i + 1, title: item.productTitle,
          qty: item.totalQuantitySold, revenue: item.totalRevenue,
        });
        row.height = 18;
        row.eachCell((cell, col) => {
          if (col === 1) applyDat(cell, i, 'center');
          else if (col === 2) applyDat(cell, i, 'left');
          else applyDat(cell, i, 'right');
        });
        row.getCell('revenue').numFmt = COP;
      });

      // ── HOJA 4: ÓRDENES POR ESTADO ────────────────────────────────────
      const ws4 = workbook.addWorksheet('Órdenes por Estado', {
        properties: { tabColor: { argb: C.secondary } },
      });
      ws4.columns = [
        { header: 'Estado',     key: 'status', width: 20 },
        { header: 'Cantidad',   key: 'count',  width: 16 },
        { header: 'Porcentaje', key: 'pct',    width: 16 },
      ];
      ws4.getRow(1).height = 22;
      ws4.getRow(1).eachCell((cell) => applyHdr(cell));

      const totalCount = orderStatusDistribution.reduce((acc, item) => acc + item.count, 0);
      orderStatusDistribution.forEach((item, i) => {
        const label = STATUS_LABELS[normStatus(item.status)] ?? item.status;
        const row = ws4.addRow({
          status: label, count: item.count, pct: item.percentage / 100,
        });
        row.height = 18;
        row.eachCell((cell, col) => applyDat(cell, i, col === 1 ? 'left' : 'right'));
        row.getCell('pct').numFmt = '0.00%';
      });
      const totRow4 = ws4.addRow({ status: 'TOTAL', count: totalCount, pct: 1 });
      totRow4.height = 22;
      totRow4.eachCell((cell, col) => applyTot(cell, col === 1 ? 'left' : 'right'));
      totRow4.getCell('pct').numFmt = '0.00%';

      // ── Generar archivo ────────────────────────────────────────────────
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `reporte-kiogloss-${dateStr}.xlsx`,
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={
        exporting
          ? <CircularProgress size={16} color="inherit" />
          : <FileDownloadIcon />
      }
      onClick={handleExport}
      disabled={disabled || exporting}
      sx={{
        borderRadius: 999,
        borderColor: 'var(--color-secondary)',
        color: 'var(--color-secondary)',
        fontWeight: 600,
        textTransform: 'none',
        fontFamily: "'Winky Sans', sans-serif",
        '&:hover': {
          borderColor: 'var(--color-secondary)',
          backgroundColor: 'rgba(155, 48, 160, 0.08)',
        },
      }}
    >
      {exporting ? 'Exportando...' : 'Exportar Excel'}
    </Button>
  );
}
