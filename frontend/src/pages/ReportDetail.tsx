import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { feedbackService } from '../services/api';
import { Feedback, FeedbackStatus } from '../types';
import { ArrowLeft, Paperclip, EyeOff, MessageSquare } from 'lucide-react';

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!id) return;
      try {
        const response = await feedbackService.getById(id);
        setFeedback(response.data.feedback);
      } catch (err) {
        console.error('Failed to fetch feedback:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, [id]);

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
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Feedback not found</p>
        <Link to="/history" className="btn-primary inline-block mt-4">Back to History</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/history" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft size={20} />
        <span>Back to History</span>
      </Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{feedback.subject || 'No Subject'}</h1>
            <p className="text-gray-500 mt-1">{feedback.category?.categoryName}</p>
          </div>
          <span className={`badge ${getStatusBadge(feedback.status)}`}>{feedback.status}</span>
        </div>

        {feedback.isAnonymous && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg mb-4">
            <EyeOff size={16} />
            <span>This feedback was submitted anonymously</span>
          </div>
        )}

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{feedback.content}</p>
        </div>

        <div className="mt-6 pt-4 border-t text-sm text-gray-500">
          Submitted on {formatDate(feedback.submissionDate)}
        </div>

        {feedback.attachments && feedback.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments</h3>
            <div className="space-y-2">
              {feedback.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={`http://localhost:3000/${attachment.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
                >
                  <Paperclip size={16} />
                  <span>{attachment.originalName}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {feedback.responses && feedback.responses.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare size={20} />
            Responses ({feedback.responses.length})
          </h2>
          <div className="space-y-4">
            {feedback.responses.map((response) => (
              <div key={response.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{response.admin?.name || 'Admin'}</span>
                  <span className="text-sm text-gray-500">{formatDate(response.createdAt)}</span>
                </div>
                <p className="text-gray-700">{response.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
