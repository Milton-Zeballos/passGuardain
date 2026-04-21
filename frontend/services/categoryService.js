import api from "./api";

const CATEGORY_ENDPOINT = "/categories/";

export const categoryService = {
  list: () => api.get(CATEGORY_ENDPOINT),
  getById: (id) => api.get(`${CATEGORY_ENDPOINT}${id}/`),
  create: (payload) => api.post(CATEGORY_ENDPOINT, payload),
  update: (id, payload) => api.put(`${CATEGORY_ENDPOINT}${id}/`, payload),
  partialUpdate: (id, payload) => api.patch(`${CATEGORY_ENDPOINT}${id}/`, payload),
  remove: (id) => api.del(`${CATEGORY_ENDPOINT}${id}/`),
};

export default categoryService;
