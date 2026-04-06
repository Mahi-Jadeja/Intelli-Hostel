import api from '../lib/axios';

const studentService = {
  /**
   * Get student profile
   * @returns {Promise} Profile data
   */
  getProfile: () => {
    return api.get('/student/profile');
  },

  /**
   * Update student profile
   * @param {object} data - Fields to update
   * @returns {Promise} Updated profile
   */
  updateProfile: (data) => {
    return api.put('/student/profile', data);
  },

  /**
   * Get room allocation info
   * @returns {Promise} Room data with roommates
   */
  getRoom: () => {
    return api.get('/student/room');
  },

  /**
   * Get dashboard statistics
   * @returns {Promise} Aggregated stats
   */
  getDashboardStats: () => {
    return api.get('/student/dashboard-stats');
  },
};

export default studentService;