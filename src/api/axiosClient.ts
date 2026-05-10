import axios from 'axios';


const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentToken: string | null = null;
let onTokenRefreshed: ((token: string) => void) | null = null;
let getRememberMe: () => boolean = () => false;

export function updateToken(token: string | null): void {
    currentToken = token;
}

export function setAuthCallbacks(callbacks: {
    onTokenRefreshed: (token: string) => void;
    getRememberMe: () => boolean;
}): void {
    onTokenRefreshed = callbacks.onTokenRefreshed;
    getRememberMe = callbacks.getRememberMe;
}

interface QueueItem {
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosClient.interceptors.request.use(
  (config) => {
    if (currentToken && config.headers) {
        config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (
                originalRequest.url.includes('/auth/login') ||
                originalRequest.url.includes('/Auth/refresh') ||
                originalRequest.url.includes('/auth/validate')
            ) {
                return Promise.reject(error);
            }

            if (typeof window === 'undefined') {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${axiosClient.defaults.baseURL}/auth/refresh`,
                    { accessToken: currentToken, rememberMe: getRememberMe() },
                    { withCredentials: true }
                );

                const newToken = response.data.accessToken;
                updateToken(newToken);
                onTokenRefreshed?.(newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);

                return axiosClient(originalRequest);
            } catch (refreshError) {
                updateToken(null);
                processQueue(refreshError as Error, null);
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
