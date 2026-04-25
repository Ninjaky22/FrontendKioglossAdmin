import {  type Dispatch } from "@reduxjs/toolkit";
import { signUpUrl } from "../../constants/serviceUrl";
import httpClient from "../../services/httpClient";
import { decodeToken, setToken, setRefreshToken } from "../../utils/tokenManagement";
import { AccionesSesion } from "./session";

export enum TipoAccionesSignUp {
    REGISTRO_EXITOSO = 'REGISTRO_EXITOSO',
    ERROR_REGISTRO = 'ERROR_REGISTRO',
    CAMBIAR_ESTADO_DE_CARGA = 'CAMBIAR_ESTADO_DE_CARGA',
    RESTABLECER_ESTADO = 'RESTABLECER_ESTADO'
}

export interface SignUpData {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
    profileImage?: string;
    isSuperuser?: boolean;
    account: {
        pointsPerPurchase: number;
        isActive: boolean;
    };
    address: {
        street: string;
        streetNumber: string;
        distric: string;
    };
}

// Function THUNK para registro de usuario
export const signUpUser = (userData: SignUpData) => async (dispatch: Dispatch<any>) => {
    // Usar las acciones de sesión en lugar de las de signup
    dispatch(AccionesSesion.restablecerEstado())
    dispatch(AccionesSesion.cambiarEstadoDeCarga(true))
    
    try {
        const { data: response } = await httpClient.post(signUpUrl, userData, {}, false)
        
        // Decodificar y guardar access token
        const decodedAccessToken = decodeToken(response.access)
        if (decodedAccessToken && decodedAccessToken.exp) {
            const accessExpiration = new Date(decodedAccessToken.exp * 1000)
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
            
            // Despachar inicio de sesión exitosa con el token decodificado
            dispatch(AccionesSesion.inicioSesionExitosa(decodeToken()))
        }
    } catch (error) {
        console.log(error)
        dispatch(AccionesSesion.errorInicioSesion(JSON.parse(JSON.stringify(error)) as Error))
    }
    
    dispatch(AccionesSesion.cambiarEstadoDeCarga(false))
}