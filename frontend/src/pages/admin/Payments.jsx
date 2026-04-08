import { useEffect, useState } from 'react';
import {
  CreditCard,
  Send,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import paymentService from '../../services/payment.service';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filters, setFilters] = useState({ status: '', student_id: '' });

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10, ...filters };
      const response = await paymentService.getAll(params);

      setPayments(response.data.data.data);
      setPagination(response.data.data.pagination);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchPayments(1);
  };

  const sendBulkReminders = async () => {
    try {
      setSending(true);
      const response = await paymentService.triggerReminders();
      toast.success(`Reminders sent: ${response.data.data.emailsSent} email(s)`);
      fetchPayments(pagination?.currentPage || 1);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send reminders';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const sendSingleReminder = async (paymentId) => {
    try {
      setSending(true);
      const response = await paymentService.triggerReminders(paymentId);
      toast.success(response.data.message);
      fetchPayments(pagination?.currentPage || 1);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send reminder';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const formatType = (type) => type?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '-';

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        </div>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <button
          onClick={sendBulkReminders}
          disabled={sending}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Sending...' : 'Send All Reminders'}
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              name="student_id"
              value={filters.student_id}
              onChange={handleFilterChange}
              placeholder="Filter by Student ID..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Apply
          </button>
        </div>
      </Card>

      {/* Table */}
      {payments.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Due Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Reminders</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.student_id?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{p.student_id?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatType(p.type)}</td>
                    <td className="px-4 py-3 text-gray-600">₹{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(p.due_date)}</td>
                    <td className="px-4 py-3">
                      <Badge status={p.status}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.reminder_count || 0} sent
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' && (
                        <button
                          onClick={() => sendSingleReminder(p._id)}
                          disabled={sending}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Remind
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description="Adjust filters or create new payment records."
          />
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchPayments(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchPayments(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Payments;