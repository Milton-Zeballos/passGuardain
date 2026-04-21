import api, { setAuthToken } from "./api";

const AUTH_LOGIN_ENDPOINT = "/auth/login/";
const AUTH_REGISTER_ENDPOINT = "/auth/register/";
const AUTH_ME_ENDPOINT = "/auth/me/";

export const authService = {
  login: async (credentials) => {
    const data = await api.post(AUTH_LOGIN_ENDPOINT, credentials);

    if (data?.access) {
      setAuthToken(data.access);
    }

    return data;
  },
  register: async (userData) => {
    return await api.post(AUTH_REGISTER_ENDPOINT, userData);
  },
  logout: () => setAuthToken(null),
  getProfile: () => api.get(AUTH_ME_ENDPOINT),
};

export default authService;
