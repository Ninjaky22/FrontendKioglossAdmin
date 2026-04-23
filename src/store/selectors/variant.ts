import type { EstadoVariant } from '../reducers/variant';
import { createSelector } from '@reduxjs/toolkit';

export const variantStateSelector = (state: any): EstadoVariant => state.variant;

export const listaVariantesSelector = createSelector(
    variantStateSelector,
    (variantState) => variantState.listaVariantes
);

export const obtenerVariantesEnProgresoSelector = createSelector(
    variantStateSelector,
    (variantState) => variantState.obtenerVariantesEnProgreso
);

export const crearVarianteEnProgresoSelector = createSelector(
    variantStateSelector,
    (variantState) => variantState.crearVarianteEnProgreso
);
