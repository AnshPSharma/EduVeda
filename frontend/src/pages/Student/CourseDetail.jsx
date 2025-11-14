// src/pages/CourseDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaStar, FaUser, FaClock, FaPlay, FaBook, FaCheckCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";

const API_BASE = "/api/v1";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, enrollments, setEnrollments } = useContext(AppContext);

  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to landing page if user logs out
  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/courses/${id}`)
      .then((res) => {
        setCourse(res.data);
      })
      .catch(() => setLoading(false));

    axios
      .get(`${API_BASE}/courses/${id}/resources`)
      .then((res) => {
        setResources(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!enrollments || enrollments.length === 0) {
      axios
        .get(`${API_BASE}/enrollments`)
        .then((res) => setEnrollments(res.data))
        .catch(() => {});
    }
  }, [enrollments, setEnrollments]);

  const isEnrolled = enrollments?.some(
    (e) => String(e.studentId) === String(currentUser?.id) && String(e.courseId) === String(id)
  );

  const handleEnroll = async () => {
    if (!currentUser) return;
    if (isEnrolled) {
      navigate(`/course-player/${id}`);
      return;
    }
    try {
      const newEnrollment = { studentId: currentUser.id, courseId: id, status: "enrolled", createdBy: currentUser.id, updatedBy: currentUser.id };
      const res = await axios.post(`${API_BASE}/enrollments`, newEnrollment);
      setEnrollments([...enrollments, res.data]);
      navigate(`/course-player/${id}`);
    } catch (err) {
      console.error("Error enrolling:", err);
    }
  };

  const handleUnenroll = async () => {
    try {
      const enrollment = enrollments.find(
        (e) => String(e.studentId) === String(currentUser?.id) && String(e.courseId) === String(id)
      );
      if (!enrollment) return;

      await axios.delete(`${API_BASE}/enrollments/${enrollment.id}`);
      setEnrollments(enrollments.filter((e) => e.id !== enrollment.id));
    } catch (err) {
      console.error("Error unenrolling:", err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (!course) return <p className="text-center mt-10 text-red-500">Course not found</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-blue-100">(4.5)</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="text-blue-200" />
                  <span>Created by {course.instructor}</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">{course.title}</h1>
              <p className="text-xl text-blue-100 leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <FaClock className="text-blue-200" />
                  <span>Self-paced</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <FaBook className="text-blue-200" />
                  <span>{resources.length} lectures</span>
                </div>
              </div>
            </div>
            <div className="lg:ml-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{course.price}</div>
                  <div className="text-sm text-gray-500">Lifetime access</div>
                </div>
                {isEnrolled ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/course-player/${id}`)}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <FaPlay className="text-sm" />
                      Continue Learning
                    </button>
                    <button
                      onClick={handleUnenroll}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
                    >
                      Unenroll from Course
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Enroll Now
                  </button>
                )}
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span>Access on mobile and TV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Master fundamental concepts</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Build real-world projects</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Learn industry best practices</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Get certified upon completion</span>
                </div>
              </div>
            </div>

            {/* Course Content */}
            {resources.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course content</h2>
                <div className="space-y-4">
                  {resources.map((res, index) => (
                    <div key={res.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaPlay className="text-blue-600 text-sm" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{res.title}</h3>
                            <p className="text-sm text-gray-500">{res.duration}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Lecture {index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{resources.length} lectures</span>
                    <span>Total duration: {resources.reduce((acc, res) => acc + parseInt(res.duration || 0), 0)} minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Instructor Info */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your instructor</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.instructor}</h3>
                  <p className="text-gray-600 mb-4">Expert instructor with years of experience in teaching and industry practice.</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span>{course.rating} Instructor Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUser className="text-blue-500" />
                      <span>10,000+ Students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaPlay className="text-blue-500" />
                    <span className="text-gray-700">On-demand video</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaBook className="text-blue-500" />
                    <span className="text-gray-700">Downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-blue-500" />
                    <span className="text-gray-700">Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaClock className="text-blue-500" />
                    <span className="text-gray-700">Self-paced learning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
