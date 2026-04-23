import type { EstadoVideo } from '../reducers/video';
import { createSelector } from '@reduxjs/toolkit';

export const videoStateSelector = (state: any): EstadoVideo => state.video;

export const listaVideosSelector = createSelector(
    videoStateSelector,
    (videoState) => videoState.listaVideos
);

export const obtenerVideosEnProgresoSelector = createSelector(
    videoStateSelector,
    (videoState) => videoState.obtenerVideosEnProgreso
);

export const errorObtenerVideosSelector = createSelector(
    videoStateSelector,
    (videoState) => videoState.errorObtenerVideos
);

export const videoActualSelector = createSelector(
    videoStateSelector,
    (videoState) => videoState.videoActual
);

export const obtenerVideoEnProgresoSelector = createSelector(
    videoStateSelector,
    (videoState) => videoState.obtenerVideoEnProgreso
);

export const crearVideoEnProgresoSelector = createSelector(
    videoStateSelector,
    (videoState) => videoState.crearVideoEnProgreso
);

export const actualizarVideoEnProgresoSelector = createSelector(
    videoStateSelector,
    (videoState) => videoState.actualizarVideoEnProgreso
);

export const borrarVideoEnProgresoSelector = createSelector(
    videoStateSelector,
    (videoState) => videoState.borrarVideoEnProgreso
);

export const productosParaVideosSelector = createSelector(
    videoStateSelector,
    (videoState) => videoState.productosParaVideos
);
