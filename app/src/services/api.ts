/**
 * Base API client para FitCrat.
 * Todas as funções retornam { data, error } para compatibilidade com os componentes existentes.
 */

import type { ApiResponse, ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const TOKEN_KEY = 'fitcrat_token';
const REFRESH_TOKEN_KEY = 'fitcrat_refresh_token';

// ---- Token helpers ----

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (token?: string | null, refreshToken?: string | null): void => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// ---- Refresh logic ----

let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearTokens();
        return false;
      }

      const json = await res.json();
      setTokens(json.token, json.refreshToken);
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ---- Core request function ----

interface RequestOptions {
  isRetry?: boolean;
  isFormData?: boolean;
}

const request = async <T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  { isRetry = false, isFormData = false }: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = getToken();
    const headers: Record<string, string> = {};

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const opts: RequestInit = { method, headers };

    if (body !== undefined && body !== null) {
      opts.body = isFormData ? (body as FormData) : JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE_URL}${path}`, opts);

    if (res.status === 401 && !isRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(method, path, body, { isRetry: true, isFormData });
      }
      return {
        data: null,
        error: { message: 'Session expired. Please sign in again.', status: 401 },
      };
    }

    let json: Record<string, unknown> | null = null;
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      json = await res.json();
    }

    if (!res.ok) {
      const message =
        (json?.message as string) ||
        (json?.error as string) ||
        `Request failed with status ${res.status}`;
      return { data: null, error: { message, status: res.status, details: json } };
    }

    const data = json?.data !== undefined ? json.data : json;
    return { data: data as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { data: null, error: { message, status: 0 } };
  }
};

// ---- Public methods ----

export const get = <T = unknown>(path: string): Promise<ApiResponse<T>> =>
  request<T>('GET', path);

export const post = <T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> =>
  request<T>('POST', path, body);

export const put = <T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> =>
  request<T>('PUT', path, body);

export const del = <T = unknown>(path: string): Promise<ApiResponse<T>> =>
  request<T>('DELETE', path);

export const upload = <T = unknown>(path: string, formData: FormData): Promise<ApiResponse<T>> =>
  request<T>('POST', path, formData, { isFormData: true });

export { API_BASE_URL };

export default { get, post, put, del, upload, API_BASE_URL, getToken, setTokens, clearTokens };
