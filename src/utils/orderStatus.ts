// Fuente única de los estados de pedido: códigos del backend y su nombre visible
export type OrderStatusCode = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export const ORDER_STATUS_CODES: OrderStatusCode[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const ORDER_STATUS_LABELS: Record<OrderStatusCode, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

// El backend responde con la descripción ("Pendiente"); se aceptan también códigos y variantes antiguas
const ALIASES: Record<string, OrderStatusCode> = {
  PENDIENTE: 'PENDING',
  PROCESANDO: 'PROCESSING',
  EN_PROCESO: 'PROCESSING',
  EN_PREPARACION: 'PROCESSING',
  ENVIADO: 'SHIPPED',
  ENTREGADO: 'DELIVERED',
  COMPLETED: 'DELIVERED',
  CANCELADO: 'CANCELLED',
  CANCELED: 'CANCELLED',
};

const normalize = (status: string) =>
  status.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase().replace(/\s+/g, '_');

export const toOrderStatusCode = (status?: string | null): OrderStatusCode | null => {
  if (!status) return null;
  const key = normalize(status);
  if ((ORDER_STATUS_CODES as string[]).includes(key)) return key as OrderStatusCode;
  return ALIASES[key] ?? null;
};

export const getOrderStatusLabel = (status?: string | null): string => {
  const code = toOrderStatusCode(status);
  return code ? ORDER_STATUS_LABELS[code] : status ?? '';
};
