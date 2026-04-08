import api from '../lib/axios';

const complaintsService = {
  /**
   * Get all complaints (Admin only)
   * @param {object} params - { status, priority, page, limit }
   */
  getAll: (params = {}) => {
    return api.get('/complaints', { params });
  },

  /**
   * Update complaint status and remark (Admin only)
   * @param {string} id - Complaint ID
   * @param {object} data - { status, admin_remark }
   */
  updateStatus: (id, data) => {
    return api.patch(`/complaints/${id}`, data);
  },
};

export default complaintsService;