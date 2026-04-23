import type { EstadoOrder } from '../reducers/order';
import { createSelector } from '@reduxjs/toolkit';

export const orderStateSelector = (state: any): EstadoOrder => state.order;

export const listaOrdersSelector = createSelector(
    orderStateSelector,
    (orderState) => orderState.listaOrders?.content
);

export const paginaActualOrdersSelector = createSelector(
    orderStateSelector,
    (orderState) => orderState.listaOrders?.number
);

export const elementosPorPaginaOrdersSelector = createSelector(
    orderStateSelector,
    (orderState) => orderState.listaOrders?.size
);

export const totalElementosOrdersSelector = createSelector(
    orderStateSelector,
    (orderState) => orderState.listaOrders?.totalElements
);

export const obtenerOrdersEnProgresoSelector = createSelector(
    orderStateSelector,
    (orderState) => orderState.obtenerOrdersEnProgreso
);

export const errorObtenerOrdersSelector = createSelector(
    orderStateSelector,
    (orderState) => orderState.errorObtenerOrders
);

export const orderActualSelector = createSelector(
    orderStateSelector,
    (orderState) => orderState.orderActual
);

export const obtenerOrderEnProgresoSelector = createSelector(
    orderStateSelector,
    (orderState) => orderState.obtenerOrderEnProgreso
);

export const actualizarEstadoOrderEnProgresoSelector = createSelector(
    orderStateSelector,
    (orderState) => orderState.actualizarEstadoOrderEnProgreso
);
