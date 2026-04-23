import { createReducer } from '@reduxjs/toolkit';
import { AccionesTag, type Tag } from '../actions/tag';

export interface EstadoTag {
    obtenerTagsEnProgreso: boolean;
    listaTags: Tag[] | null;
    errorObtenerTags: { message: string } | null;

    crearTagEnProgreso: boolean;
    errorCrearTag: { message: string } | null;

    actualizarTagEnProgreso: boolean;
    errorActualizarTag: { message: string } | null;

    borrarTagEnProgreso: boolean;
    errorBorrarTag: { message: string } | null;
}

const obtenerEstadoInicial = (): EstadoTag => {
    return {
        obtenerTagsEnProgreso: false,
        listaTags: null,
        errorObtenerTags: null,

        crearTagEnProgreso: false,
        errorCrearTag: null,

        actualizarTagEnProgreso: false,
        errorActualizarTag: null,

        borrarTagEnProgreso: false,
        errorBorrarTag: null,
    };
};

const exitoAlObtenerTags = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.obtenerListaTagsExito>
) => {
    return {
        ...state,
        listaTags: payload,
    };
};

const errorAlObtenerTags = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.obtenerListaTagsError>
) => {
    return {
        ...state,
        errorObtenerTags: { message: payload.message },
    };
};

const cambiarEstadoDeCargaObtenerTags = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.cambiarEstadoDeCargaObtenerTags>
) => {
    return {
        ...state,
        obtenerTagsEnProgreso: payload,
    };
};

const exitoAlCrearTag = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.crearTagExito>
) => {
    return {
        ...state,
        listaTags: state.listaTags?.concat(payload),
    };
};

const errorAlCrearTag = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.crearTagError>
) => {
    return {
        ...state,
        errorCrearTag: { message: payload.message },
    };
};

const cambiarEstadoDeCargaCrearTag = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.cambiarEstadoDeCargaCrearTag>
) => {
    return {
        ...state,
        crearTagEnProgreso: payload,
    };
};

const exitoAlActualizarTag = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.actualizarTagExito>
) => {
    return {
        ...state,
        listaTags: state.listaTags?.map((tagItem) => {
            return tagItem.id !== payload.id ? tagItem : payload;
        }),
    };
};

const errorAlActualizarTag = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.actualizarTagError>
) => {
    return {
        ...state,
        errorActualizarTag: { message: payload.message },
    };
};

const cambiarEstadoDeCargaActualizarTag = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.cambiarEstadoDeCargaActualizarTag>
) => {
    return {
        ...state,
        actualizarTagEnProgreso: payload,
    };
};

const exitoAlBorrarTag = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.borrarTagExito>
) => {
    return {
        ...state,
        listaTags: state.listaTags?.filter((tagItem) => {
            return tagItem.id !== payload;
        }),
    };
};

const errorAlBorrarTag = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.borrarTagError>
) => {
    return {
        ...state,
        errorBorrarTag: { message: payload.message },
    };
};

const cambiarEstadoDeCargaBorrarTag = (
    state: EstadoTag,
    { payload }: ReturnType<typeof AccionesTag.cambiarEstadoDeCargaBorrarTag>
) => {
    return {
        ...state,
        borrarTagEnProgreso: payload,
    };
};

const resetearEstadoTag = () => obtenerEstadoInicial();

const tagReducerBuilder = (builder: any) => {
    builder.addCase(AccionesTag.crearTagExito, exitoAlCrearTag);
    builder.addCase(AccionesTag.crearTagError, errorAlCrearTag);
    builder.addCase(AccionesTag.cambiarEstadoDeCargaCrearTag, cambiarEstadoDeCargaCrearTag);

    builder.addCase(AccionesTag.actualizarTagExito, exitoAlActualizarTag);
    builder.addCase(AccionesTag.actualizarTagError, errorAlActualizarTag);
    builder.addCase(AccionesTag.cambiarEstadoDeCargaActualizarTag, cambiarEstadoDeCargaActualizarTag);

    builder.addCase(AccionesTag.borrarTagExito, exitoAlBorrarTag);
    builder.addCase(AccionesTag.borrarTagError, errorAlBorrarTag);
    builder.addCase(AccionesTag.cambiarEstadoDeCargaBorrarTag, cambiarEstadoDeCargaBorrarTag);

    builder.addCase(AccionesTag.obtenerListaTagsExito, exitoAlObtenerTags);
    builder.addCase(AccionesTag.obtenerListaTagsError, errorAlObtenerTags);
    builder.addCase(AccionesTag.cambiarEstadoDeCargaObtenerTags, cambiarEstadoDeCargaObtenerTags);

    builder.addCase(AccionesTag.resetearEstadoTag, resetearEstadoTag);
};

export const tagReducer = createReducer(
    obtenerEstadoInicial(),
    tagReducerBuilder
);