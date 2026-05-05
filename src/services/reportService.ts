import httpClient from './httpClient';
import type {
  OrderStatusDistribution,
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

export const getTopProducts = async (limit: number): Promise<TopProduct[]> => {
  const response = await httpClient.get(`${topProductsEndpoint}?limit=${limit}`);
  return response.data as TopProduct[];
};

export const getOrderStatusDistribution = async (): Promise<
  OrderStatusDistribution[]
> => {
  const response = await httpClient.get(ordersByStatusEndpoint);
  return response.data as OrderStatusDistribution[];
};
