import type { EstadoColor } from '../reducers/color';
import { createSelector } from '@reduxjs/toolkit';

export const colorStateSelector = (state: any): EstadoColor => state.color;

export const listaColorsSelector = createSelector(
    colorStateSelector,
    (colorState) => {
        return colorState.listaColors;
    }
);

export const obtenerColorsEnProgresoSelector = createSelector(
    colorStateSelector,
    (colorState) => {
        return colorState.obtenerColorsEnProgreso;
    }
);

export const errorObtenerColorsSelector = createSelector(
    colorStateSelector,
    (colorState) => {
        return colorState.errorObtenerColors;
    }
);

export const actualizarColorEnProgresoSelector = createSelector(
    colorStateSelector,
    (colorState) => {
        return colorState.actualizarColorEnProgreso;
    }
);

export const errorActualizarColorSelector = createSelector(
    colorStateSelector,
    (colorState) => {
        return colorState.errorActualizarColor;
    }
);

export const borrarColorEnProgresoSelector = createSelector(
    colorStateSelector,
    (colorState) => {
        return colorState.borrarColorEnProgreso;
    }
);

export const errorBorrarColorSelector = createSelector(
    colorStateSelector,
    (colorState) => {
        return colorState.errorBorrarColor;
    }
);

export const crearColorEnProgresoSelector = createSelector(
    colorStateSelector,
    (colorState) => {
        return colorState.crearColorEnProgreso;
    }
);

export const errorCrearColorSelector = createSelector(
    colorStateSelector,
    (colorState) => {
        return colorState.errorCrearColor;
    }
);