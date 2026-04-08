import axios from 'axios';

export function useApi() {
  const config = useRuntimeConfig();

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return {
    login: (email: string, password: string) =>
      api.post('/auth/login', { email, password }),
    me: () => api.get('/auth/me'),
  };
}
