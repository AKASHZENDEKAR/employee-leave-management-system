import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/*
 * Attach access token to every protected request.
 */
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

/*
 * Automatically refresh an expired access token once.
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized =
      error.response?.status === 401;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login/") ||
      originalRequest?.url?.includes("/auth/refresh/");

    if (
      !isUnauthorized ||
      originalRequest?._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${API_BASE_URL}/auth/refresh/`,
            {
              refresh: refreshToken,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          )
          .then((response) => {
            const newAccessToken =
              response.data.access;

            localStorage.setItem(
              "access_token",
              newAccessToken
            );

            /*
             * SimpleJWT rotation may return a new refresh token.
             */
            if (response.data.refresh) {
              localStorage.setItem(
                "refresh_token",
                response.data.refresh
              );
            }

            return newAccessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken =
        await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      return Promise.reject(refreshError);
    }
  }
);

export default api;