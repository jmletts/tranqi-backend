import axios, { AxiosError } from 'axios';
import { TokenStorage } from '../storage/TokenStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

let unauthorizedHandler: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export const HttpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

HttpClient.interceptors.request.use(
  async (config) => {
    const token = await TokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

HttpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthEndpoint) {
      await TokenStorage.deleteToken();
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    return Promise.reject(error);
  }
);

export function extractApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (data) {
      if (typeof data.error === 'string' && data.error.trim()) return data.error;
      if (typeof data.message === 'string' && data.message.trim()) return data.message;
      const firstVal = Object.values(data).find((v) => typeof v === 'string' && v.trim());
      if (typeof firstVal === 'string') return firstVal;
    }
    if (error.response?.status === 401) return 'Tu sesión expiró o las credenciales son inválidas.';
    if (error.response?.status === 403) return 'No tienes autorización para realizar esta operación.';
    if (!error.response) return 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
