// src/pages/InstructorDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const API_BASE = "/api/v1";

export default function InstructorDashboard() {
  const { currentUser } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [courseProgress, setCourseProgress] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) {
      axios
        .get(`${API_BASE}/courses/instructor/${currentUser.id}`)
        .then((res) => setCourses(res.data))
        .catch((err) => console.error("Error fetching instructor courses", err));
    }
  }, [currentUser]);

  const fetchEnrollments = (courseId) => {
    axios
      .get(`${API_BASE}/enrollments/course/${courseId}`)
      .then((res) => {
        setEnrollments(prev => ({ ...prev, [courseId]: res.data }));
      })
      .catch((err) => console.error("Error fetching enrollments", err));
  };

  const toggleEnrollments = (courseId) => {
    if (enrollments[courseId]) {
      setEnrollments(prev => ({ ...prev, [courseId]: null }));
    } else {
      fetchEnrollments(courseId);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => navigate("/create-course")}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + Create New Course
        </button>
        <button
          onClick={() => navigate("/create-assessment")}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Create New Assessment
        </button>
        <button
          onClick={() => navigate("/create-announcement")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create New Announcement
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition"
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-indigo-600 font-bold">{course.price}</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/edit-course/${course.id}`)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit Course
                </button>
                <button
                  onClick={() => toggleEnrollments(course.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {enrollments[course.id] ? 'Hide Enrollments' : 'View Enrollments'}
                </button>
              </div>
              {enrollments[course.id] && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold mb-2">Enrollments ({enrollments[course.id].length})</h3>
                  {enrollments[course.id].length > 0 ? (
                    <ul className="list-disc list-inside">
                      {enrollments[course.id].map((enrollment) => (
                        <li key={enrollment.id} className="text-sm">
                          Student ID: {enrollment.studentId} - Status: {enrollment.status}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No enrollments yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 mt-4">
          You haven’t created any courses yet.
        </p>
      )}
    </div>
  );
}
