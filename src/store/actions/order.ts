import { createAction, type Dispatch } from '@reduxjs/toolkit';
import httpClient from '../../services/httpClient';
import type { OrderSummaryDTO, OrderDetailDTO, PaginaOrder } from '../../models/Order';
import { ordersUrl } from '../../constants/serviceUrl';

export enum TipoAccionesOrder {
    OBTENER_LISTA_ORDERS_EXITO = 'OBTENER_LISTA_ORDERS_EXITO',
    OBTENER_LISTA_ORDERS_ERROR = 'OBTENER_LISTA_ORDERS_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_ORDERS = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_ORDERS',

    OBTENER_ORDER_EXITO = 'OBTENER_ORDER_EXITO',
    OBTENER_ORDER_ERROR = 'OBTENER_ORDER_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_ORDER = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_ORDER',

    ACTUALIZAR_ESTADO_ORDER_EXITO = 'ACTUALIZAR_ESTADO_ORDER_EXITO',
    ACTUALIZAR_ESTADO_ORDER_ERROR = 'ACTUALIZAR_ESTADO_ORDER_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_ESTADO_ORDER = 'CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_ESTADO_ORDER',

    LIMPIAR_ORDER_ACTUAL = 'LIMPIAR_ORDER_ACTUAL',
}

const obtenerListaOrdersExito = createAction<PaginaOrder>(TipoAccionesOrder.OBTENER_LISTA_ORDERS_EXITO);
const obtenerListaOrdersError = createAction<Error>(TipoAccionesOrder.OBTENER_LISTA_ORDERS_ERROR);
const cambiarEstadoDeCargaObtenerOrders = createAction<boolean>(TipoAccionesOrder.CAMBIAR_ESTADO_DE_CARGA_OBTENER_ORDERS);

const obtenerOrderExito = createAction<OrderDetailDTO>(TipoAccionesOrder.OBTENER_ORDER_EXITO);
const obtenerOrderError = createAction<Error>(TipoAccionesOrder.OBTENER_ORDER_ERROR);
const cambiarEstadoDeCargaObtenerOrder = createAction<boolean>(TipoAccionesOrder.CAMBIAR_ESTADO_DE_CARGA_OBTENER_ORDER);

const actualizarEstadoOrderExito = createAction<OrderSummaryDTO>(TipoAccionesOrder.ACTUALIZAR_ESTADO_ORDER_EXITO);
const actualizarEstadoOrderError = createAction<Error>(TipoAccionesOrder.ACTUALIZAR_ESTADO_ORDER_ERROR);
const cambiarEstadoDeCargaActualizarEstadoOrder = createAction<boolean>(TipoAccionesOrder.CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_ESTADO_ORDER);

const limpiarOrderActual = createAction<undefined>(TipoAccionesOrder.LIMPIAR_ORDER_ACTUAL);

const obtenerOrders = (page: number = 0, pageSize: number = 10, status?: string) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerOrders(true));
    try {
        const params = new URLSearchParams({
            page: String(page),
            page_size: String(pageSize),
        });
        if (status && status.trim() && status !== 'ALL') {
            params.append('status', status.trim());
            params.append('statusOrder', status.trim());
        }
        const { data } = await httpClient.get(ordersUrl, { params });
        const listaOrders = data && typeof data === 'object' && 'data' in data ? data.data : data;
        dispatch(obtenerListaOrdersExito(listaOrders));
    } catch (error) {
        dispatch(obtenerListaOrdersError(JSON.parse(JSON.stringify(error)) as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerOrders(false));
};

const obtenerOrderPorId = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerOrder(true));
    try {
        const { data } = await httpClient.get(`${ordersUrl}/${id}`);
        const order = data && typeof data === 'object' && 'data' in data ? data.data : data;
        dispatch(obtenerOrderExito(order));
    } catch (error) {
        dispatch(obtenerOrderError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerOrder(false));
};

const actualizarEstadoOrder = (id: number, status: string) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaActualizarEstadoOrder(true));
    try {
        const { data } = await httpClient.patch(`${ordersUrl}/${id}/status?status=${status}`);
        const updatedOrder = data && typeof data === 'object' && 'data' in data ? data.data : data;
        dispatch(actualizarEstadoOrderExito(updatedOrder));
        return updatedOrder;
    } catch (error) {
        dispatch(actualizarEstadoOrderError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaActualizarEstadoOrder(false));
    }
};

export const AccionesOrder = {
    obtenerListaOrdersExito,
    obtenerListaOrdersError,
    cambiarEstadoDeCargaObtenerOrders,
    obtenerOrders,

    obtenerOrderExito,
    obtenerOrderError,
    cambiarEstadoDeCargaObtenerOrder,
    obtenerOrderPorId,

    actualizarEstadoOrderExito,
    actualizarEstadoOrderError,
    cambiarEstadoDeCargaActualizarEstadoOrder,
    actualizarEstadoOrder,

    limpiarOrderActual,
};
