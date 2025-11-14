// src/pages/InstructorHome.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import CourseCard from "../../components/CourseCard";
import { AppContext } from "../../context/AppContext";

const API_BASE = "/api/v1";

export default function InstructorHome() {
  const { currentUser } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/courses`)
      .then((res) => setCourses(res.data.courses || res.data))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      axios
        .get(`${API_BASE}/enrollments?userId=${currentUser.id}`)
        .then((res) => {
          const enrollments = res.data || [];
          const studentEnrollments = enrollments.filter(e => String(e.studentId) === String(currentUser.id));
          setEnrolledCourses(studentEnrollments.map(e => e.courseId));
        })
        .catch((err) => console.error("Error fetching enrollments:", err));
    }
  }, [currentUser]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">Welcome back, {currentUser?.name}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = enrolledCourses.includes(course.id);
          const isOwnCourse = course.instructorId === currentUser?.id;
          return (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={isEnrolled}
              isOwnCourse={isOwnCourse}
            />
          );
        })}
      </div>
    </div>
  );
}
