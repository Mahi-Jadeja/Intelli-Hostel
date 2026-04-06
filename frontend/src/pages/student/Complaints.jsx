import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import complaintService from '../../services/complaint.service';
import toast from 'react-hot-toast';

// Complaint categories
const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'food', label: 'Food' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'internet', label: 'Internet' },
  { value: 'security', label: 'Security' },
  { value: 'medical', label: 'Medical' },
  { value: 'noise', label: 'Noise' },
  { value: 'other', label: 'Other' },
];

const Complaints = () => {
  // ---- State ----
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---- Fetch complaints ----
  const fetchComplaints = async (page = 1) => {
    try {
      setLoading(true);
      const response = await complaintService.getMine({ page, limit: 10 });
      setComplaints(response.data.data.data);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ---- Handle form submission ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setSubmitting(true);

    try {
      const response = await complaintService.create({ category, description });
      toast.success(response.data.message);

      // Reset form and close modal
      setCategory('');
      setDescription('');
      setShowModal(false);

      // Refresh the list
      fetchComplaints();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit complaint';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Handle delete ----
  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      await complaintService.delete(deleteId);
      toast.success('Complaint deleted');

      // Refresh list
      fetchComplaints();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete complaint';
      toast.error(message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // ---- Helper: Format date ----
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ---- Helper: Format category/status ----
  const formatLabel = (str) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // ---- Helper: Status icon ----
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
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
      {/* ======== HEADER ======== */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          New Complaint
        </button>
      </div>

      {/* ======== COMPLAINTS LIST ======== */}
      {complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Status icon + content */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1">
                    <StatusIcon status={complaint.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Category + Priority */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">
                        {formatLabel(complaint.category)}
                      </span>
                      {complaint.priority === 'high' && (
                        <Badge status="high">High Priority</Badge>
                      )}
                      {complaint.priority === 'medium' && (
                        <Badge status="medium">Medium</Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-2">
                      {complaint.description}
                    </p>

                    {/* Admin remark (if any) */}
                    {complaint.admin_remark && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          Admin Response:
                        </p>
                        <p className="text-sm text-blue-800">
                          {complaint.admin_remark}
                        </p>
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Filed: {formatDate(complaint.createdAt)}</span>
                      {complaint.resolved_at && (
                        <span>
                          Resolved: {formatDate(complaint.resolved_at)}
                        </span>
                      )}
                      {complaint.room_no && (
                        <span>
                          Room: {complaint.hostel_block}-{complaint.room_no}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status badge + actions */}
                <div className="flex items-center gap-2">
                  <Badge status={complaint.status}>
                    {formatLabel(complaint.status)}
                  </Badge>

                  {/* Delete button (only for pending) */}
                  {complaint.status === 'pending' && (
                    <button
                      onClick={() => setDeleteId(complaint._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete complaint"
                    >
                      <Trash2 className="w-4 h-4" />
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
                onClick={() => fetchComplaints(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchComplaints(pagination.currentPage + 1)}
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
            icon={ClipboardList}
            title="No complaints yet"
            description="You haven't filed any complaints. Click the button above to submit one."
            action={{
              label: 'New Complaint',
              onClick: () => setShowModal(true),
            }}
          />
        </Card>
      )}

      {/* ======== NEW COMPLAINT MODAL ======== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                New Complaint
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail (minimum 10 characters)"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Actions */}
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
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======== DELETE CONFIRMATION MODAL ======== */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteId(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Complaint?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. The complaint will be permanently
              removed.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;