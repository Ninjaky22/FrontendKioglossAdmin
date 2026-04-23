import { createReducer } from '@reduxjs/toolkit';
import { AccionesColor, type Color } from '../actions/color';

export interface EstadoColor {
    obtenerColorsEnProgreso: boolean;
    listaColors: Color[] | null;
    errorObtenerColors: { message: string } | null;

    crearColorEnProgreso: boolean;
    errorCrearColor: { message: string } | null;

    actualizarColorEnProgreso: boolean;
    errorActualizarColor: { message: string } | null;

    borrarColorEnProgreso: boolean;
    errorBorrarColor: { message: string } | null;
}

const obtenerEstadoInicial = (): EstadoColor => {
    return {
        obtenerColorsEnProgreso: false,
        listaColors: null,
        errorObtenerColors: null,

        crearColorEnProgreso: false,
        errorCrearColor: null,

        actualizarColorEnProgreso: false,
        errorActualizarColor: null,

        borrarColorEnProgreso: false,
        errorBorrarColor: null,
    };
};

const exitoAlObtenerColors = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.obtenerListaColorsExito>
) => {
    return {
        ...state,
        listaColors: payload,
    };
};

const errorAlObtenerColors = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.obtenerListaColorsError>
) => {
    return {
        ...state,
        errorObtenerColors: { message: payload.message },
    };
};

const cambiarEstadoDeCargaObtenerColors = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.cambiarEstadoDeCargaObtenerColors>
) => {
    return {
        ...state,
        obtenerColorsEnProgreso: payload,
    };
};

const exitoAlCrearColor = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.crearColorExito>
) => {
    return {
        ...state,
        listaColors: state.listaColors?.concat(payload),
    };
};

const errorAlCrearColor = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.crearColorError>
) => {
    return {
        ...state,
        errorCrearColor: { message: payload.message },
    };
};

const cambiarEstadoDeCargaCrearColor = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.cambiarEstadoDeCargaCrearColor>
) => {
    return {
        ...state,
        crearColorEnProgreso: payload,
    };
};

const exitoAlActualizarColor = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.actualizarColorExito>
) => {
    return {
        ...state,
        listaColors: state.listaColors?.map((colorItem) => {
            return colorItem.id !== payload.id ? colorItem : payload;
        }),
    };
};

const errorAlActualizarColor = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.actualizarColorError>
) => {
    return {
        ...state,
        errorActualizarColor: { message: payload.message },
    };
};

const cambiarEstadoDeCargaActualizarColor = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.cambiarEstadoDeCargaActualizarColor>
) => {
    return {
        ...state,
        actualizarColorEnProgreso: payload,
    };
};

const exitoAlBorrarColor = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.borrarColorExito>
) => {
    return {
        ...state,
        listaColors: state.listaColors?.filter((colorItem) => {
            return colorItem.id !== payload;
        }),
    };
};

const errorAlBorrarColor = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.borrarColorError>
) => {
    return {
        ...state,
        errorBorrarColor: { message: payload.message },
    };
};

const cambiarEstadoDeCargaBorrarColor = (
    state: EstadoColor,
    { payload }: ReturnType<typeof AccionesColor.cambiarEstadoDeCargaBorrarColor>
) => {
    return {
        ...state,
        borrarColorEnProgreso: payload,
    };
};

const resetearEstadoColor = () => obtenerEstadoInicial();

const colorReducerBuilder = (builder: any) => {
    builder.addCase(AccionesColor.crearColorExito, exitoAlCrearColor);
    builder.addCase(AccionesColor.crearColorError, errorAlCrearColor);
    builder.addCase(AccionesColor.cambiarEstadoDeCargaCrearColor, cambiarEstadoDeCargaCrearColor);

    builder.addCase(AccionesColor.actualizarColorExito, exitoAlActualizarColor);
    builder.addCase(AccionesColor.actualizarColorError, errorAlActualizarColor);
    builder.addCase(AccionesColor.cambiarEstadoDeCargaActualizarColor, cambiarEstadoDeCargaActualizarColor);

    builder.addCase(AccionesColor.borrarColorExito, exitoAlBorrarColor);
    builder.addCase(AccionesColor.borrarColorError, errorAlBorrarColor);
    builder.addCase(AccionesColor.cambiarEstadoDeCargaBorrarColor, cambiarEstadoDeCargaBorrarColor);

    builder.addCase(AccionesColor.obtenerListaColorsExito, exitoAlObtenerColors);
    builder.addCase(AccionesColor.obtenerListaColorsError, errorAlObtenerColors);
    builder.addCase(AccionesColor.cambiarEstadoDeCargaObtenerColors, cambiarEstadoDeCargaObtenerColors);

    builder.addCase(AccionesColor.resetearEstadoColor, resetearEstadoColor);
};

export const colorReducer = createReducer(
    obtenerEstadoInicial(),
    colorReducerBuilder
);