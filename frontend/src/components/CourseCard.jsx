// src/components/CourseCard.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from "axios";
import { AppContext } from "../context/AppContext";

const API_BASE = "/api/v1";

export default function CourseCard({ course, isEnrolled, showEnroll, onEnroll, isOwnCourse }) {
  const navigate = useNavigate();
  const { currentUser } = useContext(AppContext);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isEnrolled && currentUser?.id) {
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
          const progressValue = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

          setProgress(progressValue);
        })
        .catch(err => console.error("Error fetching progress:", err));
    }
  }, [isEnrolled, currentUser, course.id]);

  const handleCardClick = () => {
    if (isOwnCourse) {
      toast.info("You cannot enroll in your own course");
      return;
    }
    navigate(`/courses/${course.id}`);
  };

  return (
    <div className={`relative bg-white border rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 duration-300 overflow-hidden ${isOwnCourse ? 'opacity-75' : ''}`}>
      {/* Course Image */}
      <img
        src={course.image}
        alt={course.title}
        className={`w-full h-44 object-cover ${isOwnCourse ? '' : 'cursor-pointer'}`}
        onClick={handleCardClick}
      />

      {/* Content */}
      <div className={`p-5 ${isOwnCourse ? '' : 'cursor-pointer'}`} onClick={handleCardClick}>
        <h3 className="font-bold text-lg text-gray-800">{course.title}</h3>
        <p className="text-gray-500 text-sm mt-1">{course.instructor}</p>
        <p className="text-gray-800 font-semibold mt-2">{course.price}</p>
        {isEnrolled && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% Complete</p>
          </div>
        )}
      </div>

      {/* Enrolled Badge or Enroll Button */}
      {isEnrolled ? (
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 shadow-sm flex items-center">
            <span className="mr-1">✓</span> Enrolled
          </span>
        </div>
      ) : showEnroll ? (
        <div className="p-5 pt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnroll();
            }}
            className="w-full bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600"
          >
            Enroll
          </button>
        </div>
      ) : null}
    </div>
  );
}
