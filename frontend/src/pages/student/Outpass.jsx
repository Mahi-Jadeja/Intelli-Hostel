import { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  X,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import outpassService from '../../services/outpass.service';
import toast from 'react-hot-toast';

const Outpass = () => {
  const [outpasses, setOutpasses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    from_date: '',
    to_date: '',
    reason: '',
  });

  const fetchOutpasses = async (page = 1) => {
    try {
      setLoading(true);
      const response = await outpassService.getMine({ page, limit: 10 });
      setOutpasses(response.data.data.data);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch outpasses:', error);
      toast.error('Failed to load outpass history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      from_date: '',
      to_date: '',
      reason: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from_date || !formData.to_date) {
      toast.error('Please select both dates');
      return;
    }

    if (new Date(formData.from_date) >= new Date(formData.to_date)) {
      toast.error('Return date must be after leave date');
      return;
    }

    if (formData.reason.trim().length < 5) {
      toast.error('Reason must be at least 5 characters');
      return;
    }

    setSubmitting(true);

    try {
      const response = await outpassService.create(formData);
      toast.success(response.data.message);

      resetForm();
      setShowModal(false);
      fetchOutpasses();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to submit outpass request';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Outpass</h1>
        </div>

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Outpass</h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Request Outpass
        </button>
      </div>

      {/* List */}
      {outpasses.length > 0 ? (
        <div className="space-y-4">
          {outpasses.map((item) => (
            <Card key={item._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1">
                    <StatusIcon status={item.status} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">
                        {item.reason}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        {formatDate(item.from_date)} — {formatDate(item.to_date)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400">
                      Requested on {formatDate(item.createdAt)}
                    </div>

                    {item.admin_remark && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-3">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          Admin Remark:
                        </p>
                        <p className="text-sm text-blue-800">
                          {item.admin_remark}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Badge status={item.status}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </div>
            </Card>
          ))}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => fetchOutpasses(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => fetchOutpasses(pagination.currentPage + 1)}
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
            icon={FileText}
            title="No outpass requests yet"
            description="You haven't requested any outpasses yet."
            action={{
              label: 'Request Outpass',
              onClick: () => setShowModal(true),
            }}
          />
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Request Outpass
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="from_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  From Date *
                </label>
                <input
                  id="from_date"
                  name="from_date"
                  type="date"
                  value={formData.from_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="to_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  To Date *
                </label>
                <input
                  id="to_date"
                  name="to_date"
                  type="date"
                  value={formData.to_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Explain why you need the outpass"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.reason.length}/300 characters
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Outpass;