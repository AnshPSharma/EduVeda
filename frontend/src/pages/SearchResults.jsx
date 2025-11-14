import React, { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import CourseCard from "../components/CourseCard";
import { AppContext } from "../context/AppContext";

const API_BASE = "/api/v1";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { currentUser, enrollments } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/courses`)
      .then((res) => setCourses(res.data.courses || res.data))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  useEffect(() => {
    if (query && courses.length > 0) {
      const filtered = courses.filter((course) =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.instructor.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  }, [query, courses]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        Search Results for "{query}"
      </h1>
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrollments.some(
              (e) =>
                String(e.studentId) === String(currentUser?.id) &&
                String(e.courseId) === String(course.id)
            );
            const isOwnCourse = currentUser?.role === "Instructor" && course.instructorId === currentUser?.id;
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
      ) : (
        <p className="text-gray-500">No courses found matching your search.</p>
      )}
    </div>
  );
};

export default SearchResults;
