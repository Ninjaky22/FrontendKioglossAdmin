import { createSelector } from "@reduxjs/toolkit";
import type { EstadoDeSesion } from "../reducers/session";


export const sessionStateSelector = (state:any): EstadoDeSesion => state.session


export const sessionAuthenticatedSelector = createSelector(
    sessionStateSelector,
    (sessionState) => sessionState.autenticado
)

export const sessionAuthenticationInProgressSelector = createSelector(
    sessionStateSelector,
    (sessionState) => sessionState.autenticacionEnProgreso
)

export const sessionAuthenticationErrorSelector = createSelector(
    sessionStateSelector,
    (sessionState) => sessionState.autenticacionError
)

export const datosUsuario = createSelector(
    sessionStateSelector,
    (sessionState) => sessionState.DatosUsuario
)