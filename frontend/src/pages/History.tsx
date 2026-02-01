import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedbackService } from '../services/api';
import { Feedback, FeedbackStatus } from '../types';
import { Clock, Eye, EyeOff } from 'lucide-react';

const History = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await feedbackService.getMyFeedbacks();
        setFeedbacks(response.data.feedbacks);
      } catch (err) {
        console.error('Failed to fetch feedbacks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const getStatusBadge = (status: FeedbackStatus) => {
    const badges = {
      [FeedbackStatus.SUBMITTED]: 'badge-submitted',
      [FeedbackStatus.PROCESSING]: 'badge-processing',
      [FeedbackStatus.COMPLETED]: 'badge-completed',
      [FeedbackStatus.REJECTED]: 'badge-rejected',
    };
    return badges[status] || 'badge-submitted';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Submission History</h1>

      {feedbacks.length === 0 ? (
        <div className="card text-center py-12">
          <Clock size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No submissions yet</h3>
          <p className="text-gray-600 mb-4">You haven't submitted any feedback yet.</p>
          <Link to="/submit" className="btn-primary inline-block">
            Submit Your First Feedback
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Link
              key={feedback.id}
              to={`/reports/${feedback.id}`}
              className="card block hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {feedback.subject || 'No Subject'}
                    </h3>
                    {feedback.isAnonymous && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        <EyeOff size={12} />
                        Anonymous
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {feedback.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{feedback.category?.categoryName}</span>
                    <span>•</span>
                    <span>{formatDate(feedback.submissionDate)}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <span className={`badge ${getStatusBadge(feedback.status)}`}>
                    {feedback.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
