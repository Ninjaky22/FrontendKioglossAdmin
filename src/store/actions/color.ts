import { createAction, type Dispatch } from '@reduxjs/toolkit';
import httpClient from '../../services/httpClient';
import { colorsUrl } from '../../constants/serviceUrl';

export interface Color {
    id: number;
    name: string;
    hexCode: string;
}

export enum TipoAccionesColor {
    OBTENER_LISTA_COLORS_EXITO = 'OBTENER_LISTA_COLORS_EXITO',
    OBTENER_LISTA_COLORS_ERROR = 'OBTENER_LISTA_COLORS_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_COLORS = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_COLORS',

    ACTUALIZAR_COLOR_EXITO = 'ACTUALIZAR_COLOR_EXITO',
    ACTUALIZAR_COLOR_ERROR = 'ACTUALIZAR_COLOR_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_COLOR = 'CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_COLOR',

    CREAR_COLOR_EXITO = 'CREAR_COLOR_EXITO',
    CREAR_COLOR_ERROR = 'CREAR_COLOR_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_CREAR_COLOR = 'CAMBIAR_ESTADO_DE_CARGA_CREAR_COLOR',

    BORRAR_COLOR_EXITO = 'BORRAR_COLOR_EXITO',
    BORRAR_COLOR_ERROR = 'BORRAR_COLOR_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_BORRAR_COLOR = 'CAMBIAR_ESTADO_DE_CARGA_BORRAR_COLOR',

    RESETEAR_ESTADO_COLOR = 'RESETEAR_ESTADO_COLOR',
}

const actualizarColorExito = createAction<Color>(
    TipoAccionesColor.ACTUALIZAR_COLOR_EXITO
);

const actualizarColorError = createAction<Error>(
    TipoAccionesColor.ACTUALIZAR_COLOR_ERROR
);

const cambiarEstadoDeCargaActualizarColor = createAction<boolean>(
    TipoAccionesColor.CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_COLOR
);

const crearColorExito = createAction<Color>(
    TipoAccionesColor.CREAR_COLOR_EXITO
);

const crearColorError = createAction<Error>(
    TipoAccionesColor.CREAR_COLOR_ERROR
);

const cambiarEstadoDeCargaCrearColor = createAction<boolean>(
    TipoAccionesColor.CAMBIAR_ESTADO_DE_CARGA_CREAR_COLOR
);

const borrarColorExito = createAction<number>(
    TipoAccionesColor.BORRAR_COLOR_EXITO
);

const borrarColorError = createAction<Error>(
    TipoAccionesColor.BORRAR_COLOR_ERROR
);

const cambiarEstadoDeCargaBorrarColor = createAction<boolean>(
    TipoAccionesColor.CAMBIAR_ESTADO_DE_CARGA_BORRAR_COLOR
);

const obtenerListaColorsExito = createAction<Color[]>(
    TipoAccionesColor.OBTENER_LISTA_COLORS_EXITO
);

const obtenerListaColorsError = createAction<Error>(
    TipoAccionesColor.OBTENER_LISTA_COLORS_ERROR
);

const cambiarEstadoDeCargaObtenerColors = createAction<boolean>(
    TipoAccionesColor.CAMBIAR_ESTADO_DE_CARGA_OBTENER_COLORS
);

const resetearEstadoColor = createAction<undefined>(
    TipoAccionesColor.RESETEAR_ESTADO_COLOR
);

const obtenerColors = () => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerColors(true));
    try {
        const { data: colorList } = await httpClient.get(colorsUrl);
        dispatch(obtenerListaColorsExito(colorList));
    } catch (error) {
        dispatch(obtenerListaColorsError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerColors(false));
};

const crearColor = (color: Partial<Color>) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaCrearColor(true));
    try {
        const { data: response } = await httpClient.post(colorsUrl, color);
        dispatch(crearColorExito(response));
    } catch (error) {
        dispatch(crearColorError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaCrearColor(false));
};

const actualizarColor = (color: Color) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaActualizarColor(true));
    try {
        const { data: response } = await httpClient.put(
            `${colorsUrl}/${color.id}`,
            color
        );
        dispatch(actualizarColorExito(response));
    } catch (error) {
        dispatch(actualizarColorError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaActualizarColor(false));
};

const borrarColor = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaBorrarColor(true));
    try {
        await httpClient.delete(`${colorsUrl}/${id}`);
        dispatch(borrarColorExito(id));
    } catch (error) {
        dispatch(borrarColorError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaBorrarColor(false));
};

export const AccionesColor = {
    obtenerListaColorsExito,
    obtenerListaColorsError,
    cambiarEstadoDeCargaObtenerColors,
    obtenerColors,
    
    crearColorExito,
    crearColorError,
    cambiarEstadoDeCargaCrearColor,
    crearColor,
    
    actualizarColorExito,
    actualizarColorError,
    cambiarEstadoDeCargaActualizarColor,
    actualizarColor,
    
    borrarColorExito,
    borrarColorError,
    cambiarEstadoDeCargaBorrarColor,
    borrarColor,
    
    resetearEstadoColor
};