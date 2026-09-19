import axios from 'axios';
import { store } from '@/store';
import { clearSession, updateTokens } from '@/store/slices/authSlice';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const api = axios.create({
    baseURL: API_BASE,
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('hc_access');
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
let refreshing = null;
api.interceptors.response.use((res) => res, async (error) => {
    const original = error.config;
    if (!original || error.response?.status !== 401 || original.url?.includes('/auth/')) {
        return Promise.reject(error);
    }
    if (!refreshing) {
        refreshing = (async () => {
            const refreshToken = localStorage.getItem('hc_refresh');
            if (!refreshToken)
                return null;
            try {
                const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
                const payload = data.data ?? data;
                store.dispatch(updateTokens({ accessToken: payload.accessToken, refreshToken: payload.refreshToken }));
                return payload.accessToken;
            }
            catch {
                store.dispatch(clearSession());
                return null;
            }
            finally {
                refreshing = null;
            }
        })();
    }
    const token = await refreshing;
    if (!token) {
        window.location.href = '/login';
        return Promise.reject(error);
    }
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
});
export function unwrap(payload) {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload.data;
    }
    return payload;
}
export default api;
