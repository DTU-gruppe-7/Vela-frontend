import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface QueueItem {
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null ) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
}

// Request interceptor (for adding auth tokens, etc.)
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handles 401 (expired token))
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token')) {
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
                    })
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            if (token && refreshToken) {
                try {
                    const response = await axios.post(`${axiosClient.defaults.baseURL}/auth/refresh-token`, {
                        token: token,
                        refreshToken: refreshToken
                    });

                    const newToken = response.data.token;
                    const newRefreshToken = response.data.refreshToken;

                    localStorage.setItem('token', newToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    processQueue(null, newToken);

                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
)

export default axiosClient;
