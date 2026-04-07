import api from '../lib/axios';

const paymentService = {
  /**
   * Student: get own payments and reminders
   */
  getMine: (params = {}) => {
    return api.get('/payments/mine', { params });
  },

  /**
   * Admin: get all payments
   */
  getAll: (params = {}) => {
    return api.get('/payments', { params });
  },

  /**
   * Get single payment
   */
  getById: (id) => {
    return api.get(`/payments/${id}`);
  },

  /**
   * Admin: create payment
   */
  create: (data) => {
    return api.post('/payments', data);
  },

  /**
   * Student: mark payment as paid
   */
  markPaid: (id, data = {}) => {
    return api.patch(`/payments/${id}/pay`, data);
  },
};

export default paymentService;