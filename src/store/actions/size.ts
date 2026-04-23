import { createAction, type Dispatch } from '@reduxjs/toolkit';
import httpClient from '../../services/httpClient';
import { sizesUrl } from '../../constants/serviceUrl';

export interface Size {
    id: number;
    name: string;
}

export enum TipoAccionesSize {
    OBTENER_LISTA_SIZES_EXITO = 'OBTENER_LISTA_SIZES_EXITO',
    OBTENER_LISTA_SIZES_ERROR = 'OBTENER_LISTA_SIZES_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_SIZES = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_SIZES',

    ACTUALIZAR_SIZE_EXITO = 'ACTUALIZAR_SIZE_EXITO',
    ACTUALIZAR_SIZE_ERROR = 'ACTUALIZAR_SIZE_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_SIZE = 'CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_SIZE',

    CREAR_SIZE_EXITO = 'CREAR_SIZE_EXITO',
    CREAR_SIZE_ERROR = 'CREAR_SIZE_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_CREAR_SIZE = 'CAMBIAR_ESTADO_DE_CARGA_CREAR_SIZE',

    BORRAR_SIZE_EXITO = 'BORRAR_SIZE_EXITO',
    BORRAR_SIZE_ERROR = 'BORRAR_SIZE_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_BORRAR_SIZE = 'CAMBIAR_ESTADO_DE_CARGA_BORRAR_SIZE',

    RESETEAR_ESTADO_SIZE = 'RESETEAR_ESTADO_SIZE',
}

const actualizarSizeExito = createAction<Size>(
    TipoAccionesSize.ACTUALIZAR_SIZE_EXITO
);

const actualizarSizeError = createAction<Error>(
    TipoAccionesSize.ACTUALIZAR_SIZE_ERROR
);

const cambiarEstadoDeCargaActualizarSize = createAction<boolean>(
    TipoAccionesSize.CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_SIZE
);

const crearSizeExito = createAction<Size>(
    TipoAccionesSize.CREAR_SIZE_EXITO
);

const crearSizeError = createAction<Error>(
    TipoAccionesSize.CREAR_SIZE_ERROR
);

const cambiarEstadoDeCargaCrearSize = createAction<boolean>(
    TipoAccionesSize.CAMBIAR_ESTADO_DE_CARGA_CREAR_SIZE
);

const borrarSizeExito = createAction<number>(
    TipoAccionesSize.BORRAR_SIZE_EXITO
);

const borrarSizeError = createAction<Error>(
    TipoAccionesSize.BORRAR_SIZE_ERROR
);

const cambiarEstadoDeCargaBorrarSize = createAction<boolean>(
    TipoAccionesSize.CAMBIAR_ESTADO_DE_CARGA_BORRAR_SIZE
);

const obtenerListaSizesExito = createAction<Size[]>(
    TipoAccionesSize.OBTENER_LISTA_SIZES_EXITO
);

const obtenerListaSizesError = createAction<Error>(
    TipoAccionesSize.OBTENER_LISTA_SIZES_ERROR
);

const cambiarEstadoDeCargaObtenerSizes = createAction<boolean>(
    TipoAccionesSize.CAMBIAR_ESTADO_DE_CARGA_OBTENER_SIZES
);

const resetearEstadoSize = createAction<undefined>(
    TipoAccionesSize.RESETEAR_ESTADO_SIZE
);

const obtenerSizes = () => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerSizes(true));
    try {
        const { data: sizeList } = await httpClient.get(sizesUrl);
        dispatch(obtenerListaSizesExito(sizeList));
    } catch (error) {
        dispatch(obtenerListaSizesError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerSizes(false));
};

const crearSize = (size: Partial<Size>) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaCrearSize(true));
    try {
        const { data: response } = await httpClient.post(sizesUrl, size);
        dispatch(crearSizeExito(response));
    } catch (error) {
        dispatch(crearSizeError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaCrearSize(false));
};

const actualizarSize = (size: Size) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaActualizarSize(true));
    try {
        const { data: response } = await httpClient.put(
            `${sizesUrl}/${size.id}`,
            size
        );
        dispatch(actualizarSizeExito(response));
    } catch (error) {
        dispatch(actualizarSizeError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaActualizarSize(false));
};

const borrarSize = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaBorrarSize(true));
    try {
        await httpClient.delete(`${sizesUrl}/${id}`);
        dispatch(borrarSizeExito(id));
    } catch (error) {
        dispatch(borrarSizeError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaBorrarSize(false));
};

export const AccionesSize = {
    obtenerListaSizesExito,
    obtenerListaSizesError,
    cambiarEstadoDeCargaObtenerSizes,
    obtenerSizes,
    
    crearSizeExito,
    crearSizeError,
    cambiarEstadoDeCargaCrearSize,
    crearSize,
    
    actualizarSizeExito,
    actualizarSizeError,
    cambiarEstadoDeCargaActualizarSize,
    actualizarSize,
    
    borrarSizeExito,
    borrarSizeError,
    cambiarEstadoDeCargaBorrarSize,
    borrarSize,
    
    resetearEstadoSize
};