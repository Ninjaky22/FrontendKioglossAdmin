import * as React from 'react';
import type { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import type { SalesByDay } from '../../models/report.model';
import { alpha, useTheme } from '@mui/material/styles';

export interface SalesLineChartProps {
  data: SalesByDay[];
}

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
});

const formatChartDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  });

const formatTooltipDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function SalesLineChart({ data }: SalesLineChartProps) {
  const theme = useTheme();
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const gridColor = alpha(theme.palette.divider, 0.6);

  const categories = React.useMemo(
    () => data.map((item) => formatChartDate(item.date)),
    [data],
  );

  const series = React.useMemo(
    () => [
      {
        name: 'Ventas',
        data: data.map((item) => item.totalAmount),
      },
    ],
    [data],
  );

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 380,
      toolbar: { show: false },
      fontFamily: "'Winky Sans', sans-serif",
      foreColor: textSecondary,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['var(--color-accent)'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.3,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontFamily: "'Winky Sans', sans-serif",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => currencyFormatter.format(value),
        style: {
          fontFamily: "'Winky Sans', sans-serif",
        },
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      padding: { left: 12, right: 12 },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      custom: ({ dataPointIndex }) => {
        const point = data[dataPointIndex];
        if (!point) return '';
        return `
          <div style="padding: 10px 12px; font-family: 'Winky Sans', sans-serif;">
            <div style="font-weight: 600; margin-bottom: 4px; color: ${textPrimary};">${formatTooltipDate(
              point.date,
            )}</div>
            <div style="color: ${textSecondary}; font-size: 12px;">Total: <strong>${currencyFormatter.format(
              point.totalAmount,
            )}</strong></div>
            <div style="color: ${textSecondary}; font-size: 12px;">Órdenes: <strong>${point.totalOrders}</strong></div>
          </div>
        `;
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: { height: 300 },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: { height: 250 },
          legend: { position: 'bottom' },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 220 },
          legend: { position: 'bottom' },
        },
      },
    ],
  };

  return (
    <ReactApexChart
      type="area"
      options={options}
      series={series}
      height={380}
      width="100%"
    />
  );
}
