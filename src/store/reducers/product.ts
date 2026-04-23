import { createReducer } from '@reduxjs/toolkit';
import { AccionesProduct } from '../actions/product';
import type { Product, PaginaProduct } from '../../models/Product';

export interface EstadoProduct {
    // Lista de productos
    obtenerProductosEnProgreso: boolean;
    listaProductos: PaginaProduct | null;
    errorObtenerProductos: { message: string } | null;

    // Producto individual
    obtenerProductoEnProgreso: boolean;
    productoActual: Product | null;
    errorObtenerProducto: { message: string } | null;

    // Crear producto
    crearProductoEnProgreso: boolean;
    errorCrearProducto: { message: string } | null;

    // Actualizar producto
    actualizarProductoEnProgreso: boolean;
    errorActualizarProducto: { message: string } | null;

    // Borrar producto
    borrarProductoEnProgreso: boolean;
    errorBorrarProducto: { message: string } | null;

    // Subir imagen
    subirImagenEnProgreso: boolean;
    errorSubirImagen: { message: string } | null;

    // Borrar imagen
    borrarImagenEnProgreso: boolean;
    errorBorrarImagen: { message: string } | null;
}

const obtenerEstadoInicialProduct = (): EstadoProduct => {
    return {
        obtenerProductosEnProgreso: false,
        listaProductos: null,
        errorObtenerProductos: null,

        obtenerProductoEnProgreso: false,
        productoActual: null,
        errorObtenerProducto: null,

        crearProductoEnProgreso: false,
        errorCrearProducto: null,

        actualizarProductoEnProgreso: false,
        errorActualizarProducto: null,

        borrarProductoEnProgreso: false,
        errorBorrarProducto: null,

        subirImagenEnProgreso: false,
        errorSubirImagen: null,

        borrarImagenEnProgreso: false,
        errorBorrarImagen: null,
    };
};

// Reducers para obtener lista de productos
const exitoAlObtenerProductos = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.obtenerListaProductosExito>
) => {
    return {
        ...state,
        listaProductos: payload,
        errorObtenerProductos: null,
    };
};

const errorAlObtenerProductos = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.obtenerListaProductosError>
) => {
    return {
        ...state,
        errorObtenerProductos: { message: payload.message },
    };
};

const cambiarEstadoDeCargaObtenerProductos = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.cambiarEstadoDeCargaObtenerProductos>
) => {
    return {
        ...state,
        obtenerProductosEnProgreso: payload,
    };
};

// Reducers para obtener producto individual
const exitoAlObtenerProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.obtenerProductoExito>
) => {
    return {
        ...state,
        productoActual: payload,
        errorObtenerProducto: null,
    };
};

const errorAlObtenerProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.obtenerProductoError>
) => {
    return {
        ...state,
        errorObtenerProducto: { message: payload.message },
    };
};

const cambiarEstadoDeCargaObtenerProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.cambiarEstadoDeCargaObtenerProducto>
) => {
    return {
        ...state,
        obtenerProductoEnProgreso: payload,
    };
};

// Reducers para crear producto
const exitoAlCrearProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.crearProductoExito>
) => {
    return {
        ...state,
        listaProductos: state.listaProductos ? {
            ...state.listaProductos,
            content: [...state.listaProductos.content, payload],
            totalElements: state.listaProductos.totalElements + 1,
        } : null,
        productoActual: payload,
        errorCrearProducto: null,
    };
};

const errorAlCrearProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.crearProductoError>
) => {
    return {
        ...state,
        errorCrearProducto: { message: payload.message },
    };
};

const cambiarEstadoDeCargaCrearProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.cambiarEstadoDeCargaCrearProducto>
) => {
    return {
        ...state,
        crearProductoEnProgreso: payload,
    };
};

// Reducers para actualizar producto
const exitoAlActualizarProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.actualizarProductoExito>
) => {
    return {
        ...state,
        listaProductos: state.listaProductos ? {
            ...state.listaProductos,
            content: state.listaProductos.content.map((producto) =>
                producto.id !== payload.id ? producto : payload
            ),
        } : null,
        productoActual: payload,
        errorActualizarProducto: null,
    };
};

const errorAlActualizarProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.actualizarProductoError>
) => {
    return {
        ...state,
        errorActualizarProducto: { message: payload.message },
    };
};

const cambiarEstadoDeCargaActualizarProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.cambiarEstadoDeCargaActualizarProducto>
) => {
    return {
        ...state,
        actualizarProductoEnProgreso: payload,
    };
};

// Reducers para borrar producto
const exitoAlBorrarProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.borrarProductoExito>
) => {
    return {
        ...state,
        listaProductos: state.listaProductos ? {
            ...state.listaProductos,
            content: state.listaProductos.content.filter((producto) => producto.id !== payload),
            totalElements: state.listaProductos.totalElements - 1,
        } : null,
        errorBorrarProducto: null,
    };
};

const errorAlBorrarProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.borrarProductoError>
) => {
    return {
        ...state,
        errorBorrarProducto: { message: payload.message },
    };
};

const cambiarEstadoDeCargaBorrarProducto = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.cambiarEstadoDeCargaBorrarProducto>
) => {
    return {
        ...state,
        borrarProductoEnProgreso: payload,
    };
};

// Reducers para subir imagen
const exitoAlSubirImagen = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.subirImagenExito>
) => {
    return {
        ...state,
        productoActual: state.productoActual ? {
            ...state.productoActual,
            images: [...state.productoActual.images, payload],
        } : null,
        errorSubirImagen: null,
    };
};

const errorAlSubirImagen = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.subirImagenError>
) => {
    return {
        ...state,
        errorSubirImagen: { message: payload.message },
    };
};

const cambiarEstadoDeCargaSubirImagen = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.cambiarEstadoDeCargaSubirImagen>
) => {
    return {
        ...state,
        subirImagenEnProgreso: payload,
    };
};

// Reducers para borrar imagen
const exitoAlBorrarImagen = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.borrarImagenExito>
) => {
    return {
        ...state,
        productoActual: state.productoActual ? {
            ...state.productoActual,
            images: state.productoActual.images.filter((img) => img.id !== payload),
        } : null,
        errorBorrarImagen: null,
    };
};

const errorAlBorrarImagen = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.borrarImagenError>
) => {
    return {
        ...state,
        errorBorrarImagen: { message: payload.message },
    };
};

const cambiarEstadoDeCargaBorrarImagen = (
    state: EstadoProduct,
    { payload }: ReturnType<typeof AccionesProduct.cambiarEstadoDeCargaBorrarImagen>
) => {
    return {
        ...state,
        borrarImagenEnProgreso: payload,
    };
};

const limpiarProductoActual = (state: EstadoProduct) => {
    return {
        ...state,
        productoActual: null,
        errorObtenerProducto: null,
    };
};

const resetearEstadoProducto = () => obtenerEstadoInicialProduct();

const productReducerBuilder = (builder: any) => {
    // Lista de productos
    builder.addCase(AccionesProduct.obtenerListaProductosExito, exitoAlObtenerProductos);
    builder.addCase(AccionesProduct.obtenerListaProductosError, errorAlObtenerProductos);
    builder.addCase(AccionesProduct.cambiarEstadoDeCargaObtenerProductos, cambiarEstadoDeCargaObtenerProductos);

    // Producto individual
    builder.addCase(AccionesProduct.obtenerProductoExito, exitoAlObtenerProducto);
    builder.addCase(AccionesProduct.obtenerProductoError, errorAlObtenerProducto);
    builder.addCase(AccionesProduct.cambiarEstadoDeCargaObtenerProducto, cambiarEstadoDeCargaObtenerProducto);

    // Crear producto
    builder.addCase(AccionesProduct.crearProductoExito, exitoAlCrearProducto);
    builder.addCase(AccionesProduct.crearProductoError, errorAlCrearProducto);
    builder.addCase(AccionesProduct.cambiarEstadoDeCargaCrearProducto, cambiarEstadoDeCargaCrearProducto);

    // Actualizar producto
    builder.addCase(AccionesProduct.actualizarProductoExito, exitoAlActualizarProducto);
    builder.addCase(AccionesProduct.actualizarProductoError, errorAlActualizarProducto);
    builder.addCase(AccionesProduct.cambiarEstadoDeCargaActualizarProducto, cambiarEstadoDeCargaActualizarProducto);

    // Borrar producto
    builder.addCase(AccionesProduct.borrarProductoExito, exitoAlBorrarProducto);
    builder.addCase(AccionesProduct.borrarProductoError, errorAlBorrarProducto);
    builder.addCase(AccionesProduct.cambiarEstadoDeCargaBorrarProducto, cambiarEstadoDeCargaBorrarProducto);

    // Subir imagen
    builder.addCase(AccionesProduct.subirImagenExito, exitoAlSubirImagen);
    builder.addCase(AccionesProduct.subirImagenError, errorAlSubirImagen);
    builder.addCase(AccionesProduct.cambiarEstadoDeCargaSubirImagen, cambiarEstadoDeCargaSubirImagen);

    // Borrar imagen
    builder.addCase(AccionesProduct.borrarImagenExito, exitoAlBorrarImagen);
    builder.addCase(AccionesProduct.borrarImagenError, errorAlBorrarImagen);
    builder.addCase(AccionesProduct.cambiarEstadoDeCargaBorrarImagen, cambiarEstadoDeCargaBorrarImagen);

    // Utilidades
    builder.addCase(AccionesProduct.limpiarProductoActual, limpiarProductoActual);
    builder.addCase(AccionesProduct.resetearEstadoProducto, resetearEstadoProducto);
};

export const productReducer = createReducer(
    obtenerEstadoInicialProduct(),
    productReducerBuilder
);