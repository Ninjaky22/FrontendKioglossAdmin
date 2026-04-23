import type { EstadoUser } from '../reducers/user';
import { createSelector } from '@reduxjs/toolkit';

export const userStateSelector = (state: any): EstadoUser => state.user;

export const listaUsersSelector = createSelector(userStateSelector, (s) => s.listaUsers?.content);
export const totalElementosUsersSelector = createSelector(userStateSelector, (s) => s.listaUsers?.totalElements);
export const obtenerUsersEnProgresoSelector = createSelector(userStateSelector, (s) => s.obtenerUsersEnProgreso);
export const userActualSelector = createSelector(userStateSelector, (s) => s.userActual);
export const obtenerUserEnProgresoSelector = createSelector(userStateSelector, (s) => s.obtenerUserEnProgreso);
export const actualizarUserEnProgresoSelector = createSelector(userStateSelector, (s) => s.actualizarUserEnProgreso);
export const errorObtenerUsersSelector = createSelector(userStateSelector, (s) => s.errorObtenerUsers);
