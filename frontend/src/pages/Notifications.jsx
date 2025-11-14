import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

const Notifications = () => {
  const { notifications, setNotifications, currentUser } = useContext(AppContext);
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    setLocalNotifications(notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [notifications]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const updated = localNotifications.filter(n => n.id !== id);
      setLocalNotifications(updated);
      setNotifications(updated);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const putPromises = localNotifications.map(n =>
        fetch(`/api/v1/notifications/${n.id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      );
      await Promise.all(putPromises);
      setLocalNotifications([]);
      setNotifications([]);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course_update':
        return '📚';
      case 'assessment':
        return '📝';
      case 'enrollment':
        return '👥';
      case 'feedback':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Notifications</h2>
        {localNotifications.some(n => !n.readAt) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {localNotifications.length > 0 ? (
        <div className="space-y-4">
          {localNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-lg border-l-4 transition-all ${
                n.readAt
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-blue-50 border-blue-500 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getNotificationIcon(n.type)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {n.title}
                    </h3>
                    <p className="text-sm mt-1 text-gray-800">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Mark as read
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 text-lg">No notifications yet.</p>
          <p className="text-gray-400 text-sm mt-2">
            {currentUser?.role === 'Student'
              ? "You'll receive updates about new courses and assessments here."
              : "You'll receive updates about enrollments and feedback here."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
