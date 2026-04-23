import { createAction, type Dispatch } from '@reduxjs/toolkit';
import httpClient from '../../services/httpClient';
import type { Product, CreateProductRequest, UpdateProductRequest, UploadImageRequest, PaginaProduct, ImageDTO } from '../../models/Product';
import { productsUrl, productImagesUrl } from '../../constants/serviceUrl';

export enum TipoAccionesProduct {
    OBTENER_LISTA_PRODUCTOS_EXITO = 'OBTENER_LISTA_PRODUCTOS_EXITO',
    OBTENER_LISTA_PRODUCTOS_ERROR = 'OBTENER_LISTA_PRODUCTOS_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_PRODUCTOS = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_PRODUCTOS',

    OBTENER_PRODUCTO_EXITO = 'OBTENER_PRODUCTO_EXITO',
    OBTENER_PRODUCTO_ERROR = 'OBTENER_PRODUCTO_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_PRODUCTO = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_PRODUCTO',

    CREAR_PRODUCTO_EXITO = 'CREAR_PRODUCTO_EXITO',
    CREAR_PRODUCTO_ERROR = 'CREAR_PRODUCTO_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_CREAR_PRODUCTO = 'CAMBIAR_ESTADO_DE_CARGA_CREAR_PRODUCTO',

    ACTUALIZAR_PRODUCTO_EXITO = 'ACTUALIZAR_PRODUCTO_EXITO',
    ACTUALIZAR_PRODUCTO_ERROR = 'ACTUALIZAR_PRODUCTO_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_PRODUCTO = 'CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_PRODUCTO',

    BORRAR_PRODUCTO_EXITO = 'BORRAR_PRODUCTO_EXITO',
    BORRAR_PRODUCTO_ERROR = 'BORRAR_PRODUCTO_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_BORRAR_PRODUCTO = 'CAMBIAR_ESTADO_DE_CARGA_BORRAR_PRODUCTO',

    SUBIR_IMAGEN_EXITO = 'SUBIR_IMAGEN_EXITO',
    SUBIR_IMAGEN_ERROR = 'SUBIR_IMAGEN_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_SUBIR_IMAGEN = 'CAMBIAR_ESTADO_DE_CARGA_SUBIR_IMAGEN',

    BORRAR_IMAGEN_EXITO = 'BORRAR_IMAGEN_EXITO',
    BORRAR_IMAGEN_ERROR = 'BORRAR_IMAGEN_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_BORRAR_IMAGEN = 'CAMBIAR_ESTADO_DE_CARGA_BORRAR_IMAGEN',

    RESETEAR_ESTADO_PRODUCTO = 'RESETEAR_ESTADO_PRODUCTO',
    LIMPIAR_PRODUCTO_ACTUAL = 'LIMPIAR_PRODUCTO_ACTUAL',
}

// Actions para obtener lista de productos
const obtenerListaProductosExito = createAction<PaginaProduct>(
    TipoAccionesProduct.OBTENER_LISTA_PRODUCTOS_EXITO
);

const obtenerListaProductosError = createAction<Error>(
    TipoAccionesProduct.OBTENER_LISTA_PRODUCTOS_ERROR
);

const cambiarEstadoDeCargaObtenerProductos = createAction<boolean>(
    TipoAccionesProduct.CAMBIAR_ESTADO_DE_CARGA_OBTENER_PRODUCTOS
);

// Actions para obtener un producto individual
const obtenerProductoExito = createAction<Product>(
    TipoAccionesProduct.OBTENER_PRODUCTO_EXITO
);

const obtenerProductoError = createAction<Error>(
    TipoAccionesProduct.OBTENER_PRODUCTO_ERROR
);

const cambiarEstadoDeCargaObtenerProducto = createAction<boolean>(
    TipoAccionesProduct.CAMBIAR_ESTADO_DE_CARGA_OBTENER_PRODUCTO
);

// Actions para crear producto
const crearProductoExito = createAction<Product>(
    TipoAccionesProduct.CREAR_PRODUCTO_EXITO
);

const crearProductoError = createAction<Error>(
    TipoAccionesProduct.CREAR_PRODUCTO_ERROR
);

const cambiarEstadoDeCargaCrearProducto = createAction<boolean>(
    TipoAccionesProduct.CAMBIAR_ESTADO_DE_CARGA_CREAR_PRODUCTO
);

// Actions para actualizar producto
const actualizarProductoExito = createAction<Product>(
    TipoAccionesProduct.ACTUALIZAR_PRODUCTO_EXITO
);

const actualizarProductoError = createAction<Error>(
    TipoAccionesProduct.ACTUALIZAR_PRODUCTO_ERROR
);

const cambiarEstadoDeCargaActualizarProducto = createAction<boolean>(
    TipoAccionesProduct.CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_PRODUCTO
);

// Actions para borrar producto
const borrarProductoExito = createAction<number>(
    TipoAccionesProduct.BORRAR_PRODUCTO_EXITO
);

const borrarProductoError = createAction<Error>(
    TipoAccionesProduct.BORRAR_PRODUCTO_ERROR
);

const cambiarEstadoDeCargaBorrarProducto = createAction<boolean>(
    TipoAccionesProduct.CAMBIAR_ESTADO_DE_CARGA_BORRAR_PRODUCTO
);

// Actions para subir imagen
const subirImagenExito = createAction<ImageDTO>(
    TipoAccionesProduct.SUBIR_IMAGEN_EXITO
);

const subirImagenError = createAction<Error>(
    TipoAccionesProduct.SUBIR_IMAGEN_ERROR
);

const cambiarEstadoDeCargaSubirImagen = createAction<boolean>(
    TipoAccionesProduct.CAMBIAR_ESTADO_DE_CARGA_SUBIR_IMAGEN
);

// Actions para borrar imagen
const borrarImagenExito = createAction<number>(
    TipoAccionesProduct.BORRAR_IMAGEN_EXITO
);

const borrarImagenError = createAction<Error>(
    TipoAccionesProduct.BORRAR_IMAGEN_ERROR
);

const cambiarEstadoDeCargaBorrarImagen = createAction<boolean>(
    TipoAccionesProduct.CAMBIAR_ESTADO_DE_CARGA_BORRAR_IMAGEN
);

const resetearEstadoProducto = createAction<undefined>(
    TipoAccionesProduct.RESETEAR_ESTADO_PRODUCTO
);

const limpiarProductoActual = createAction<undefined>(
    TipoAccionesProduct.LIMPIAR_PRODUCTO_ACTUAL
);

// Thunks
const obtenerProductos = (page: number = 0, pageSize: number = 10, search?: string) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerProductos(true));
    try {
        const params = new URLSearchParams({
            page: String(page),
            page_size: String(pageSize),
            });
            
        if (search && search.trim()) {
        params.append('search', search.trim());
        }
        const { data: listaProductos } = await httpClient.get(productsUrl, {params});
        dispatch(obtenerListaProductosExito(listaProductos));
    } catch (error) {
        dispatch(obtenerListaProductosError(JSON.parse(JSON.stringify(error)) as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerProductos(false));
};

const obtenerProductoPorId = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerProducto(true));
    try {
        const { data: producto } = await httpClient.get(`${productsUrl}/${id}`);
        dispatch(obtenerProductoExito(producto));
    } catch (error) {
        dispatch(obtenerProductoError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerProducto(false));
};

const crearProducto = (producto: CreateProductRequest) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaCrearProducto(true));
    try {
        const { data: response } = await httpClient.post(productsUrl, producto);
        dispatch(crearProductoExito(response));
        return response;
    } catch (error) {
        dispatch(crearProductoError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaCrearProducto(false));
    }
};

const actualizarProducto = (id: number, producto: UpdateProductRequest) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaActualizarProducto(true));
    try {
        const { data: response } = await httpClient.put(`${productsUrl}/${id}`, producto);
        dispatch(actualizarProductoExito(response));
        return response;
    } catch (error) {
        dispatch(actualizarProductoError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaActualizarProducto(false));
    }
};

const borrarProducto = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaBorrarProducto(true));
    try {
        await httpClient.delete(`${productsUrl}/${id}`);
        dispatch(borrarProductoExito(id));
    } catch (error) {
        dispatch(borrarProductoError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaBorrarProducto(false));
    }
};

const subirImagenProducto = (data: UploadImageRequest) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaSubirImagen(true));
    try {
        const { data: response } = await httpClient.post(productImagesUrl, data);
        dispatch(subirImagenExito(response));
        return response;
    } catch (error) {
        dispatch(subirImagenError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaSubirImagen(false));
    }
};

const borrarImagenProducto = (imageId: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaBorrarImagen(true));
    try {
        await httpClient.delete(`${productImagesUrl}/${imageId}`);
        dispatch(borrarImagenExito(imageId));
    } catch (error) {
        dispatch(borrarImagenError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaBorrarImagen(false));
    }
};

export const AccionesProduct = {
    obtenerListaProductosExito,
    obtenerListaProductosError,
    cambiarEstadoDeCargaObtenerProductos,
    obtenerProductos,

    obtenerProductoExito,
    obtenerProductoError,
    cambiarEstadoDeCargaObtenerProducto,
    obtenerProductoPorId,

    crearProductoExito,
    crearProductoError,
    cambiarEstadoDeCargaCrearProducto,
    crearProducto,

    actualizarProductoExito,
    actualizarProductoError,
    cambiarEstadoDeCargaActualizarProducto,
    actualizarProducto,

    borrarProductoExito,
    borrarProductoError,
    cambiarEstadoDeCargaBorrarProducto,
    borrarProducto,

    subirImagenExito,
    subirImagenError,
    cambiarEstadoDeCargaSubirImagen,
    subirImagenProducto,

    borrarImagenExito,
    borrarImagenError,
    cambiarEstadoDeCargaBorrarImagen,
    borrarImagenProducto,

    resetearEstadoProducto,
    limpiarProductoActual,
};