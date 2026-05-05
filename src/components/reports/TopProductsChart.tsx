import * as React from 'react';
import type { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import type { TopProduct } from '../../models/report.model';

export interface TopProductsChartProps {
  data: TopProduct[];
}

const COLOR_PRIMARY = '#610361';
const COLOR_SECONDARY = '#9b30a0';

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
  return Array.from({ length: count }, (_, index) =>
    mixColors(COLOR_PRIMARY, COLOR_SECONDARY, index / (count - 1)),
  );
};

const truncateLabel = (label: string, maxLength = 20) =>
  label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
});

export default function TopProductsChart({ data }: TopProductsChartProps) {
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
      foreColor: '#4b5563',
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
        formatter: (value) => {
          const numericValue = Number(value);
          return Number.isNaN(numericValue)
            ? String(value)
            : `${numericValue}`;
        },
        style: {
          fontFamily: "'Winky Sans', sans-serif",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontFamily: "'Winky Sans', sans-serif",
        },
      },
    },
    grid: {
      borderColor: 'rgba(17, 24, 39, 0.08)',
      strokeDashArray: 4,
      padding: { left: 12, right: 12 },
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const point = data[dataPointIndex];
        if (!point) return '';
        return `
          <div style="padding: 10px 12px; font-family: 'Winky Sans', sans-serif;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #111827;">${point.productTitle}</div>
            <div style="color: #4b5563; font-size: 12px;">Cantidad: <strong>${point.totalQuantitySold}</strong></div>
            <div style="color: #4b5563; font-size: 12px;">Ingresos: <strong>${currencyFormatter.format(
              point.totalRevenue,
            )}</strong></div>
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
      type="bar"
      options={options}
      series={series}
      height={380}
      width="100%"
    />
  );
}
