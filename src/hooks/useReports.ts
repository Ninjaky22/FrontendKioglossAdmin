import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  OrderStatusDistribution,
  ReportSummary,
  SalesByDay,
  TopProduct,
} from '../models/report.model';
import {
  getOrderStatusDistribution,
  getReportSummary,
  getSalesByDay,
  getTopProducts,
} from '../services/reportService';

interface UseReportsResult {
  summary: ReportSummary | null;
  salesByDay: SalesByDay[];
  topProducts: TopProduct[];
  orderStatusDistribution: OrderStatusDistribution[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export default function useReports(days: number, limit: number): UseReportsResult {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [salesByDay, setSalesByDay] = useState<SalesByDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState<
    OrderStatusDistribution[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryData, salesData, topData, orderStatusData] = await Promise.all([
        getReportSummary(),
        getSalesByDay(days),
        getTopProducts(limit),
        getOrderStatusDistribution(),
      ]);

      if (!isMountedRef.current) return;

      setSummary(summaryData);
      setSalesByDay(salesData);
      setTopProducts(topData);
      setOrderStatusDistribution(orderStatusData);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError('No pudimos cargar los reportes. Intenta de nuevo.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [days, limit]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    summary,
    salesByDay,
    topProducts,
    orderStatusDistribution,
    loading,
    error,
    refetch: fetchReports,
  };
}
