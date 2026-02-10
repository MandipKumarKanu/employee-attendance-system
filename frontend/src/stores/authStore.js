import { create } from 'zustand';
import { loginApi, getMeApi, logoutApi } from '../api/authApi';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('eas_token'),
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await loginApi({ email, password });
    const { user, accessToken, refreshToken } = data.data;

    localStorage.setItem('eas_token', accessToken);
    localStorage.setItem('eas_refresh_token', refreshToken);

    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
    });

    return user;
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch {
      // ignore errors on logout
    }
    localStorage.removeItem('eas_token');
    localStorage.removeItem('eas_refresh_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('eas_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const { data } = await getMeApi();
      set({
        user: data.data,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('eas_token');
      localStorage.removeItem('eas_refresh_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateProfile: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));
  },
}));

export default useAuthStore;
