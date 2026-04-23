import { createAction, type Dispatch } from '@reduxjs/toolkit';
import httpClient from '../../services/httpClient';
import type { PaginaUser, UserDetailDTO } from '../../models/User';
import { usersUrl } from '../../constants/serviceUrl';

export enum TipoAccionesUser {
    OBTENER_LISTA_USERS_EXITO = 'OBTENER_LISTA_USERS_EXITO',
    OBTENER_LISTA_USERS_ERROR = 'OBTENER_LISTA_USERS_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_USERS = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_USERS',

    OBTENER_USER_EXITO = 'OBTENER_USER_EXITO',
    OBTENER_USER_ERROR = 'OBTENER_USER_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_OBTENER_USER = 'CAMBIAR_ESTADO_DE_CARGA_OBTENER_USER',

    ACTUALIZAR_USER_EXITO = 'ACTUALIZAR_USER_EXITO',
    ACTUALIZAR_USER_ERROR = 'ACTUALIZAR_USER_ERROR',
    CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_USER = 'CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_USER',

    LIMPIAR_USER_ACTUAL = 'LIMPIAR_USER_ACTUAL',
}

const obtenerListaUsersExito = createAction<PaginaUser>(TipoAccionesUser.OBTENER_LISTA_USERS_EXITO);
const obtenerListaUsersError = createAction<Error>(TipoAccionesUser.OBTENER_LISTA_USERS_ERROR);
const cambiarEstadoDeCargaObtenerUsers = createAction<boolean>(TipoAccionesUser.CAMBIAR_ESTADO_DE_CARGA_OBTENER_USERS);

const obtenerUserExito = createAction<UserDetailDTO>(TipoAccionesUser.OBTENER_USER_EXITO);
const obtenerUserError = createAction<Error>(TipoAccionesUser.OBTENER_USER_ERROR);
const cambiarEstadoDeCargaObtenerUser = createAction<boolean>(TipoAccionesUser.CAMBIAR_ESTADO_DE_CARGA_OBTENER_USER);

const actualizarUserExito = createAction<UserDetailDTO>(TipoAccionesUser.ACTUALIZAR_USER_EXITO);
const actualizarUserError = createAction<Error>(TipoAccionesUser.ACTUALIZAR_USER_ERROR);
const cambiarEstadoDeCargaActualizarUser = createAction<boolean>(TipoAccionesUser.CAMBIAR_ESTADO_DE_CARGA_ACTUALIZAR_USER);

const limpiarUserActual = createAction<undefined>(TipoAccionesUser.LIMPIAR_USER_ACTUAL);

const obtenerUsers = (page: number = 0, pageSize: number = 10, search?: string) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerUsers(true));
    try {
        const params = new URLSearchParams({
            page: String(page),
            page_size: String(pageSize),
        });
        if (search) params.append('search', search);
        const { data } = await httpClient.get(usersUrl, { params });
        dispatch(obtenerListaUsersExito(data.data)); 
    } catch (error) {
        dispatch(obtenerListaUsersError(JSON.parse(JSON.stringify(error)) as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerUsers(false));
};

const obtenerUserPorId = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaObtenerUser(true));
    try {
        const { data } = await httpClient.get(`${usersUrl}/${id}`);
        dispatch(obtenerUserExito(data.data));
    } catch (error) {
        dispatch(obtenerUserError(error as Error));
    }
    dispatch(cambiarEstadoDeCargaObtenerUser(false));
};

const toggleUserStatus = (id: number) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaActualizarUser(true));
    try {
        await httpClient.patch(`${usersUrl}/${id}/toggle-status`);
        dispatch(obtenerUserPorId(id) as any);
    } catch (error) {
        dispatch(actualizarUserError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaActualizarUser(false));
    }
};

const updateRoles = (id: number, roles: any) => async (dispatch: Dispatch) => {
    dispatch(cambiarEstadoDeCargaActualizarUser(true));
    try {
        await httpClient.put(`${usersUrl}/${id}/roles`, roles);
        dispatch(obtenerUserPorId(id) as any);
    } catch (error) {
        dispatch(actualizarUserError(error as Error));
        throw error;
    } finally {
        dispatch(cambiarEstadoDeCargaActualizarUser(false));
    }
};

export const AccionesUser = {
    obtenerListaUsersExito,
    obtenerListaUsersError,
    cambiarEstadoDeCargaObtenerUsers,
    obtenerUsers,

    obtenerUserExito,
    obtenerUserError,
    cambiarEstadoDeCargaObtenerUser,
    obtenerUserPorId,

    actualizarUserExito,
    actualizarUserError,
    cambiarEstadoDeCargaActualizarUser,
    toggleUserStatus,
    updateRoles,

    limpiarUserActual,
};
