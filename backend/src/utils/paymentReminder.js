import Payment from '../models/Payment.js';

/**
 * Get payment reminders for a student
 *
 * Rule:
 * Return pending payments whose due_date is less than or equal to 7 days from now.
 *
 * This also naturally includes overdue payments because
 * an overdue date is also <= sevenDaysFromNow.
 *
 * @param {string|ObjectId} studentId
 * @returns {Promise<Array>}
 */
const getPaymentReminders = async (studentId) => {
  const now = new Date();

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const reminders = await Payment.find({
    student_id: studentId,
    status: 'pending',
    due_date: {
      $ne: null,
      $lte: sevenDaysFromNow,
    },
  }).sort({ due_date: 1 });

  return reminders;
};

export default getPaymentReminders;