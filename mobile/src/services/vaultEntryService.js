import api from "./api";

const ENTRY_ENDPOINT = "/entries/";

export const vaultEntryService = {
  list: () => api.get(ENTRY_ENDPOINT),
  getById: (id) => api.get(`${ENTRY_ENDPOINT}${id}/`),
  create: (payload) => api.post(ENTRY_ENDPOINT, payload),
  update: (id, payload) => api.put(`${ENTRY_ENDPOINT}${id}/`, payload),
  partialUpdate: (id, payload) => api.patch(`${ENTRY_ENDPOINT}${id}/`, payload),
  remove: (id) => api.del(`${ENTRY_ENDPOINT}${id}/`),
};

export default vaultEntryService;
