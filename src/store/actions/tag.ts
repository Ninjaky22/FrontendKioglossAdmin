import { createAction, type Dispatch } from '@reduxjs/toolkit';
import httpClient from '../../services/httpClient';
import { tagsUrl } from '../../constants/serviceUrl';

export interface Tag {
    id: number;
    name: string;
    imageURL?: string;
}

export enum TipoAccionesTag {
    OBTENER_LISTA_TAGS_EXITO = 'OBTENER_LISTA_TAGS_EXITO',
    OBTENER_LISTA_TAGS_ERROR = 'OBTENER_LISTA_TAGS_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_TAGS = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_TAGS',

    ACTUALIZAR_TAG_EXITO = 'ACTUALIZAR_TAG_EXITO',
    ACTUALIZAR_TAG_ERROR = 'ACTUALIZAR_TAG_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_TAG = 'CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_TAG',

    CREAR_TAG_EXITO = 'CREAR_TAG_EXITO',
    CREAR_TAG_ERROR = 'CREAR_TAG_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_CREAR_TAG = 'CAMBIAR_ESTADO_DE_CARGA_CREAR_TAG',

    BORRAR_TAG_EXITO = 'BORRAR_TAG_EXITO',
    BORRAR_TAG_ERROR = 'BORRAR_TAG_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_BORRAR_TAG = 'CAMBIAR_ESTADO_DE_CARGA_BORRAR_TAG',

    RESETEAR_ESTADO_TAG = 'RESETEAR_ESTADO_TAG',
}

const actualizarTagExito = createAction<Tag>(
    TipoAccionesTag.ACTUALIZAR_TAG_EXITO
);

const actualizarTagError = createAction<Error>(
    TipoAccionesTag.ACTUALIZAR_TAG_ERROR
);

const cambiarEstadoDeCargaActualizarTag = createAction<boolean>(
    TipoAccionesTag.CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_TAG
);

const crearTagExito = createAction<Tag>(
    TipoAccionesTag.CREAR_TAG_EXITO
);

const crearTagError = createAction<Error>(
    TipoAccionesTag.CREAR_TAG_ERROR
);

const cambiarEstadoDeCargaCrearTag = createAction<boolean>(
    TipoAccionesTag.CAMBIAR_ESTADO_DE_CARGA_CREAR_TAG
);

const borrarTagExito = createAction<number>(
    TipoAccionesTag.BORRAR_TAG_EXITO
);

const borrarTagError = createAction<Error>(
    TipoAccionesTag.BORRAR_TAG_ERROR
);

const cambiarEstadoDeCargaBorrarTag = createAction<boolean>(
    TipoAccionesTag.CAMBIAR_ESTADO_DE_CARGA_BORRAR_TAG
);

const obtenerListaTagsExito = createAction<Tag[]>(
    TipoAccionesTag.OBTENER_LISTA_TAGS_EXITO
);

const obtenerListaTagsError = createAction<Error>(
    TipoAccionesTag.OBTENER_LISTA_TAGS_ERROR
);

const cambiarEstadoDeCargaObtenerTags = createAction<boolean>(
    TipoAccionesTag.CAMBIAR_ESTADO_DE_CARGA_OBTENER_TAGS
);

const resetearEstadoTag = createAction<undefined>(
    TipoAccionesTag.RESETEAR_ESTADO_TAG
);

const obtenerTags = () => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerTags(true));
    try {
        const { data: tagList } = await httpClient.get(tagsUrl);
        dispatch(obtenerListaTagsExito(tagList));
    } catch (error) {
        dispatch(obtenerListaTagsError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerTags(false));
};

const crearTag = (tag: Partial<Tag>) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaCrearTag(true));
    try {
        const { data: response } = await httpClient.post(tagsUrl, tag);
        dispatch(crearTagExito(response));
    } catch (error) {
        dispatch(crearTagError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaCrearTag(false));
};

const actualizarTag = (tag: Tag) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaActualizarTag(true));
    try {
        const { data: response } = await httpClient.put(
            `${tagsUrl}/${tag.id}`,
            tag
        );
        dispatch(actualizarTagExito(response));
    } catch (error) {
        dispatch(actualizarTagError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaActualizarTag(false));
};

const borrarTag = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaBorrarTag(true));
    try {
        await httpClient.delete(`${tagsUrl}/${id}`);
        dispatch(borrarTagExito(id));
    } catch (error) {
        dispatch(borrarTagError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaBorrarTag(false));
};

export const AccionesTag = {
    obtenerListaTagsExito,
    obtenerListaTagsError,
    cambiarEstadoDeCargaObtenerTags,
    obtenerTags,
    
    crearTagExito,
    crearTagError,
    cambiarEstadoDeCargaCrearTag,
    crearTag,
    
    actualizarTagExito,
    actualizarTagError,
    cambiarEstadoDeCargaActualizarTag,
    actualizarTag,
    
    borrarTagExito,
    borrarTagError,
    cambiarEstadoDeCargaBorrarTag,
    borrarTag,
    
    resetearEstadoTag
};