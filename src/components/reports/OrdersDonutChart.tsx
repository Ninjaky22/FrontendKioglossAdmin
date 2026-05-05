import * as React from 'react';
import type { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import type { OrderStatusDistribution } from '../../models/report.model';

export interface OrdersDonutChartProps {
  data: OrderStatusDistribution[];
}

const statusLabelMap: Record<string, string> = {
  COMPLETED: 'Completadas',
  PENDING: 'Pendientes',
  CANCELLED: 'Canceladas',
};

const statusColorMap: Record<string, string> = {
  COMPLETED: '#610361',
  PENDING: '#9b30a0',
  CANCELLED: '#a21caf',
};

const percentageFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export default function OrdersDonutChart({ data }: OrdersDonutChartProps) {
  const labels = React.useMemo(
    () => data.map((item) => statusLabelMap[item.status] ?? item.status),
    [data],
  );

  const colors = React.useMemo(
    () =>
      data.map((item) => statusColorMap[item.status] ?? 'var(--color-primary)'),
    [data],
  );

  const series = React.useMemo(() => data.map((item) => item.count), [data]);

  const totalOrders = React.useMemo(
    () => data.reduce((acc, item) => acc + item.count, 0),
    [data],
  );

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: 380,
      toolbar: { show: false },
      fontFamily: "'Winky Sans', sans-serif",
      foreColor: '#4b5563',
    },
    labels,
    colors,
    legend: {
      position: 'right',
      fontFamily: "'Winky Sans', sans-serif",
      fontSize: '13px',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              fontFamily: "'Winky Sans', sans-serif",
              fontSize: '13px',
              offsetY: -2,
            },
            value: {
              fontFamily: "'Winky Sans', sans-serif",
              fontSize: '18px',
              fontWeight: 700,
              offsetY: -6,
            },
            total: {
              show: true,
              label: 'Total',
              fontFamily: "'Winky Sans', sans-serif",
              fontSize: '12px',
              formatter: () => totalOrders.toString(),
            },
          },
        },
      },
    },
    tooltip: {
      custom: ({ seriesIndex }: { seriesIndex: number }) => {
        const point = data[seriesIndex];
        if (!point) return '';
        const label = statusLabelMap[point.status] ?? point.status;
        return `
          <div style="padding: 10px 12px; font-family: 'Winky Sans', sans-serif;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #111827;">${label}</div>
            <div style="color: #4b5563; font-size: 12px;">Cantidad: <strong>${point.count}</strong></div>
            <div style="color: #4b5563; font-size: 12px;">Porcentaje: <strong>${percentageFormatter.format(
              point.percentage,
            )}%</strong></div>
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
      type="donut"
      options={options}
      series={series}
      height={380}
      width="100%"
    />
  );
}
