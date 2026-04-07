import { useEffect, useState } from 'react';
import {
  CreditCard,
  Bell,
  CheckCircle,
  Clock,
  X,
  AlertTriangle,
  IndianRupee,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import paymentService from '../../services/payment.service';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await paymentService.getMine({ page, limit: 10 });

      setPayments(response.data.data.payments);
      setPagination(response.data.data.pagination);
      setReminders(response.data.data.reminders);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const openPayModal = (payment) => {
    setSelectedPayment(payment);
    setTransactionId('');
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setSelectedPayment(null);
    setTransactionId('');
    setPayModalOpen(false);
  };

  const handleMarkPaid = async () => {
    if (!selectedPayment) return;

    setSubmitting(true);

    try {
      const response = await paymentService.markPaid(selectedPayment._id, {
        transaction_id: transactionId,
      });

      toast.success(response.data.message);
      closePayModal();
      fetchPayments();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to mark payment as paid';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatType = (type) => {
    if (!type) return '';
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getStatusIcon = (status) => {
    if (status === 'paid') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>

      {/* Reminders Section */}
      {reminders.length > 0 && (
        <Card className="p-6 mb-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                Payment Reminders
              </h2>
              <p className="text-sm text-yellow-800 mb-4">
                You have {reminders.length} payment{reminders.length > 1 ? 's' : ''} due soon or overdue.
              </p>

              <div className="space-y-3">
                {reminders.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white border border-yellow-200 rounded-lg p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatType(item.type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{item.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {formatDate(item.due_date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isOverdue(item.due_date) ? (
                        <Badge variant="danger">Overdue</Badge>
                      ) : (
                        <Badge variant="warning">Due Soon</Badge>
                      )}

                      <button
                        onClick={() => openPayModal(item)}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Mark Paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payments History */}
      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                {/* Left side */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1">{getStatusIcon(payment.status)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">
                        {formatType(payment.type)}
                      </span>

                      {payment.due_date && payment.status === 'pending' && isOverdue(payment.due_date) && (
                        <Badge variant="danger">Overdue</Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-1">
                      {payment.description || 'No description provided'}
                    </p>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <IndianRupee className="w-4 h-4" />
                      <span className="font-medium">
                        {payment.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      {payment.due_date && (
                        <span>Due: {formatDate(payment.due_date)}</span>
                      )}
                      {payment.payment_date && (
                        <span>Paid: {formatDate(payment.payment_date)}</span>
                      )}
                      {payment.transaction_id && (
                        <span>Txn ID: {payment.transaction_id}</span>
                      )}
                      <span>Created: {formatDate(payment.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge status={payment.status}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>

                  {payment.status === 'pending' && (
                    <button
                      onClick={() => openPayModal(payment)}
                      className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => fetchPayments(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => fetchPayments(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-6">
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="There are no payment records assigned to you yet."
          />
        </Card>
      )}

      {/* Mark Paid Modal */}
      {payModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closePayModal}
          />

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Mark Payment as Paid
              </h2>

              <button
                onClick={closePayModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-gray-900">
                {formatType(selectedPayment.type)}
              </p>
              <p className="text-sm text-gray-500">
                Amount: ₹{selectedPayment.amount.toLocaleString()}
              </p>
              {selectedPayment.due_date && (
                <p className="text-xs text-gray-400 mt-1">
                  Due: {formatDate(selectedPayment.due_date)}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="transaction_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Transaction ID (Optional)
              </label>
              <input
                id="transaction_id"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter payment transaction reference"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Add transaction/reference ID if available
              </p>
            </div>

            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Make sure you have actually completed the payment before marking it as paid.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closePayModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleMarkPaid}
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? 'Saving...' : 'Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;