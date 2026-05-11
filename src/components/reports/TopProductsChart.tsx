import * as React from 'react';
import type { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import type { TopProduct } from '../../models/report.model';
import { alpha, useTheme } from '@mui/material/styles';

export interface TopProductsChartProps {
  data: TopProduct[];
}

// Variables de color consistentes con tu paleta
const COLOR_PRIMARY = '#610361';
const COLOR_TERTIARY = '#f2a6dd';

const BRAND_PALETTE = [
  '#610361',
  '#9b30a0',
  '#b83db0',
  '#d45ac2',
  '#e97fd0',
  '#f2a6dd',
];

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '');
  const numeric = Number.parseInt(value, 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixColors = (start: string, end: string, ratio: number) => {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);

  const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * ratio);
  const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * ratio);
  const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * ratio);

  return rgbToHex(r, g, b);
};

const buildColorRamp = (count: number) => {
  if (count <= 1) return [COLOR_PRIMARY];
  if (count <= BRAND_PALETTE.length) return BRAND_PALETTE.slice(0, count);
  return Array.from({ length: count }, (_, index) =>
    mixColors(COLOR_PRIMARY, COLOR_TERTIARY, index / (count - 1)),
  );
};

const truncateLabel = (label: string, maxLength = 20) =>
  label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
});

export default function TopProductsChart({ data }: TopProductsChartProps) {
  const theme = useTheme();
  
  // CORRECCIÓN: Usar theme.palette.mode en lugar de useColorScheme() para evitar errores de Provider
  const isDark = theme.palette.mode === 'dark';
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const gridColor = alpha(theme.palette.divider, 0.6);

  const labels = React.useMemo(
    () => data.map((item) => truncateLabel(item.productTitle)),
    [data],
  );

  const series = React.useMemo(
    () => [
      {
        name: 'Cantidad vendida',
        data: data.map((item) => item.totalQuantitySold),
      },
    ],
    [data],
  );

  const colors = React.useMemo(() => buildColorRamp(data.length), [data.length]);

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 380,
      toolbar: { show: false },
      fontFamily: "'Winky Sans', sans-serif",
      foreColor: textSecondary,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        barHeight: '65%',
        borderRadius: 6,
      },
    },
    colors,
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          fontFamily: "'Winky Sans', sans-serif",
          colors: textSecondary,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontFamily: "'Winky Sans', sans-serif",
          colors: textSecondary,
        },
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      custom: ({ dataPointIndex }) => {
        const point = data[dataPointIndex];
        if (!point) return '';
        return `
          <div style="padding: 10px 12px; font-family: 'Winky Sans', sans-serif; background: ${isDark ? '#1e1e1e' : '#fff'}; border: 1px solid ${gridColor};">
            <div style="font-weight: 600; margin-bottom: 4px; color: ${textPrimary};">${point.productTitle}</div>
            <div style="color: ${textSecondary}; font-size: 12px;">Cantidad: <strong>${point.totalQuantitySold}</strong></div>
            <div style="color: ${textSecondary}; font-size: 12px;">Ingresos: <strong>${currencyFormatter.format(point.totalRevenue)}</strong></div>
          </div>
        `;
      },
    },
  };

  return (
    <ReactApexChart
      type="bar"
      options={options}
      series={series}
      height={380}
      width="100%"
    />
  );
}