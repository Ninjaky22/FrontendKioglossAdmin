import { createAction, type Dispatch } from '@reduxjs/toolkit';
import httpClient from '../../services/httpClient';
import type { VideoReel, CreateVideoRequest, UpdateVideoRequest } from '../../models/VideoReel';
import { videosUrl, productsUrl } from '../../constants/serviceUrl';
import type { Product } from '../../models/Product';

export enum TipoAccionesVideo {
    OBTENER_LISTA_VIDEOS_EXITO = 'OBTENER_LISTA_VIDEOS_EXITO',
    OBTENER_LISTA_VIDEOS_ERROR = 'OBTENER_LISTA_VIDEOS_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_VIDEOS = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_VIDEOS',

    OBTENER_VIDEO_EXITO = 'OBTENER_VIDEO_EXITO',
    OBTENER_VIDEO_ERROR = 'OBTENER_VIDEO_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_VIDEO = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_VIDEO',

    CREAR_VIDEO_EXITO = 'CREAR_VIDEO_EXITO',
    CREAR_VIDEO_ERROR = 'CREAR_VIDEO_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_CREAR_VIDEO = 'CAMBIAR_ESTADO_DE_CARGA_CREAR_VIDEO',

    ACTUALIZAR_VIDEO_EXITO = 'ACTUALIZAR_VIDEO_EXITO',
    ACTUALIZAR_VIDEO_ERROR = 'ACTUALIZAR_VIDEO_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_VIDEO = 'CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_VIDEO',

    BORRAR_VIDEO_EXITO = 'BORRAR_VIDEO_EXITO',
    BORRAR_VIDEO_ERROR = 'BORRAR_VIDEO_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_BORRAR_VIDEO = 'CAMBIAR_ESTADO_DE_CARGA_BORRAR_VIDEO',

    OBTENER_PRODUCTOS_PARA_VIDEOS_EXITO = 'OBTENER_PRODUCTOS_PARA_VIDEOS_EXITO',

    LIMPIAR_VIDEO_ACTUAL = 'LIMPIAR_VIDEO_ACTUAL',
}

const obtenerListaVideosExito = createAction<VideoReel[]>(TipoAccionesVideo.OBTENER_LISTA_VIDEOS_EXITO);
const obtenerListaVideosError = createAction<Error>(TipoAccionesVideo.OBTENER_LISTA_VIDEOS_ERROR);
const cambiarEstadoDeCargaObtenerVideos = createAction<boolean>(TipoAccionesVideo.CAMBIAR_ESTADO_DE_CARGA_OBTENER_VIDEOS);

const obtenerVideoExito = createAction<VideoReel>(TipoAccionesVideo.OBTENER_VIDEO_EXITO);
const obtenerVideoError = createAction<Error>(TipoAccionesVideo.OBTENER_VIDEO_ERROR);
const cambiarEstadoDeCargaObtenerVideo = createAction<boolean>(TipoAccionesVideo.CAMBIAR_ESTADO_DE_CARGA_OBTENER_VIDEO);

const crearVideoExito = createAction<VideoReel>(TipoAccionesVideo.CREAR_VIDEO_EXITO);
const crearVideoError = createAction<Error>(TipoAccionesVideo.CREAR_VIDEO_ERROR);
const cambiarEstadoDeCargaCrearVideo = createAction<boolean>(TipoAccionesVideo.CAMBIAR_ESTADO_DE_CARGA_CREAR_VIDEO);

const actualizarVideoExito = createAction<VideoReel>(TipoAccionesVideo.ACTUALIZAR_VIDEO_EXITO);
const actualizarVideoError = createAction<Error>(TipoAccionesVideo.ACTUALIZAR_VIDEO_ERROR);
const cambiarEstadoDeCargaActualizarVideo = createAction<boolean>(TipoAccionesVideo.CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_VIDEO);

const borrarVideoExito = createAction<number>(TipoAccionesVideo.BORRAR_VIDEO_EXITO);
const borrarVideoError = createAction<Error>(TipoAccionesVideo.BORRAR_VIDEO_ERROR);
const cambiarEstadoDeCargaBorrarVideo = createAction<boolean>(TipoAccionesVideo.CAMBIAR_ESTADO_DE_CARGA_BORRAR_VIDEO);

const obtenerProductosParaVideosExito = createAction<Product[]>(TipoAccionesVideo.OBTENER_PRODUCTOS_PARA_VIDEOS_EXITO);
const limpiarVideoActual = createAction<undefined>(TipoAccionesVideo.LIMPIAR_VIDEO_ACTUAL);

// Thunks
const obtenerVideos = () => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerVideos(true));
    try {
        const { data } = await httpClient.get(videosUrl);
        dispatch(obtenerListaVideosExito(data));
    } catch (error) {
        dispatch(obtenerListaVideosError(JSON.parse(JSON.stringify(error)) as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerVideos(false));
};

const obtenerVideoPorId = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerVideo(true));
    try {
        const { data: allVideos } = await httpClient.get(videosUrl);
        const video = allVideos.find((v: VideoReel) => v.id === id);
        if (video) {
            dispatch(obtenerVideoExito(video));
        } else {
            dispatch(obtenerVideoError(new Error('Video no encontrado')));
        }
    } catch (error) {
        dispatch(obtenerVideoError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerVideo(false));
};

const crearVideo = (video: CreateVideoRequest) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaCrearVideo(true));
    try {
        const { data: response } = await httpClient.post(videosUrl, video);
        dispatch(crearVideoExito(response));
        return response;
    } catch (error) {
        dispatch(crearVideoError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaCrearVideo(false));
    }
};

const actualizarVideo = (id: number, video: UpdateVideoRequest) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaActualizarVideo(true));
    try {
        const { data: response } = await httpClient.put(`${videosUrl}/${id}`, video);
        dispatch(actualizarVideoExito(response));
        return response;
    } catch (error) {
        dispatch(actualizarVideoError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaActualizarVideo(false));
    }
};

const borrarVideo = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaBorrarVideo(true));
    try {
        await httpClient.delete(`${videosUrl}/${id}`);
        dispatch(borrarVideoExito(id));
    } catch (error) {
        dispatch(borrarVideoError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaBorrarVideo(false));
    }
};

const obtenerProductosParaVideos = () => async (dispatch: Dispatch) => {
    try {
        const { data } = await httpClient.get(productsUrl, { params: { page: 0, page_size: 100 } });
        dispatch(obtenerProductosParaVideosExito(data.content || []));
    } catch (error) {
        console.error('Error loading products for videos:', error);
    }
};

export const AccionesVideo = {
    obtenerListaVideosExito,
    obtenerListaVideosError,
    cambiarEstadoDeCargaObtenerVideos,
    obtenerVideos,

    obtenerVideoExito,
    obtenerVideoError,
    cambiarEstadoDeCargaObtenerVideo,
    obtenerVideoPorId,

    crearVideoExito,
    crearVideoError,
    cambiarEstadoDeCargaCrearVideo,
    crearVideo,

    actualizarVideoExito,
    actualizarVideoError,
    cambiarEstadoDeCargaActualizarVideo,
    actualizarVideo,

    borrarVideoExito,
    borrarVideoError,
    cambiarEstadoDeCargaBorrarVideo,
    borrarVideo,

    obtenerProductosParaVideosExito,
    obtenerProductosParaVideos,

    limpiarVideoActual,
};
