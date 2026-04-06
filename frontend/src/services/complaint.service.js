import api from '../lib/axios';

const complaintService = {
  /**
   * Create a new complaint
   * @param {object} data - { category, description }
   */
  create: (data) => {
    return api.post('/complaints', data);
  },

  /**
   * Get my complaints (student)
   * @param {object} params - { page, limit }
   */
  getMine: (params = {}) => {
    return api.get('/complaints/mine', { params });
  },

  /**
   * Get all complaints (admin)
   * @param {object} params - { page, limit, status, priority, category }
   */
  getAll: (params = {}) => {
    return api.get('/complaints', { params });
  },

  /**
   * Get a single complaint by ID
   * @param {string} id
   */
  getById: (id) => {
    return api.get(`/complaints/${id}`);
  },

  /**
   * Update a complaint (admin)
   * @param {string} id
   * @param {object} data - { status, priority, admin_remark }
   */
  update: (id, data) => {
    return api.patch(`/complaints/${id}`, data);
  },

  /**
   * Delete a complaint (student, pending only)
   * @param {string} id
   */
  delete: (id) => {
    return api.delete(`/complaints/${id}`);
  },

  /**
   * Get complaint statistics (admin)
   */
  getStats: () => {
    return api.get('/complaints/stats');
  },
};

export default complaintService;