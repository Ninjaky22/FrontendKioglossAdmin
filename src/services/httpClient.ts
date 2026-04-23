import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode"; // Necesitarás importar jwt-decode aquí
import { axiosConfig } from "../constants/config";
import { rutaIniciarSesion,  } from "../constants/rutas"; // Asegúrate de agregar 'rutaRefreshToken'
import {
    getToken,
    getRefreshToken,
    setToken,
    setRefreshToken,
    removeToken,
    removeRefreshToken,
    isRefreshTokenExpired
} from "../utils/tokenManagement";
import { refreshTokenUrl } from "../constants/serviceUrl";

const http = axios.create(axiosConfig); // se crea la instancia axios

// --- Interceptor de Solicitud (Request) ---
// (Este es el que ya tenías)
const configRequestSuccess = (config: any) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

const configRequestError = (error: any) => {
    return Promise.reject(error);
};

http.interceptors.request.use(configRequestSuccess, configRequestError);

// --- Interceptor de Respuesta (Response) ---
// (Esta es la nueva lógica para el refresh token)

// Variables para manejar la concurrencia
// Evita que múltiples llamadas 401 disparen múltiples peticiones de refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const configResponseError = async (error: AxiosError) => {
    const originalRequest = error.config as any; // 'any' para poder añadir la propiedad _retry

    // Si el error no es 401, o si ya hemos reintentado, simplemente rechaza
    if (error.response?.status !== 403 || originalRequest._retry) {
        return Promise.reject(error);
    }

    // Si ya estamos refrescando el token, encolamos la solicitud
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        })
            .then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return http(originalRequest); // Reintenta con el nuevo token
            })
            .catch(err => {
                return Promise.reject(err);
            });
    }

    // Marcamos que estamos refrescando y que esta solicitud ya ha sido reintentada
    originalRequest._retry = true;
    isRefreshing = true;

    // Verificamos si el refresh token es válido
    if (isRefreshTokenExpired()) {
        console.error("Refresh token expirado, redirigiendo al login.");
        removeToken();
        removeRefreshToken();
        isRefreshing = false;
        window.location.href = rutaIniciarSesion;
        return Promise.reject(error);
    }

    try {
        const refreshToken = getRefreshToken();
        // Hacemos la llamada al endpoint de refresh
        // NOTA: Usamos 'axios.post' en lugar de 'http.post' para evitar el interceptor
        // de solicitud que adjuntaría el token de acceso expirado.
        const response = await axios.post(`http://localhost:8000/API/V1.0${refreshTokenUrl}`, { refresh: refreshToken });

        const { access:accessToken, refresh: newRefreshToken } = response.data;

        // Decodificamos los nuevos tokens para obtener su 'exp'
        const decodedAccess: any = jwtDecode(accessToken);
        const decodedRefresh: any = jwtDecode(newRefreshToken);

        // Guardamos los nuevos tokens
        setToken(accessToken, new Date(decodedAccess.exp * 1000));
        setRefreshToken(newRefreshToken, new Date(decodedRefresh.exp * 1000));

        // Actualizamos el header por defecto de la instancia 'http'
        http.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        // Actualizamos el header de la solicitud original
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        // Procesamos la cola de solicitudes fallidas con el nuevo token
        processQueue(null, accessToken);

        // Reintentamos la solicitud original
        return http(originalRequest);

    } catch (refreshError: any) {
        console.error("Error al refrescar el token:", refreshError);
        // Si el refresh falla, limpiamos todo y redirigimos al login
        removeToken();
        removeRefreshToken();
        processQueue(refreshError, null); // Rechazamos la cola
        window.location.href = rutaIniciarSesion;
        return Promise.reject(refreshError);

    } finally {
        isRefreshing = false;
    }
};

http.interceptors.response.use(
    (response) => response, // Función para respuestas exitosas (no hacemos nada)
    configResponseError     // Función para respuestas con error
);


// --- Lógica de Seguridad (Tu código original) ---
const validateError = (error: any) => {
    const token = getToken();
    // Si el interceptor de respuesta falla (ej. refresh token expirado)
    // el token habrá sido borrado, por lo que esto te redirigirá al login.
    if (token) return Promise.reject(error);
    window.location.href = rutaIniciarSesion;
};

const enforceSecurity = (request: Promise<any>, strict: boolean) => {
    return strict ? request.catch(validateError) : request;
};

const get = (path: string, config?: any, strict = true) => enforceSecurity(http.get(path, config), strict);
const del = (path: string, strict = true) => enforceSecurity(http.delete(path), strict);
const put = (path: string, request: any, strict = true) => enforceSecurity(http.put(path, request), strict);
const post = (path: string, request: any, config?: any, strict = true) => enforceSecurity(http.post(path, request, config), strict);
const patch = (path: string, request?: any, config?: any, strict = true) => enforceSecurity(http.patch(path, request, config), strict);

const httpClient = {
    get,
    delete: del,
    put,
    post,
    patch
};

export default httpClient;