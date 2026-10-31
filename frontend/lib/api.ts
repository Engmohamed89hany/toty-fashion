import axios, { type AxiosRequestConfig } from "axios";

const API_BASE_URL = "http://localhost:4000/api";
const ACCESS_TOKEN_COOKIE = "token";

export const getAccessToken = (): string => {
  if (typeof document === "undefined") {
    return "";
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=`));

  if (!cookieValue) {
    return "";
  }

  return decodeURIComponent(cookieValue.split("=")[1] ?? "");
};

export const setAccessToken = (token: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
};

export const clearAccessToken = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (!token || config.url?.includes("/users/refresh")) {
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (AxiosRequestConfig & {
      _retry?: boolean;
    });

    if (
      !originalRequest ||
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/users/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/users/refresh`,
        {},
        { withCredentials: true },
      );

      const nextAccessToken =
        refreshResponse?.data?.data?.accessToken ??
        refreshResponse?.data?.accessToken ??
        null;

      if (!nextAccessToken) {
        throw new Error("Refresh endpoint did not return a new access token");
      }

      setAccessToken(nextAccessToken);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  },
);

export default api;
