import Cookies from 'js-cookie'
import {jwtDecode} from 'jwt-decode'
import { tokenName, refreshTokenName } from '../constants/config'

export const getToken = () => {
    return Cookies.get(tokenName)
}

export const removeToken = () => {
    return Cookies.remove(tokenName)
}

export const setToken = (token:string, expires:Date)=>{
    Cookies.set(tokenName, token, { expires })
}

// Refresh Token
export const getRefreshToken = () => {
    return Cookies.get(refreshTokenName)
}

export const removeRefreshToken = () => {
    return Cookies.remove(refreshTokenName)
}

export const setRefreshToken = (token: string, expires: Date) => {
    Cookies.set(refreshTokenName, token, { expires })
}

export const decodeToken = (token = getToken() )=>{
    if(token){
        return jwtDecode(token)
    }
    return null
}

// Verificar si el token está expirado
export const isTokenExpired = (token = getToken()) => {
    if (!token) return true
    
    try {
        const decoded: any = jwtDecode(token)
        if (!decoded.exp) return true
        
        const now = Date.now() / 1000
        return decoded.exp < now
    } catch (error) {
        console.error(error);
        return true
    }
}

// Verificar si el refresh token está expirado
export const isRefreshTokenExpired = () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return true
    
    try {
        const decoded: any = jwtDecode(refreshToken)
        if (!decoded.exp) return false // Si no tiene exp, asumimos que es válido
        
        const now = Date.now() / 1000
        console.log(decoded.exp < now)
        return decoded.exp < now
    } catch (error) {
        console.error(error);
        return true
    }
}

// Verificar si el token está próximo a expirar (dentro de X minutos)
export const isTokenExpiringSoon = (minutesThreshold = 5, token = getToken()) => {
    if (!token) return true
    
    try {
        const decoded: any = jwtDecode(token)
        if (!decoded.exp) return true
        
        const now = Date.now() / 1000
        const timeUntilExpiry = decoded.exp - now
        const thresholdInSeconds = minutesThreshold * 60
        
        return timeUntilExpiry < thresholdInSeconds
    } catch (error) {
        console.error(error);
        return true
    }
}

// Obtener el tiempo restante hasta la expiración (en segundos)
export const getTokenTimeRemaining = (token = getToken()) => {
    if (!token) return 0
    
    try {
        const decoded: any = jwtDecode(token)
        if (!decoded.exp) return 0
        
        const now = Date.now() / 1000
        const remaining = decoded.exp - now
        
        return remaining > 0 ? remaining : 0
    } catch (error) {
        console.error(error);
        return 0
    }
}

// Obtener el tiempo restante del refresh token (en segundos)
export const getRefreshTokenTimeRemaining = () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return 0
    
    try {
        const decoded: any = jwtDecode(refreshToken)
        if (!decoded.exp) return Infinity // Si no tiene exp, considerarlo como sin límite
        
        const now = Date.now() / 1000
        const remaining = decoded.exp - now
        
        return remaining > 0 ? remaining : 0
    } catch (error) {
        console.error(error);
        return 0
    }
}