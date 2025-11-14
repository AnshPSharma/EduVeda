import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from 'react-toastify';

const API_BASE = "/api/v1";

const Enrollment = () => {
  const { currentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [resourcesCount, setResourcesCount] = useState({});

  useEffect(() => {
    // Load courses
    axios
      .get(`${API_BASE}/courses`)
      .then((res) => {
        const courseList = res.data.courses || res.data;
        setCourses(courseList);
        // Load resources count for each course
        courseList.forEach(course => {
          axios.get(`${API_BASE}/courses/${course.id}/resources`)
            .then(res => {
              const resources = res.data || [];
              setResourcesCount(prev => ({ ...prev, [course.id]: resources.length }));
            })
            .catch(err => console.error(err));
        });
      })
      .catch((err) => console.error(err));

    // Load user's enrollments to track which courses they're enrolled in
    if (currentUser) {
      axios
        .get(`${API_BASE}/enrollments/student/${currentUser.id}`)
        .then((res) => {
          const enrollments = res.data;
          const enrolledCourseIds = new Set(enrollments.map(e => String(e.courseId)));
          setEnrolledCourses(enrolledCourseIds);
        })
        .catch((err) => console.error(err));
    }
  }, [currentUser]);

  const handleEnroll = async (course) => {
    if (!currentUser) {
      return;
    }

    const isEnrolled = enrolledCourses.has(String(course.id));

    try {
      if (isEnrolled) {
        // Unenroll - find the enrollment ID first
        const enrollmentsResponse = await axios.get(`${API_BASE}/enrollments?userId=${currentUser.id}`);
        const enrollments = enrollmentsResponse.data;
        const enrollment = enrollments.find(e =>
          String(e.studentId) === String(currentUser.id) && String(e.courseId) === String(course.id)
        );

        if (enrollment) {
          await axios.delete(`${API_BASE}/enrollments/${enrollment.id}`);
          // Remove progress data when unenrolling
          await axios.delete(`${API_BASE}/module-progress?user_id=${currentUser.id}&course_id=${course.id}`);
          toast.success("Unenrolled successfully!");
          setEnrolledCourses(prev => {
            const newSet = new Set(prev);
            newSet.delete(String(course.id));
            return newSet;
          });
        }
      } else {
        // Enroll
        await axios.post(`${API_BASE}/enrollments`, {
          studentId: currentUser.id,
          courseId: course.id,
          createdBy: currentUser.id,
          updatedBy: currentUser.id,
        });
        toast.success("Enrolled successfully!");
        setEnrolledCourses(prev => new Set(prev).add(String(course.id)));
        navigate(`/course-player/${course.id}`);
      }

        } catch (err) {
      console.error("Error:", err);
      toast.error(isEnrolled ? "Error unenrolling" : "Error enrolling");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Enroll in Courses</h2>
      <div className="flex flex-wrap gap-6">
        {courses.map((course) => {
          const isEnrolled = enrolledCourses.has(String(course.id));
          return (
            <div key={course.id} className={`border p-4 rounded w-72 ${isEnrolled ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
              <h3 className="text-lg font-bold">{course.title}</h3>
              <p>Instructor: {course.instructor}</p>
              <p>Lessons: {resourcesCount[course.id] || 0}</p>
              {isEnrolled && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 shadow-sm flex items-center">
                    <span className="mr-1">✓</span> Enrolled
                  </span>
                </div>
              )}
              <button
                className={`${isEnrolled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1 mt-3 rounded`}
                onClick={() => handleEnroll(course)}
              >
                {isEnrolled ? 'Unenroll' : 'Enroll'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Enrollment;
