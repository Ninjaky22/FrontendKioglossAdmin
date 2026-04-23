
import { createReducer } from '@reduxjs/toolkit'
import {  AccionesSesion } from '../actions/session'

export interface EstadoDeSesion {
    autenticado:boolean
    autenticacionEnProgreso: boolean
    DatosUsuario: any
    autenticacionError: {message: string} | null
    errorObtenerUsuarioIniciado: {message: string} | null
}
// Estado Inicial
const ObtenerEstadoInicial = (): EstadoDeSesion => {
    return {
        autenticado : false,
        autenticacionEnProgreso : false,
        DatosUsuario : null,
        autenticacionError : null,
        errorObtenerUsuarioIniciado: null
    }
}

// login pasa a ser exitoso
const inicioSesionExitosa = (
    state: EstadoDeSesion,
    { payload }: ReturnType<typeof AccionesSesion.inicioSesionExitosa> 
) => {

    state.DatosUsuario = payload
    state.autenticado = true
}
const errorInicioSesion = (
    state: EstadoDeSesion,
    { payload }: ReturnType<typeof AccionesSesion.errorInicioSesion> 
) => {
    state.autenticacionError = {message:payload.message}
}
const cambiarEstadoDeCarga = (
    state: EstadoDeSesion,
    { payload }: ReturnType<typeof AccionesSesion.cambiarEstadoDeCarga> 
) => {
    state.autenticacionEnProgreso = payload
}

const exitoObtenerUsuarioIniciado = (
    state: EstadoDeSesion,
    { payload }: ReturnType<typeof AccionesSesion.exitoObtenerUsuarioIniciado>
) => {
    state.DatosUsuario = {
        ...state.DatosUsuario,
        payload
    }
}

const errorObtenerUsuarioIniciado = (
    state:EstadoDeSesion,
    { payload }: ReturnType<typeof AccionesSesion.errorObtenerUsuarioIniciado>
) => {
    state.errorObtenerUsuarioIniciado = payload
}

const restablecerEstado = () => {
    return ObtenerEstadoInicial()
}

const sessionReducerBuilder=(builder:any)=>{
    builder
        .addCase(AccionesSesion.inicioSesionExitosa, inicioSesionExitosa)
        .addCase(AccionesSesion.errorInicioSesion, errorInicioSesion)
        .addCase(AccionesSesion.cambiarEstadoDeCarga, cambiarEstadoDeCarga)
        .addCase(AccionesSesion.restablecerEstado, restablecerEstado)
        .addCase(AccionesSesion.exitoObtenerUsuarioIniciado, exitoObtenerUsuarioIniciado)
        .addCase(AccionesSesion.errorObtenerUsuarioIniciado, errorObtenerUsuarioIniciado)
}

export const sessionReducer = createReducer(ObtenerEstadoInicial(), sessionReducerBuilder )