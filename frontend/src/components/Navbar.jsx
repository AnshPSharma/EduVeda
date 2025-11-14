//Dynamic Navbar
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import logo from "../../owl-logo.webp";
import SearchBar from "./SearchBar";
import NotificationIcon from "./NotificationIcon";

const Navbar = () => {
  const { currentUser, logout, announcementCount, setAnnouncementCount } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const fetchAnnouncementCount = async () => {
      if (currentUser?.id && currentUser.role === "Student") {
        try {
          // Fetch enrollments
          const enrollmentResponse = await fetch(`/api/v1/enrollments?userId=${currentUser.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const enrollmentData = await enrollmentResponse.json();
          const enrolledCourseIds = enrollmentData.map(e => e.courseId);

          if (enrolledCourseIds.length > 0) {
            // Fetch announcements
            const announcementResponse = await fetch('/api/v1/announcements', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            const announcementData = await announcementResponse.json();
            const allAnnouncements = announcementData || [];

            // Filter announcements for enrolled courses and not expired (all are unread since read ones are deleted)
            const pendingAnnouncements = allAnnouncements.filter(announcement =>
              enrolledCourseIds.includes(announcement.courseId) &&
              new Date(announcement.expires_at) > new Date()
            );

            setAnnouncementCount(pendingAnnouncements.length);
          } else {
            setAnnouncementCount(0);
          }
        } catch (error) {
          console.error('Failed to fetch announcement count:', error);
          setAnnouncementCount(0);
        }
      } else {
        setAnnouncementCount(0);
      }
    };

    fetchAnnouncementCount();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currentUser]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo + Brand */}
        <Link
          to={
            currentUser?.role === "Instructor"
              ? "/instructor-dashboard"
              : currentUser?.role === "Student"
              ? "/student-home"
              : "/"
          }
          className="flex items-center gap-2 text-xl font-bold text-purple-700 hover:text-purple-800 transition"
        >
          <img src={logo} alt="EduVeda Logo" className="w-10 h-10" />
          <span>EduVeda</span>
        </Link>

        {/* Search Bar and Links */}
        {!isAuthPage && (
          <div className="flex items-center gap-6 text-gray-700 font-medium">
            {currentUser && <SearchBar />}
            {currentUser && <NotificationIcon />}

            {currentUser?.role === "Student" && (
              <>
                <Link
                  to="/student-home"
                  className="hover:text-purple-600 transition"
                >
                  Home
                </Link>
                <Link
                  to="/learning-dashboard"
                  className="hover:text-purple-600 transition"
                >
                  My Learning
                </Link>
              </>
            )}

            {currentUser?.role === "Instructor" && (
              <Link
                to="/instructor-home"
                className="hover:text-purple-600 transition"
              >
                Home
              </Link>
            )}

            {currentUser ? (
              <>
                {currentUser.role === "Instructor" && (
                  <Link
                    to="/instructor-dashboard"
                    className="hover:text-purple-600 transition"
                  >
                    Instructor Dashboard
                  </Link>
                )}

                {/* Dropdown Menu */}
                <div className="relative mt-2 dropdown-container">
                  <button
                    onClick={toggleDropdown}
                    className="relative p-2 hover:text-purple-600 transition"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    {currentUser?.role === "Student" && announcementCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {announcementCount > 9 ? '9+' : announcementCount}
                      </span>
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-purple-600 transition"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/announcements"
                          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:text-purple-600 transition"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {announcementCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0 mr-2">
                              {announcementCount}
                            </span>
                          )}
                          <span>Announcements</span>
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            navigate("/");
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-purple-600 transition"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm hover:bg-purple-200 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-sm shadow hover:shadow-lg transition"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

//Inder
//
