export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  revenueToday: number;
  ordersToday: number;
}

export interface SalesByDay {
  date: string;
  totalAmount: number;
  totalOrders: number;
}

export interface TopProduct {
  productId: number;
  productTitle: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface TopCustomer {
  accountId: number;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
}

export interface PeriodDetail {
  days: number;
  startDate: string;
  endDate: string;
  grossRevenue: number;
  cancelledAmount: number;
  netRevenue: number;
  totalOrders: number;
  cancelledOrders: number;
  cancellationRate: number;
  unitsSold: number;
  averageTicket: number;
  uniqueCustomers: number;
  bestDay: SalesByDay | null;
  previousNetRevenue: number;
  previousOrders: number;
  revenueTrend: number | null;
  ordersTrend: number | null;
  statusBreakdown: StatusBreakdown[];
  topCustomers: TopCustomer[];
}
