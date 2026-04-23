import { createAction, type Dispatch } from '@reduxjs/toolkit';
import httpClient from '../../services/httpClient';
import type { VariantTypeDTO, VariantTypeCreateRequest } from '../../models/Variant';
import { variantsUrl } from '../../constants/serviceUrl';

export enum TipoAccionesVariant {
    OBTENER_VARIANTES_EXITO = 'OBTENER_VARIANTES_EXITO',
    OBTENER_VARIANTES_ERROR = 'OBTENER_VARIANTES_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_VARIANTES = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_VARIANTES',

    CREAR_VARIANTE_EXITO = 'CREAR_VARIANTE_EXITO',
    CREAR_VARIANTE_ERROR = 'CREAR_VARIANTE_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_CREAR_VARIANTE = 'CAMBIAR_ESTADO_DE_CARGA_CREAR_VARIANTE',

    ACTUALIZAR_VARIANTE_EXITO = 'ACTUALIZAR_VARIANTE_EXITO',
    ACTUALIZAR_VARIANTE_ERROR = 'ACTUALIZAR_VARIANTE_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_VARIANTE = 'CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_VARIANTE',

    ELIMINAR_VARIANTE_EXITO = 'ELIMINAR_VARIANTE_EXITO',
    ELIMINAR_VARIANTE_ERROR = 'ELIMINAR_VARIANTE_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_ELIMINAR_VARIANTE = 'CAMBIAR_ESTADO_DE_CARGA_ELIMINAR_VARIANTE',
}

const obtenerVariantesExito = createAction<VariantTypeDTO[]>(TipoAccionesVariant.OBTENER_VARIANTES_EXITO);
const obtenerVariantesError = createAction<Error>(TipoAccionesVariant.OBTENER_VARIANTES_ERROR);
const cambiarEstadoDeCargaObtenerVariantes = createAction<boolean>(TipoAccionesVariant.CAMBIAR_ESTADO_DE_CARGA_OBTENER_VARIANTES);

const crearVarianteExito = createAction<VariantTypeDTO>(TipoAccionesVariant.CREAR_VARIANTE_EXITO);
const crearVarianteError = createAction<Error>(TipoAccionesVariant.CREAR_VARIANTE_ERROR);
const cambiarEstadoDeCargaCrearVariante = createAction<boolean>(TipoAccionesVariant.CAMBIAR_ESTADO_DE_CARGA_CREAR_VARIANTE);

const actualizarVarianteExito = createAction<VariantTypeDTO>(TipoAccionesVariant.ACTUALIZAR_VARIANTE_EXITO);
const actualizarVarianteError = createAction<Error>(TipoAccionesVariant.ACTUALIZAR_VARIANTE_ERROR);
const cambiarEstadoDeCargaActualizarVariante = createAction<boolean>(TipoAccionesVariant.CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_VARIANTE);

const eliminarVarianteExito = createAction<number>(TipoAccionesVariant.ELIMINAR_VARIANTE_EXITO);
const eliminarVarianteError = createAction<Error>(TipoAccionesVariant.ELIMINAR_VARIANTE_ERROR);
const cambiarEstadoDeCargaEliminarVariante = createAction<boolean>(TipoAccionesVariant.CAMBIAR_ESTADO_DE_CARGA_ELIMINAR_VARIANTE);

const obtenerVariantes = () => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerVariantes(true));
    try {
        const { data } = await httpClient.get(variantsUrl);
        dispatch(obtenerVariantesExito(data));
    } catch (error) {
        dispatch(obtenerVariantesError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerVariantes(false));
};

const crearVariante = (request: VariantTypeCreateRequest) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaCrearVariante(true));
    try {
        const { data } = await httpClient.post(variantsUrl, request);
        dispatch(crearVarianteExito(data));
    } catch (error) {
        dispatch(crearVarianteError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaCrearVariante(false));
    }
};

const actualizarVariante = (id: number, request: VariantTypeCreateRequest) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaActualizarVariante(true));
    try {
        const { data } = await httpClient.put(`${variantsUrl}/${id}`, request);
        dispatch(actualizarVarianteExito(data));
    } catch (error) {
        dispatch(actualizarVarianteError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaActualizarVariante(false));
    }
};

const eliminarVariante = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaEliminarVariante(true));
    try {
        await httpClient.delete(`${variantsUrl}/${id}`);
        dispatch(eliminarVarianteExito(id));
    } catch (error) {
        dispatch(eliminarVarianteError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaEliminarVariante(false));
    }
};

export const AccionesVariant = {
    obtenerVariantes,
    crearVariante,
    actualizarVariante,
    eliminarVariante,
};
