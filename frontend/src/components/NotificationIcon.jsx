import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { IoNotificationsOutline } from 'react-icons/io5';

const NotificationIcon = () => {
  const { currentUser, notifications, setNotifications } = useAppContext();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load notifications from backend when user logs in
    const loadNotifications = async () => {
      if (currentUser) {
        try {
          const response = await fetch(`/api/v1/notifications?userId=${currentUser.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data) {
            setNotifications(data);
          }
        } catch (error) {
          console.error('Failed to load notifications:', error);
        }
      }
    };

    loadNotifications();
  }, [currentUser, setNotifications]);

  // Refresh notifications periodically
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/notifications?userId=${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data) {
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to refresh notifications:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, setNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.readAt).length);
  }, [notifications]);

  const handleClick = () => {
    navigate('/notifications');
  };

  if (!currentUser) return null;

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-purple-600 focus:outline-none"
      title="Notifications"
    >
      <IoNotificationsOutline className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationIcon;
