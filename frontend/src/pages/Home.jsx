import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import CourseCard from "../components/CourseCard";
import { AppContext } from "../context/AppContext";

const API_BASE = "/api/v1";

const Home = () => {
  const { currentUser, enrollments } = useContext(AppContext);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/courses`)
      .then((res) => setCourses(res.data.courses || res.data))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-purple-700">Welcome back, {currentUser?.name}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = enrollments.some(
            (e) =>
              String(e.studentId) === String(currentUser?.id) &&
              String(e.courseId) === String(course.id)
          );
          return <CourseCard key={course.id} course={course} isEnrolled={isEnrolled} />;
        })}
      </div>
    </div>
  );
};

export default Home;
