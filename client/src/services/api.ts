import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
};

export const tracksAPI = {
  list: (params?: any) => api.get('/tracks', { params }),
  get: (id: string) => api.get(`/tracks/${id}`),
  create: (data: any) => api.post('/tracks', data),
  getDownloadUrl: (id: string) => api.get(`/tracks/${id}/download`),
  play: (id: string) => api.post(`/tracks/${id}/play`),
};

export const searchAPI = {
  search: (q: string, type = 'all', limit = 20) =>
    api.get('/search', { params: { q, type, limit } }),
  history: () => api.get('/search/history'),
  clearHistory: () => api.delete('/search/history'),
};

export const playlistsAPI = {
  list: (params?: any) => api.get('/playlists', { params }),
  get: (id: string) => api.get(`/playlists/${id}`),
  create: (data: any) => api.post('/playlists', data),
  update: (id: string, data: any) => api.patch(`/playlists/${id}`, data),
  delete: (id: string) => api.delete(`/playlists/${id}`),
  addTrack: (id: string, trackId: string) =>
    api.post(`/playlists/${id}/tracks`, { trackId }),
  removeTrack: (id: string, trackId: string) =>
    api.delete(`/playlists/${id}/tracks/${trackId}`),
  reorder: (id: string, trackIds: string[]) =>
    api.post(`/playlists/${id}/reorder`, { trackIds }),
};

export const likesAPI = {
  like: (trackId: string) => api.post(`/tracks/${trackId}/like`),
  unlike: (trackId: string) => api.delete(`/tracks/${trackId}/like`),
  list: () => api.get('/likes'),
};

export const historyAPI = {
  record: (trackId: string, completionPercentage: number) =>
    api.post('/history', { trackId, completionPercentage }),
  list: (limit = 50) => api.get('/history', { params: { limit } }),
};

export const recommendationsAPI = {
  get: () => api.get('/recommendations'),
  trending: () => api.get('/recommendations/trending'),
};

export const genresAPI = {
  list: () => api.get('/genres'),
};

export const artistsAPI = {
  list: (limit = 20) => api.get('/artists', { params: { limit } }),
  get: (id: string) => api.get(`/artists/${id}`),
};

export const albumsAPI = {
  list: (limit = 20) => api.get('/albums', { params: { limit } }),
  get: (id: string) => api.get(`/albums/${id}`),
};

export const userAPI = {
  profile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.patch('/user/profile', data),
  downloads: () => api.get('/user/downloads'),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
};
