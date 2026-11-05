import httpClient from './httpClient';
import type {
  OrderStatusDistribution,
  PeriodDetail,
  ReportSummary,
  SalesByDay,
  TopProduct,
} from '../models/report.model';

const summaryEndpoint = '/admin/reports/summary';
const salesByDayEndpoint = '/admin/reports/sales-by-day';
const ordersByStatusEndpoint = '/admin/reports/orders-by-status';
const topProductsEndpoint = '/admin/reports/top-products';

export const getReportSummary = async (): Promise<ReportSummary> => {
  const response = await httpClient.get(summaryEndpoint);
  return response.data as ReportSummary;
};

export const getSalesByDay = async (days: number): Promise<SalesByDay[]> => {
  const response = await httpClient.get(`${salesByDayEndpoint}?days=${days}`);
  return response.data as SalesByDay[];
};

export const getTopProducts = async (limit: number, days = 0): Promise<TopProduct[]> => {
  const response = await httpClient.get(`${topProductsEndpoint}?limit=${limit}&days=${days}`);
  return response.data as TopProduct[];
};

export const getOrderStatusDistribution = async (): Promise<
  OrderStatusDistribution[]
> => {
  const response = await httpClient.get(ordersByStatusEndpoint);
  return response.data as OrderStatusDistribution[];
};

export const getPeriodDetail = async (days: number): Promise<PeriodDetail> => {
  const response = await httpClient.get(`/admin/reports/period-detail?days=${days}`);
  return response.data as PeriodDetail;
};
