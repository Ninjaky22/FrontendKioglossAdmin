import { AxiosError } from 'axios';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'La solicitud contiene datos inválidos',
  401: 'No tienes autorización. Inicia sesión nuevamente',
  403: 'No tienes permisos para realizar esta acción',
  404: 'El recurso solicitado no fue encontrado',
  409: 'Conflicto: el recurso ya existe o está en uso',
  413: 'El archivo es demasiado grande',
  422: 'Los datos enviados no son válidos',
  500: 'Error interno del servidor. Intenta de nuevo más tarde',
  502: 'El servidor no está disponible temporalmente',
  503: 'Servicio no disponible. Intenta de nuevo más tarde',
};

/**
 * Extrae un mensaje legible de un error de Axios o Error genérico.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data;

    // Spring Boot: { message: "..." }
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }

    // Spring Boot validation: { errors: [...] }
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((e: any) => e.defaultMessage || e.message || e).join('. ');
    }

    // Fallback: { error: "..." }
    if (data?.error && typeof data.error === 'string') {
      return data.error;
    }

    // Friendly status message
    const status = error.response.status;
    if (STATUS_MESSAGES[status]) {
      return STATUS_MESSAGES[status];
    }

    return `Error del servidor (${status})`;
  }

  if (error instanceof Error) {
    // Avoid raw Axios messages like "Request failed with status code 400"
    if (error.message.startsWith('Request failed with status code')) {
      return 'Ocurrió un error inesperado. Intenta de nuevo';
    }
    return error.message;
  }

  return 'Ocurrió un error inesperado';
}
