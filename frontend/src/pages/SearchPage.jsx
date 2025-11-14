import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import CourseCard from "../components/CourseCard";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const API_BASE = "/api/v1";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchPage = () => {
  const queryParam = useQuery().get("query") || "";
  const [query, setQuery] = useState(queryParam);
  const [courses, setCourses] = useState([]);
  const { currentUser, enrollments } = useContext(AppContext);

  useEffect(() => {
    if (query.trim() !== "") {
      axios
        .get(`${API_BASE}/courses?title_like=${query}`)
        .then(res => setCourses(res.data.courses || res.data))
        .catch(err => console.error(err));
    } else {
      setCourses([]);
    }
  }, [query]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Search Results for "{query}"</h2>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrollments.some(
              (e) =>
                String(e.studentId) === String(currentUser?.id) &&
                String(e.courseId) === String(course.id)
            );
            return <CourseCard key={course.id} course={course} isEnrolled={isEnrolled} />;
          })}
        </div>
      ) : (
        <p>No courses found.</p>
      )}
    </div>
  );
};

export default SearchPage;
