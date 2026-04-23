import type { EstadoSize } from '../reducers/size';
import { createSelector } from '@reduxjs/toolkit';

export const sizeStateSelector = (state: any): EstadoSize => state.size;

export const listaSizesSelector = createSelector(
    sizeStateSelector,
    (sizeState) => {
        return sizeState.listaSizes;
    }
);

export const obtenerSizesEnProgresoSelector = createSelector(
    sizeStateSelector,
    (sizeState) => {
        return sizeState.obtenerSizesEnProgreso;
    }
);

export const errorObtenerSizesSelector = createSelector(
    sizeStateSelector,
    (sizeState) => {
        return sizeState.errorObtenerSizes;
    }
);

export const actualizarSizeEnProgresoSelector = createSelector(
    sizeStateSelector,
    (sizeState) => {
        return sizeState.actualizarSizeEnProgreso;
    }
);

export const errorActualizarSizeSelector = createSelector(
    sizeStateSelector,
    (sizeState) => {
        return sizeState.errorActualizarSize;
    }
);

export const borrarSizeEnProgresoSelector = createSelector(
    sizeStateSelector,
    (sizeState) => {
        return sizeState.borrarSizeEnProgreso;
    }
);

export const errorBorrarSizeSelector = createSelector(
    sizeStateSelector,
    (sizeState) => {
        return sizeState.errorBorrarSize;
    }
);

export const crearSizeEnProgresoSelector = createSelector(
    sizeStateSelector,
    (sizeState) => {
        return sizeState.crearSizeEnProgreso;
    }
);

export const errorCrearSizeSelector = createSelector(
    sizeStateSelector,
    (sizeState) => {
        return sizeState.errorCrearSize;
    }
);