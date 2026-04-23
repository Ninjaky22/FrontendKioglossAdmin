import type { EstadoTag } from '../reducers/tag';
import { createSelector } from '@reduxjs/toolkit';

export const tagStateSelector = (state: any): EstadoTag => state.tag;

export const listaTagsSelector = createSelector(
    tagStateSelector,
    (tagState) => {
        return tagState.listaTags;
    }
);

export const obtenerTagsEnProgresoSelector = createSelector(
    tagStateSelector,
    (tagState) => {
        return tagState.obtenerTagsEnProgreso;
    }
);

export const errorObtenerTagsSelector = createSelector(
    tagStateSelector,
    (tagState) => {
        return tagState.errorObtenerTags;
    }
);

export const actualizarTagEnProgresoSelector = createSelector(
    tagStateSelector,
    (tagState) => {
        return tagState.actualizarTagEnProgreso;
    }
);

export const errorActualizarTagSelector = createSelector(
    tagStateSelector,
    (tagState) => {
        return tagState.errorActualizarTag;
    }
);

export const borrarTagEnProgresoSelector = createSelector(
    tagStateSelector,
    (tagState) => {
        return tagState.borrarTagEnProgreso;
    }
);

export const errorBorrarTagSelector = createSelector(
    tagStateSelector,
    (tagState) => {
        return tagState.errorBorrarTag;
    }
);

export const crearTagEnProgresoSelector = createSelector(
    tagStateSelector,
    (tagState) => {
        return tagState.crearTagEnProgreso;
    }
);

export const errorCrearTagSelector = createSelector(
    tagStateSelector,
    (tagState) => {
        return tagState.errorCrearTag;
    }
);