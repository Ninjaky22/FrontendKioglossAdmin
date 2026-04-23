import { createReducer } from '@reduxjs/toolkit';
import { AccionesSize, type Size } from '../actions/size';

export interface EstadoSize {
    obtenerSizesEnProgreso: boolean;
    listaSizes: Size[] | null;
    errorObtenerSizes: { message: string } | null;

    crearSizeEnProgreso: boolean;
    errorCrearSize: { message: string } | null;

    actualizarSizeEnProgreso: boolean;
    errorActualizarSize: { message: string } | null;

    borrarSizeEnProgreso: boolean;
    errorBorrarSize: { message: string } | null;
}

const obtenerEstadoInicial = (): EstadoSize => {
    return {
        obtenerSizesEnProgreso: false,
        listaSizes: null,
        errorObtenerSizes: null,

        crearSizeEnProgreso: false,
        errorCrearSize: null,

        actualizarSizeEnProgreso: false,
        errorActualizarSize: null,

        borrarSizeEnProgreso: false,
        errorBorrarSize: null,
    };
};

const exitoAlObtenerSizes = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.obtenerListaSizesExito>
) => {
    return {
        ...state,
        listaSizes: payload,
    };
};

const errorAlObtenerSizes = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.obtenerListaSizesError>
) => {
    return {
        ...state,
        errorObtenerSizes: { message: payload.message },
    };
};

const cambiarEstadoDeCargaObtenerSizes = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.cambiarEstadoDeCargaObtenerSizes>
) => {
    return {
        ...state,
        obtenerSizesEnProgreso: payload,
    };
};

const exitoAlCrearSize = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.crearSizeExito>
) => {
    return {
        ...state,
        listaSizes: state.listaSizes?.concat(payload),
    };
};

const errorAlCrearSize = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.crearSizeError>
) => {
    return {
        ...state,
        errorCrearSize: { message: payload.message },
    };
};

const cambiarEstadoDeCargaCrearSize = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.cambiarEstadoDeCargaCrearSize>
) => {
    return {
        ...state,
        crearSizeEnProgreso: payload,
    };
};

const exitoAlActualizarSize = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.actualizarSizeExito>
) => {
    return {
        ...state,
        listaSizes: state.listaSizes?.map((sizeItem) => {
            return sizeItem.id !== payload.id ? sizeItem : payload;
        }),
    };
};

const errorAlActualizarSize = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.actualizarSizeError>
) => {
    return {
        ...state,
        errorActualizarSize: { message: payload.message },
    };
};

const cambiarEstadoDeCargaActualizarSize = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.cambiarEstadoDeCargaActualizarSize>
) => {
    return {
        ...state,
        actualizarSizeEnProgreso: payload,
    };
};

const exitoAlBorrarSize = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.borrarSizeExito>
) => {
    return {
        ...state,
        listaSizes: state.listaSizes?.filter((sizeItem) => {
            return sizeItem.id !== payload;
        }),
    };
};

const errorAlBorrarSize = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.borrarSizeError>
) => {
    return {
        ...state,
        errorBorrarSize: { message: payload.message },
    };
};

const cambiarEstadoDeCargaBorrarSize = (
    state: EstadoSize,
    { payload }: ReturnType<typeof AccionesSize.cambiarEstadoDeCargaBorrarSize>
) => {
    return {
        ...state,
        borrarSizeEnProgreso: payload,
    };
};

const resetearEstadoSize = () => obtenerEstadoInicial();

const sizeReducerBuilder = (builder: any) => {
    builder.addCase(AccionesSize.crearSizeExito, exitoAlCrearSize);
    builder.addCase(AccionesSize.crearSizeError, errorAlCrearSize);
    builder.addCase(AccionesSize.cambiarEstadoDeCargaCrearSize, cambiarEstadoDeCargaCrearSize);

    builder.addCase(AccionesSize.actualizarSizeExito, exitoAlActualizarSize);
    builder.addCase(AccionesSize.actualizarSizeError, errorAlActualizarSize);
    builder.addCase(AccionesSize.cambiarEstadoDeCargaActualizarSize, cambiarEstadoDeCargaActualizarSize);

    builder.addCase(AccionesSize.borrarSizeExito, exitoAlBorrarSize);
    builder.addCase(AccionesSize.borrarSizeError, errorAlBorrarSize);
    builder.addCase(AccionesSize.cambiarEstadoDeCargaBorrarSize, cambiarEstadoDeCargaBorrarSize);

    builder.addCase(AccionesSize.obtenerListaSizesExito, exitoAlObtenerSizes);
    builder.addCase(AccionesSize.obtenerListaSizesError, errorAlObtenerSizes);
    builder.addCase(AccionesSize.cambiarEstadoDeCargaObtenerSizes, cambiarEstadoDeCargaObtenerSizes);

    builder.addCase(AccionesSize.resetearEstadoSize, resetearEstadoSize);
};

export const sizeReducer = createReducer(
    obtenerEstadoInicial(),
    sizeReducerBuilder
);