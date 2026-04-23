import type { EstadoProduct } from '../reducers/product';
import { createSelector } from '@reduxjs/toolkit';

export const productStateSelector = (state: any): EstadoProduct => state.product;

// Selectores para lista de productos
export const listaProductosSelector = createSelector(
    productStateSelector,
    (productState) => productState.listaProductos?.content
);

export const paginaActualProductosSelector = createSelector(
    productStateSelector,
    (productState) => productState.listaProductos?.number
);

export const elementosPorPaginaProductosSelector = createSelector(
    productStateSelector,
    (productState) => productState.listaProductos?.size
);

export const totalElementosProductosSelector = createSelector(
    productStateSelector,
    (productState) => productState.listaProductos?.totalElements
);

export const totalPaginasProductosSelector = createSelector(
    productStateSelector,
    (productState) => productState.listaProductos?.totalPages
);

export const obtenerProductosEnProgresoSelector = createSelector(
    productStateSelector,
    (productState) => productState.obtenerProductosEnProgreso
);

export const errorObtenerProductosSelector = createSelector(
    productStateSelector,
    (productState) => productState.errorObtenerProductos
);

// Selectores para producto individual
export const productoActualSelector = createSelector(
    productStateSelector,
    (productState) => productState.productoActual
);

export const obtenerProductoEnProgresoSelector = createSelector(
    productStateSelector,
    (productState) => productState.obtenerProductoEnProgreso
);

export const errorObtenerProductoSelector = createSelector(
    productStateSelector,
    (productState) => productState.errorObtenerProducto
);

// Selectores para crear producto
export const crearProductoEnProgresoSelector = createSelector(
    productStateSelector,
    (productState) => productState.crearProductoEnProgreso
);

export const errorCrearProductoSelector = createSelector(
    productStateSelector,
    (productState) => productState.errorCrearProducto
);

// Selectores para actualizar producto
export const actualizarProductoEnProgresoSelector = createSelector(
    productStateSelector,
    (productState) => productState.actualizarProductoEnProgreso
);

export const errorActualizarProductoSelector = createSelector(
    productStateSelector,
    (productState) => productState.errorActualizarProducto
);

// Selectores para borrar producto
export const borrarProductoEnProgresoSelector = createSelector(
    productStateSelector,
    (productState) => productState.borrarProductoEnProgreso
);

export const errorBorrarProductoSelector = createSelector(
    productStateSelector,
    (productState) => productState.errorBorrarProducto
);

// Selectores para subir imagen
export const subirImagenEnProgresoSelector = createSelector(
    productStateSelector,
    (productState) => productState.subirImagenEnProgreso
);

export const errorSubirImagenSelector = createSelector(
    productStateSelector,
    (productState) => productState.errorSubirImagen
);

// Selectores para borrar imagen
export const borrarImagenEnProgresoSelector = createSelector(
    productStateSelector,
    (productState) => productState.borrarImagenEnProgreso
);

export const errorBorrarImagenSelector = createSelector(
    productStateSelector,
    (productState) => productState.errorBorrarImagen
);