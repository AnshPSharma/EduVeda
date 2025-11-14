import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";

import CourseDetail from "./pages/Student/CourseDetail";
import CoursePlayer from "./pages/Student/CoursePlayer";
import Certificate from "./pages/Student/Certificate";
import LearningDashboard from "./pages/Student/LearningDashboard";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import CreateCourse from "./pages/Instructor/CreateCourse";
import EditCourse from "./pages/InstructorEdit/EditCourse";
import EditCourseVideos from "./pages/InstructorEdit/EditCourseVideos";
import EditCourseAssessments from "./pages/InstructorEdit/EditCourseAssessments";
import Enrollment from "./pages/Student/Enrollment";
import Notifications from "./pages/Notifications";
import Announcements from "./pages/Announcements";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SearchResults from "./pages/SearchResults";
import InstructorHome from "./pages/Instructor/InstructorHome";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./context/AppContext";
import CreateAssessment from "./pages/Instructor/CreateAssessment";
import CreateAnnouncement from "./pages/Instructor/CreateAnnouncement";

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route
            path="/course-player/:courseId"
            element={
              <ProtectedRoute role={["Student", "Instructor"]}>
                <CoursePlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enroll"
            element={
              <ProtectedRoute role="Student">
                <Enrollment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <Announcements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchResults />} />

          {/* Protected Student Routes */}
          <Route
            path="/student-home"
            element={
              <ProtectedRoute role="Student">
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-dashboard"
            element={
              <ProtectedRoute role="Student">
                <LearningDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificate/:courseId"
            element={
              <ProtectedRoute role={["Student", "Instructor"]}>
                <Certificate />
              </ProtectedRoute>
            }
          />

          {/* Protected Instructor Routes */}
          <Route
            path="/instructor-home"
            element={
              <ProtectedRoute role="Instructor">
                <InstructorHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-dashboard"
            element={
              <ProtectedRoute role="Instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-course"
            element={
              <ProtectedRoute role="Instructor">
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-course/:id"
            element={
              <ProtectedRoute role="Instructor">
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-course/:id/videos"
            element={
              <ProtectedRoute role="Instructor">
                <EditCourseVideos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-course/:id/assessments"
            element={
              <ProtectedRoute role="Instructor">
                <EditCourseAssessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-assessment"
            element={
              <ProtectedRoute role="Instructor">
                <CreateAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-announcement"
            element={
              <ProtectedRoute role="Instructor">
                <CreateAnnouncement />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-center" autoClose={2000} transition={Slide} />
      </div>
    </Router>
    </AppProvider>
  );
}

export default App;
