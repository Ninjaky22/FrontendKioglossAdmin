// CORRECCIÓN: Se eliminó el "import * as React from 'react'" ya que no se utiliza.
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import type { SalesByDay } from '../../models/report.model';

export interface ExportCSVButtonProps {
  data: SalesByDay[];
  filename?: string;
}

const buildFilename = (name: string) =>
  name.toLowerCase().endsWith('.csv') ? name : `${name}.csv`;

const buildCsvContent = (data: SalesByDay[]) => {
  const header = 'Fecha,Ingresos,Órdenes';
  const rows = data.map((item) =>
    [item.date, item.totalAmount.toFixed(2), item.totalOrders].join(','),
  );
  return [header, ...rows].join('\n');
};

export default function ExportCSVButton({
  data,
  filename = 'ventas-por-dia.csv',
}: ExportCSVButtonProps) {
  const isDisabled = data.length === 0;

  const handleExport = () => {
    if (!data.length) return;

    const csvContent = buildCsvContent(data);
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = buildFilename(filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outlined"
      startIcon={<FileDownloadIcon />}
      onClick={handleExport}
      disabled={isDisabled}
      sx={{
        borderRadius: 999,
        // Usamos colores directos si las variables CSS no están cargadas, 
        // o mantenemos tus variables si funcionan bien en tu tema.
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
      Exportar CSV
    </Button>
  );
}