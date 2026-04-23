import { createAction, type Dispatch } from "@reduxjs/toolkit";
import { loginUrl,usuarioIniciadoUrl, refreshTokenUrl } from "../../constants/serviceUrl";
import httpClient from "../../services/httpClient";
import { decodeToken, setToken, setRefreshToken, getRefreshToken, removeToken, removeRefreshToken } from "../../utils/tokenManagement";

export enum TipoAccionesSesion{
    INICIO_SESION_EXITOSA = 'INICIO_SESION_EXITOSA',
    ERROR_INICIO_SESION = 'ERROR_INICIO_SESION',
    CAMBIAR_ESTADO_DE_CARGA = 'CAMBIAR_ESTADO_DE_CARGA',
    RESTABLECER_ESTADO = 'RESTABLECER_ESTADO',

    EXITO_OBTENER_USUARIO_INICIADO = 'EXITO_OBTENER_USUARIO_INICIADO',
    ERROR_OBTENER_USUARIO_INICIADO = 'ERROR_OBTENER_USUARIO_INICIADO',

    REFRESH_TOKEN_EXITOSO = 'REFRESH_TOKEN_EXITOSO',
    ERROR_REFRESH_TOKEN = 'ERROR_REFRESH_TOKEN'
}

const inicioSesionExitosa = createAction<any>(TipoAccionesSesion.INICIO_SESION_EXITOSA)
const errorInicioSesion = createAction<Error>(TipoAccionesSesion.ERROR_INICIO_SESION)
const cambiarEstadoDeCarga = createAction<boolean>(TipoAccionesSesion.CAMBIAR_ESTADO_DE_CARGA)
const restablecerEstado = createAction<undefined>(TipoAccionesSesion.RESTABLECER_ESTADO)

const exitoObtenerUsuarioIniciado = createAction<any>(TipoAccionesSesion.EXITO_OBTENER_USUARIO_INICIADO)
const errorObtenerUsuarioIniciado = createAction<Error>(TipoAccionesSesion.ERROR_OBTENER_USUARIO_INICIADO)

const refreshTokenExitoso = createAction<any>(TipoAccionesSesion.REFRESH_TOKEN_EXITOSO)
const errorRefreshToken = createAction<Error>(TipoAccionesSesion.ERROR_REFRESH_TOKEN)

//Function THUNK -> es una funcion que permite acceder al dispacher
export const loginUser = (userData: any) => async (dispatch: Dispatch) => {
    dispatch(restablecerEstado())
    dispatch(cambiarEstadoDeCarga(true)) // en este momento hay una carga en progreso
    try {
        const { data: response } = await httpClient.post(loginUrl, userData, false, false)
        // se agrega el parametro adicional strict en false ya que no queremos redirigir al usuario en caso de que el login este mal

        // Decodificar y guardar access token
        const decodedAccessToken = decodeToken(response.access)
        if (decodedAccessToken && decodedAccessToken.exp) {
            const accessExpiration = new Date(decodedAccessToken.exp * 1000) // JWT exp está en segundos
            setToken(response.access, accessExpiration)
            
            // Guardar refresh token usando su propia expiración del JWT
            if (response.refresh) {
                const decodedRefreshToken = decodeToken(response.refresh)
                if (decodedRefreshToken && decodedRefreshToken.exp) {
                    const refreshExpiration = new Date(decodedRefreshToken.exp * 1000)
                    setRefreshToken(response.refresh, refreshExpiration)
                } else {
                    // Fallback: si el refresh token no tiene exp, usar 7 días
                    const fallbackExpiration = new Date()
                    fallbackExpiration.setDate(fallbackExpiration.getDate() + 7)
                    setRefreshToken(response.refresh, fallbackExpiration)
                }
            }
            
            dispatch(inicioSesionExitosa(decodeToken()))
        }
    } catch (error) {
        console.log(error)
        dispatch(errorInicioSesion(JSON.parse(JSON.stringify(error)) as Error))
    }
    dispatch(cambiarEstadoDeCarga(false))
}

export const CerrarSesion = () => (dispatch: Dispatch) => {
    removeToken()
    removeRefreshToken()
    dispatch(restablecerEstado())
    //navegate("/login")
}

// Función para refrescar el access token usando el refresh token
export const refreshAccessToken = () => async (dispatch: Dispatch<any>) => {
    try {
        const refreshToken = getRefreshToken()
        
        if (!refreshToken) {
            throw new Error('No refresh token available')
        }

        const { data: response } = await httpClient.post(
            refreshTokenUrl, 
            { refresh: refreshToken },
            false,
            false
        )

        if (response.access) {
            const decodedAccessToken = decodeToken(response.access)
            if (decodedAccessToken && decodedAccessToken.exp) {
                const accessExpiration = new Date(decodedAccessToken.exp * 1000)
                setToken(response.access, accessExpiration)
                
                // Si también se devuelve un nuevo refresh token, actualizarlo con su propia expiración
                if (response.refresh) {
                    const decodedRefreshToken = decodeToken(response.refresh)
                    if (decodedRefreshToken && decodedRefreshToken.exp) {
                        const refreshExpiration = new Date(decodedRefreshToken.exp * 1000)
                        setRefreshToken(response.refresh, refreshExpiration)
                    } else {
                        // Fallback: si no tiene exp, usar 7 días
                        const fallbackExpiration = new Date()
                        fallbackExpiration.setDate(fallbackExpiration.getDate() + 7)
                        setRefreshToken(response.refresh, fallbackExpiration)
                    }
                }
                
                dispatch(refreshTokenExitoso(decodeToken()))
                return response.access
            }
        }
    } catch (error) {
        console.log('Error refreshing token:', error)
        dispatch(errorRefreshToken(JSON.parse(JSON.stringify(error)) as Error))
        // Si falla el refresh, cerrar sesión
        dispatch(CerrarSesion())
        throw error
    }
}

// Función helper para verificar si el token está próximo a expirar
export const verificarYRefrescarToken = () => async (dispatch: Dispatch<any>) => {
    const token = decodeToken()
    const refreshToken = getRefreshToken()
    
    // Si no hay tokens, no hacer nada
    if (!token || !refreshToken) {
        return
    }

    // Verificar si el refresh token está expirado
    const refreshDecoded: any = decodeToken(refreshToken)
    if (refreshDecoded && refreshDecoded.exp) {
        const now = Date.now() / 1000
        if (refreshDecoded.exp < now) {
            // Refresh token expirado, cerrar sesión
            console.log('Refresh token expired, logging out')
            dispatch(CerrarSesion())
            return
        }
    }

    // Verificar si el access token está próximo a expirar
    if (!token.exp) {
        return
    }

    const now = Date.now() / 1000
    const timeUntilExpiry = token.exp - now
    
    // Si el token expira en menos de 5 minutos (300 segundos), refrescarlo
    if (timeUntilExpiry < 300) {
        try {
            await dispatch(refreshAccessToken())
        } catch (error) {
            console.error('Failed to refresh token:', error)
        }
    }
}

// se Obtienen lo Datos completos del usuario logueado con el fin rellenar los campos del contrato
export const obtenerPropietario = (username: string) => async (dispatch: Dispatch<any>) => {
    try {
        // Verificar y refrescar token si es necesario antes de hacer la petición
        await dispatch(verificarYRefrescarToken())
        
        const { data: response } = await httpClient.get(`${usuarioIniciadoUrl}/${username}`)
        const usuarioPropietario = {
            nid: response.identificacion,
            huella: response.imgHuella,
            firma: response.firma,
        }
        dispatch(exitoObtenerUsuarioIniciado(usuarioPropietario))
    } catch (error) {
        dispatch(errorObtenerUsuarioIniciado(JSON.parse(JSON.stringify(error)) as Error))
    }
}

export const AccionesSesion = {
    inicioSesionExitosa,
    errorInicioSesion,
    cambiarEstadoDeCarga,
    restablecerEstado,

    exitoObtenerUsuarioIniciado,
    errorObtenerUsuarioIniciado,

    refreshTokenExitoso,
    errorRefreshToken
}