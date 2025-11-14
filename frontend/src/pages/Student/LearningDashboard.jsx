// src/pages/LearningDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api/v1";

export default function LearningDashboard() {
  const { currentUser, enrollments } = useContext(AppContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    axios
      .get(`${API_BASE}/courses`)
      .then((res) => {
        const allCourses = res.data.courses || res.data;
        const myCourses = allCourses.filter((course) =>
          enrollments?.some(
            (e) =>
              String(e.studentId) === String(currentUser.id) &&
              String(e.courseId) === String(course.id)
          )
        );
        setEnrolledCourses(myCourses);

        // Fetch progress for each enrolled course
        myCourses.forEach((course) => {
          // Fetch resources and assessments to calculate total items
          Promise.all([
            axios.get(`${API_BASE}/courses/${course.id}/resources`),
            axios.get(`${API_BASE}/assessments/course/${course.id}`),
            axios.get(`${API_BASE}/module-progress?user_id=${currentUser.id}&course_id=${course.id}`),
            axios.get(`${API_BASE}/assessment-progress?user_id=${currentUser.id}&course_id=${course.id}`)
          ])
            .then(([resourcesRes, assessmentsRes, moduleProgressRes, assessmentProgressRes]) => {
              const resources = resourcesRes.data;
              const assessments = assessmentsRes.data;
              const moduleProgress = moduleProgressRes.data.module_progress || moduleProgressRes.data;
              const assessmentProgress = assessmentProgressRes.data;

              const totalItems = resources.length + assessments.length;
              const completedResources = moduleProgress.filter(p => p.completed).length;
              const passedAssessments = assessmentProgress.filter(ap => ap.passed).length;
              const completedItems = completedResources + passedAssessments;
              const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

              setCourseProgress((prev) => ({ ...prev, [course.id]: progress }));
            })
            .catch((err) => console.error("Error fetching progress:", err));
        });
      })
      .catch((err) => console.error("Error fetching courses:", err));
  }, [currentUser, enrollments]);

  if (!currentUser) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Learning</h2>

      {enrolledCourses.length === 0 ? (
        <p>You have not enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition"
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="text-indigo-600 font-bold">{course.price}</p>

              {/* Progress Bar */}
              <div className="mt-3 mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(courseProgress[course.id] || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${courseProgress[course.id] || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <button
                  onClick={() => navigate(`/course-player/${course.id}`)}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Continue Learning
                </button>
                {Math.round(courseProgress[course.id] || 0) === 100 && (
                  <button
                    onClick={() => navigate(`/certificate/${course.id}`)}
                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Download Certificate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


