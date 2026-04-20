import api from "./api";

const PASSWORD_HEALTH_ENDPOINT = "/password-health/";

export const passwordHealthService = {
  list: () => api.get(PASSWORD_HEALTH_ENDPOINT),
  getById: (id) => api.get(`${PASSWORD_HEALTH_ENDPOINT}${id}/`),
  create: (payload) => api.post(PASSWORD_HEALTH_ENDPOINT, payload),
  update: (id, payload) => api.put(`${PASSWORD_HEALTH_ENDPOINT}${id}/`, payload),
  partialUpdate: (id, payload) =>
    api.patch(`${PASSWORD_HEALTH_ENDPOINT}${id}/`, payload),
  remove: (id) => api.del(`${PASSWORD_HEALTH_ENDPOINT}${id}/`),
};

export default passwordHealthService;
