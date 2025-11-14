// src/pages/EditCourse.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const API_BASE = "/api/v1";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AppContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      axios
        .get(`${API_BASE}/courses/${id}`)
        .then((res) => {
          setCourse(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching course", err);
          setLoading(false);
        });
    }
  }, [id, currentUser]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  if (!course || course.instructorId !== currentUser?.id) {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-14 bg-white shadow-xl rounded-2xl text-center">
        <h2 className="text-3xl font-extrabold text-red-600 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-500 text-lg">
          You do not have permission to edit this course.
        </p>
      </div>
    );
  }

  const handleEditVideos = () => {
    navigate(`/edit-course/${id}/videos`);
  };

  const handleEditAssessments = () => {
    navigate(`/edit-course/${id}/assessments`);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-14 bg-white shadow-xl rounded-2xl text-center">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
        Edit Course: {course.title}
      </h2>
      <p className="mb-8 text-gray-500 text-lg">
        Choose what you want to edit for this course:
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-8">
        <div
          onClick={handleEditVideos}
          className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-6 rounded-2xl shadow-md hover:shadow-2xl hover:scale-105 transition duration-300"
        >
          <span className="text-4xl mb-2">🎬</span>
          <span className="font-semibold text-lg">Edit Course Videos</span>
        </div>

        <div
          onClick={handleEditAssessments}
          className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6 rounded-2xl shadow-md hover:shadow-2xl hover:scale-105 transition duration-300"
        >
          <span className="text-4xl mb-2">📝</span>
          <span className="font-semibold text-lg">Edit Assessments</span>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
