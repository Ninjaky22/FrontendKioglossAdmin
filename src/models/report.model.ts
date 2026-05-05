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
