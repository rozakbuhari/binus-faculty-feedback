import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/api';
import { Notification } from '../types';
import { Bell, Check, CheckCheck } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll();
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return hours < 1 ? 'Just now' : `${hours}h ago`;
    return d.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={handleMarkAllAsRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No notifications</h3>
          <p className="text-gray-600">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card flex items-start gap-4 ${!notification.isRead ? 'bg-teal-50 border-teal-100' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-teal-500' : 'bg-gray-200'}`}>
                <Bell size={20} className={!notification.isRead ? 'text-white' : 'text-gray-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-gray-800">{notification.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    {notification.referenceId && (
                      <Link to={`/reports/${notification.referenceId}`} className="text-teal-600 text-sm hover:underline mt-2 inline-block">
                        View Report →
                      </Link>
                    )}
                  </div>
                  {!notification.isRead && (
                    <button onClick={() => handleMarkAsRead(notification.id)} className="text-gray-400 hover:text-teal-600" title="Mark as read">
                      <Check size={20} />
                    </button>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-2">{formatDate(notification.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
