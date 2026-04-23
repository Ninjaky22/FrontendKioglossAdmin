import { createReducer } from '@reduxjs/toolkit';
import { AccionesUser } from '../actions/user';
import type { PaginaUser, UserDetailDTO } from '../../models/User';

export interface EstadoUser {
    obtenerUsersEnProgreso: boolean;
    listaUsers: PaginaUser | null;
    errorObtenerUsers: { message: string } | null;

    obtenerUserEnProgreso: boolean;
    userActual: UserDetailDTO | null;
    errorObtenerUser: { message: string } | null;

    actualizarUserEnProgreso: boolean;
    errorActualizarUser: { message: string } | null;
}

const obtenerEstadoInicialUser = (): EstadoUser => ({
    obtenerUsersEnProgreso: false,
    listaUsers: null,
    errorObtenerUsers: null,

    obtenerUserEnProgreso: false,
    userActual: null,
    errorObtenerUser: null,

    actualizarUserEnProgreso: false,
    errorActualizarUser: null,
});

const userReducerBuilder = (builder: any) => {
    builder.addCase(AccionesUser.obtenerListaUsersExito, (state: EstadoUser, { payload }: any) => ({
        ...state, listaUsers: payload, errorObtenerUsers: null,
    }));
    builder.addCase(AccionesUser.obtenerListaUsersError, (state: EstadoUser, { payload }: any) => ({
        ...state, errorObtenerUsers: { message: payload.message },
    }));
    builder.addCase(AccionesUser.cambiarEstadoDeCargaObtenerUsers, (state: EstadoUser, { payload }: any) => ({
        ...state, obtenerUsersEnProgreso: payload,
    }));

    builder.addCase(AccionesUser.obtenerUserExito, (state: EstadoUser, { payload }: any) => ({
        ...state, userActual: payload, errorObtenerUser: null,
    }));
    builder.addCase(AccionesUser.obtenerUserError, (state: EstadoUser, { payload }: any) => ({
        ...state, errorObtenerUser: { message: payload.message },
    }));
    builder.addCase(AccionesUser.cambiarEstadoDeCargaObtenerUser, (state: EstadoUser, { payload }: any) => ({
        ...state, obtenerUserEnProgreso: payload,
    }));

    builder.addCase(AccionesUser.actualizarUserExito, (state: EstadoUser, { payload }: any) => ({
        ...state, userActual: payload, errorActualizarUser: null,
    }));
    builder.addCase(AccionesUser.actualizarUserError, (state: EstadoUser, { payload }: any) => ({
        ...state, errorActualizarUser: { message: payload.message },
    }));
    builder.addCase(AccionesUser.cambiarEstadoDeCargaActualizarUser, (state: EstadoUser, { payload }: any) => ({
        ...state, actualizarUserEnProgreso: payload,
    }));

    builder.addCase(AccionesUser.limpiarUserActual, (state: EstadoUser) => ({
        ...state, userActual: null, errorObtenerUser: null,
    }));
};

export const userReducer = createReducer(obtenerEstadoInicialUser(), userReducerBuilder);
