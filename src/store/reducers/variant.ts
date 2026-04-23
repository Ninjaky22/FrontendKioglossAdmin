import { createReducer } from '@reduxjs/toolkit';
import { TipoAccionesVariant } from '../actions/variant';
import type { VariantTypeDTO } from '../../models/Variant';

export interface EstadoVariant {
    obtenerVariantesEnProgreso: boolean;
    listaVariantes: VariantTypeDTO[];
    errorObtenerVariantes: { message: string } | null;

    crearVarianteEnProgreso: boolean;
    errorCrearVariante: { message: string } | null;

    eliminarVarianteEnProgreso: boolean;
    errorEliminarVariante: { message: string } | null;
}

const obtenerEstadoInicialVariant = (): EstadoVariant => ({
    obtenerVariantesEnProgreso: false,
    listaVariantes: [],
    errorObtenerVariantes: null,

    crearVarianteEnProgreso: false,
    errorCrearVariante: null,

    eliminarVarianteEnProgreso: false,
    errorEliminarVariante: null,
});

const variantReducerBuilder = (builder: any) => {
    builder.addCase(TipoAccionesVariant.OBTENER_VARIANTES_EXITO, (state: EstadoVariant, { payload }: any) => ({
        ...state, listaVariantes: payload, errorObtenerVariantes: null,
    }));
    builder.addCase(TipoAccionesVariant.OBTENER_VARIANTES_ERROR, (state: EstadoVariant, { payload }: any) => ({
        ...state, errorObtenerVariantes: { message: payload.message },
    }));
    builder.addCase(TipoAccionesVariant.CAMBIAR_ESTADO_DE_CARGA_OBTENER_VARIANTES, (state: EstadoVariant, { payload }: any) => ({
        ...state, obtenerVariantesEnProgreso: payload,
    }));

    builder.addCase(TipoAccionesVariant.CREAR_VARIANTE_EXITO, (state: EstadoVariant, { payload }: any) => ({
        ...state, listaVariantes: [...state.listaVariantes, payload], errorCrearVariante: null,
    }));
    builder.addCase(TipoAccionesVariant.CREAR_VARIANTE_ERROR, (state: EstadoVariant, { payload }: any) => ({
        ...state, errorCrearVariante: { message: payload.message },
    }));
    builder.addCase(TipoAccionesVariant.CAMBIAR_ESTADO_DE_CARGA_CREAR_VARIANTE, (state: EstadoVariant, { payload }: any) => ({
        ...state, crearVarianteEnProgreso: payload,
    }));

    builder.addCase(TipoAccionesVariant.ACTUALIZAR_VARIANTE_EXITO, (state: EstadoVariant, { payload }: any) => ({
        ...state, listaVariantes: state.listaVariantes.map(v => v.id === payload.id ? payload : v), errorCrearVariante: null,
    }));
    builder.addCase(TipoAccionesVariant.ACTUALIZAR_VARIANTE_ERROR, (state: EstadoVariant, { payload }: any) => ({
        ...state, errorCrearVariante: { message: payload.message },
    }));
    builder.addCase(TipoAccionesVariant.CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_VARIANTE, (state: EstadoVariant, { payload }: any) => ({
        ...state, crearVarianteEnProgreso: payload,
    }));

    builder.addCase(TipoAccionesVariant.ELIMINAR_VARIANTE_EXITO, (state: EstadoVariant, { payload }: any) => ({
        ...state, listaVariantes: state.listaVariantes.filter(v => v.id !== payload), errorEliminarVariante: null,
    }));
    builder.addCase(TipoAccionesVariant.ELIMINAR_VARIANTE_ERROR, (state: EstadoVariant, { payload }: any) => ({
        ...state, errorEliminarVariante: { message: payload.message },
    }));
    builder.addCase(TipoAccionesVariant.CAMBIAR_ESTADO_DE_CARGA_ELIMINAR_VARIANTE, (state: EstadoVariant, { payload }: any) => ({
        ...state, eliminarVarianteEnProgreso: payload,
    }));
};

export const variantReducer = createReducer(obtenerEstadoInicialVariant(), variantReducerBuilder);
