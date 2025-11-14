import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "/api/v1";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [enrollments, setEnrollments] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    if (currentUser) {
      return JSON.parse(localStorage.getItem(`notifications_${currentUser.id}`)) || [];
    }
    return [];
  });
  const [announcementCount, setAnnouncementCount] = useState(0);


  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      // Load user-specific notifications
      const savedNotifications = JSON.parse(localStorage.getItem(`notifications_${currentUser.id}`)) || [];
      setNotifications(savedNotifications);
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      axios
        .get(`${API_BASE}/enrollments?userId=${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then((res) => setEnrollments(res.data))
        .catch(() => setEnrollments([]));
    } else {
      setEnrollments([]);
    }
  }, [currentUser, token]);

  const login = (user, jwtToken) => {
    setCurrentUser(user);
    setToken(jwtToken);
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("token", jwtToken);
  };

  const logout = () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(unreadNotifications));
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setEnrollments([]);
    setNotifications([]);
    setAnnouncementCount(0);
    toast.success("Logged out successfully");
  };

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (currentUser && notifications.length > 0) {
      localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(notifications));
    }
  }, [notifications, currentUser]);



  // Set up axios interceptor to include JWT token in requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        enrollments,
        setEnrollments,
        notifications,
        setNotifications,
        announcementCount,
        setAnnouncementCount,

      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext };

export const useAppContext = () => {
  return useContext(AppContext);
};


// announcement and progress successfully added
