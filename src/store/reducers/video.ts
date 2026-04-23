import { createReducer } from '@reduxjs/toolkit';
import { AccionesVideo } from '../actions/video';
import type { VideoReel } from '../../models/VideoReel';
import type { Product } from '../../models/Product';

export interface EstadoVideo {
    obtenerVideosEnProgreso: boolean;
    listaVideos: VideoReel[];
    errorObtenerVideos: { message: string } | null;

    obtenerVideoEnProgreso: boolean;
    videoActual: VideoReel | null;
    errorObtenerVideo: { message: string } | null;

    crearVideoEnProgreso: boolean;
    errorCrearVideo: { message: string } | null;

    actualizarVideoEnProgreso: boolean;
    errorActualizarVideo: { message: string } | null;

    borrarVideoEnProgreso: boolean;
    errorBorrarVideo: { message: string } | null;

    productosParaVideos: Product[];
}

const obtenerEstadoInicialVideo = (): EstadoVideo => ({
    obtenerVideosEnProgreso: false,
    listaVideos: [],
    errorObtenerVideos: null,

    obtenerVideoEnProgreso: false,
    videoActual: null,
    errorObtenerVideo: null,

    crearVideoEnProgreso: false,
    errorCrearVideo: null,

    actualizarVideoEnProgreso: false,
    errorActualizarVideo: null,

    borrarVideoEnProgreso: false,
    errorBorrarVideo: null,

    productosParaVideos: [],
});

const videoReducerBuilder = (builder: any) => {
    // Lista
    builder.addCase(AccionesVideo.obtenerListaVideosExito, (state: EstadoVideo, { payload }: any) => ({
        ...state, listaVideos: payload, errorObtenerVideos: null,
    }));
    builder.addCase(AccionesVideo.obtenerListaVideosError, (state: EstadoVideo, { payload }: any) => ({
        ...state, errorObtenerVideos: { message: payload.message },
    }));
    builder.addCase(AccionesVideo.cambiarEstadoDeCargaObtenerVideos, (state: EstadoVideo, { payload }: any) => ({
        ...state, obtenerVideosEnProgreso: payload,
    }));

    // Individual
    builder.addCase(AccionesVideo.obtenerVideoExito, (state: EstadoVideo, { payload }: any) => ({
        ...state, videoActual: payload, errorObtenerVideo: null,
    }));
    builder.addCase(AccionesVideo.obtenerVideoError, (state: EstadoVideo, { payload }: any) => ({
        ...state, errorObtenerVideo: { message: payload.message },
    }));
    builder.addCase(AccionesVideo.cambiarEstadoDeCargaObtenerVideo, (state: EstadoVideo, { payload }: any) => ({
        ...state, obtenerVideoEnProgreso: payload,
    }));

    // Crear
    builder.addCase(AccionesVideo.crearVideoExito, (state: EstadoVideo, { payload }: any) => ({
        ...state,
        listaVideos: [payload, ...state.listaVideos],
        videoActual: payload,
        errorCrearVideo: null,
    }));
    builder.addCase(AccionesVideo.crearVideoError, (state: EstadoVideo, { payload }: any) => ({
        ...state, errorCrearVideo: { message: payload.message },
    }));
    builder.addCase(AccionesVideo.cambiarEstadoDeCargaCrearVideo, (state: EstadoVideo, { payload }: any) => ({
        ...state, crearVideoEnProgreso: payload,
    }));

    // Actualizar
    builder.addCase(AccionesVideo.actualizarVideoExito, (state: EstadoVideo, { payload }: any) => ({
        ...state,
        listaVideos: state.listaVideos.map((v: VideoReel) => v.id !== payload.id ? v : payload),
        videoActual: payload,
        errorActualizarVideo: null,
    }));
    builder.addCase(AccionesVideo.actualizarVideoError, (state: EstadoVideo, { payload }: any) => ({
        ...state, errorActualizarVideo: { message: payload.message },
    }));
    builder.addCase(AccionesVideo.cambiarEstadoDeCargaActualizarVideo, (state: EstadoVideo, { payload }: any) => ({
        ...state, actualizarVideoEnProgreso: payload,
    }));

    // Borrar
    builder.addCase(AccionesVideo.borrarVideoExito, (state: EstadoVideo, { payload }: any) => ({
        ...state,
        listaVideos: state.listaVideos.filter((v: VideoReel) => v.id !== payload),
        errorBorrarVideo: null,
    }));
    builder.addCase(AccionesVideo.borrarVideoError, (state: EstadoVideo, { payload }: any) => ({
        ...state, errorBorrarVideo: { message: payload.message },
    }));
    builder.addCase(AccionesVideo.cambiarEstadoDeCargaBorrarVideo, (state: EstadoVideo, { payload }: any) => ({
        ...state, borrarVideoEnProgreso: payload,
    }));

    // Productos para select
    builder.addCase(AccionesVideo.obtenerProductosParaVideosExito, (state: EstadoVideo, { payload }: any) => ({
        ...state, productosParaVideos: payload,
    }));

    // Limpiar
    builder.addCase(AccionesVideo.limpiarVideoActual, (state: EstadoVideo) => ({
        ...state, videoActual: null, errorObtenerVideo: null,
    }));
};

export const videoReducer = createReducer(
    obtenerEstadoInicialVideo(),
    videoReducerBuilder
);
