import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedbackService, categoryService } from '../services/api';
import { Feedback, FeedbackStatus, Category } from '../types';
import { Filter, Eye, MessageSquare } from 'lucide-react';

const ManageReports = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [feedbackRes, categoryRes] = await Promise.all([
        feedbackService.getAll({ status: statusFilter || undefined, categoryId: categoryFilter ? parseInt(categoryFilter) : undefined }),
        categoryService.getAll(),
      ]);
      setFeedbacks(feedbackRes.data.feedbacks);
      setCategories(categoryRes.data.categories);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedFeedback || !newStatus) return;
    try {
      await feedbackService.updateStatus(selectedFeedback.id, { status: newStatus });
      fetchData();
      setSelectedFeedback(null);
      setNewStatus('');
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddResponse = async () => {
    if (!selectedFeedback || !responseMessage.trim()) return;
    try {
      await feedbackService.addResponse(selectedFeedback.id, responseMessage);
      setResponseMessage('');
      fetchData();
    } catch (err) {
      console.error('Failed to add response:', err);
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    const badges = {
      [FeedbackStatus.SUBMITTED]: 'badge-submitted',
      [FeedbackStatus.PROCESSING]: 'badge-processing',
      [FeedbackStatus.COMPLETED]: 'badge-completed',
      [FeedbackStatus.REJECTED]: 'badge-rejected',
    };
    return badges[status] || 'badge-submitted';
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Reports</h1>

      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">{feedback.subject || 'No Subject'}</h3>
                  <span className={`badge ${getStatusBadge(feedback.status)}`}>{feedback.status}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">{feedback.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{feedback.category?.categoryName}</span>
                  <span>•</span>
                  <span>{formatDate(feedback.submissionDate)}</span>
                  <span>•</span>
                  <span>{feedback.isAnonymous ? 'Anonymous' : feedback.user?.name || 'User'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link to={`/reports/${feedback.id}`} className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                  <Eye size={20} className="text-gray-500" />
                </Link>
                <button onClick={() => { setSelectedFeedback(feedback); setNewStatus(feedback.status); }} className="p-2 hover:bg-gray-100 rounded-lg" title="Respond">
                  <MessageSquare size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Feedback</h2>
            <div className="mb-4">
              <h3 className="font-medium text-gray-700">{selectedFeedback.subject}</h3>
              <p className="text-gray-600 text-sm mt-1">{selectedFeedback.content}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <div className="flex gap-2">
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field flex-1">
                  <option value="submitted">Submitted</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={handleStatusUpdate} className="btn-primary">Update</button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Response</label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="Write your response..."
              />
              <button onClick={handleAddResponse} className="btn-primary mt-2" disabled={!responseMessage.trim()}>
                Send Response
              </button>
            </div>
            <button onClick={() => setSelectedFeedback(null)} className="btn-secondary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReports;
