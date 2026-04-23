import { createReducer } from '@reduxjs/toolkit';
import { AccionesOrder } from '../actions/order';
import type { OrderDetailDTO, PaginaOrder } from '../../models/Order';

export interface EstadoOrder {
    obtenerOrdersEnProgreso: boolean;
    listaOrders: PaginaOrder | null;
    errorObtenerOrders: { message: string } | null;

    obtenerOrderEnProgreso: boolean;
    orderActual: OrderDetailDTO | null;
    errorObtenerOrder: { message: string } | null;

    actualizarEstadoOrderEnProgreso: boolean;
    errorActualizarEstadoOrder: { message: string } | null;
}

const obtenerEstadoInicialOrder = (): EstadoOrder => ({
    obtenerOrdersEnProgreso: false,
    listaOrders: null,
    errorObtenerOrders: null,

    obtenerOrderEnProgreso: false,
    orderActual: null,
    errorObtenerOrder: null,

    actualizarEstadoOrderEnProgreso: false,
    errorActualizarEstadoOrder: null,
});

const orderReducerBuilder = (builder: any) => {
    builder.addCase(AccionesOrder.obtenerListaOrdersExito, (state: EstadoOrder, { payload }: any) => ({
        ...state, listaOrders: payload, errorObtenerOrders: null,
    }));
    builder.addCase(AccionesOrder.obtenerListaOrdersError, (state: EstadoOrder, { payload }: any) => ({
        ...state, errorObtenerOrders: { message: payload.message },
    }));
    builder.addCase(AccionesOrder.cambiarEstadoDeCargaObtenerOrders, (state: EstadoOrder, { payload }: any) => ({
        ...state, obtenerOrdersEnProgreso: payload,
    }));

    builder.addCase(AccionesOrder.obtenerOrderExito, (state: EstadoOrder, { payload }: any) => ({
        ...state, orderActual: payload, errorObtenerOrder: null,
    }));
    builder.addCase(AccionesOrder.obtenerOrderError, (state: EstadoOrder, { payload }: any) => ({
        ...state, errorObtenerOrder: { message: payload.message },
    }));
    builder.addCase(AccionesOrder.cambiarEstadoDeCargaObtenerOrder, (state: EstadoOrder, { payload }: any) => ({
        ...state, obtenerOrderEnProgreso: payload,
    }));

    builder.addCase(AccionesOrder.actualizarEstadoOrderExito, (state: EstadoOrder, { payload }: any) => {
        const updatedListaOrders = state.listaOrders ? {
            ...state.listaOrders,
            content: state.listaOrders.content.map(o => o.id === payload.id ? payload : o)
        } : null;

        const updatedOrderActual = state.orderActual && state.orderActual.id === payload.id 
            ? { ...state.orderActual, status: payload.status }
            : state.orderActual;

        return {
            ...state,
            listaOrders: updatedListaOrders,
            orderActual: updatedOrderActual,
            errorActualizarEstadoOrder: null,
        };
    });
    builder.addCase(AccionesOrder.actualizarEstadoOrderError, (state: EstadoOrder, { payload }: any) => ({
        ...state, errorActualizarEstadoOrder: { message: payload.message },
    }));
    builder.addCase(AccionesOrder.cambiarEstadoDeCargaActualizarEstadoOrder, (state: EstadoOrder, { payload }: any) => ({
        ...state, actualizarEstadoOrderEnProgreso: payload,
    }));

    builder.addCase(AccionesOrder.limpiarOrderActual, (state: EstadoOrder) => ({
        ...state, orderActual: null, errorObtenerOrder: null,
    }));
};

export const orderReducer = createReducer(obtenerEstadoInicialOrder(), orderReducerBuilder);
