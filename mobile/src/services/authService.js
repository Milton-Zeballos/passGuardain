import api, { setAuthToken } from "./api";

const AUTH_LOGIN_ENDPOINT = "/auth/login/";
const AUTH_ME_ENDPOINT = "/auth/me/";

export const authService = {
  login: async (credentials) => {
    const data = await api.post(AUTH_LOGIN_ENDPOINT, credentials);

    if (data?.access) {
      setAuthToken(data.access);
    }

    return data;
  },
  logout: () => setAuthToken(null),
  getProfile: () => api.get(AUTH_ME_ENDPOINT),
};

export default authService;
