// src/pages/EditCourseVideos.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AppContext } from "../../context/AppContext";

const API_BASE = "/api/v1";

const EditCourseVideos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AppContext);

  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [originalResources, setOriginalResources] = useState([]);
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDuration, setLectureDuration] = useState("");
  const [lectureLink, setLectureLink] = useState("");
  const [editingResource, setEditingResource] = useState(null);
  const [nextTempId, setNextTempId] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      axios.get(`${API_BASE}/courses/${id}`)
        .then(res => {
          setCourse(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });

      axios.get(`${API_BASE}/courses/${id}/resources`)
        .then(res => {
          setResources(res.data);
          setOriginalResources(res.data);
        })
        .catch(err => console.error(err));
    }
  }, [id, currentUser]);

  if (loading) return <p className="text-center mt-5">Loading course...</p>;

  if (!course || course.instructorId !== currentUser?.id) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to edit this course.</p>
      </div>
    );
  }

  const handleCourseChange = e => setCourse({ ...course, [e.target.name]: e.target.value });

  const handleAddResource = () => {
    const newResource = {
      id: nextTempId,
      courseId: parseInt(id),
      title: lectureTitle,
      duration: lectureDuration,
      youtubeId: lectureLink.replace('https://www.youtube.com/watch?v=', ''),
      createdBy: course.instructorId,
      updatedBy: course.instructorId,
    };

    setResources([...resources, newResource]);
    setNextTempId(nextTempId - 1);
    setLectureTitle(""); setLectureDuration(""); setLectureLink("");
    toast.success("Resource added locally!");
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setLectureTitle(resource.title);
    setLectureDuration(resource.duration);
    setLectureLink(`https://www.youtube.com/watch?v=${resource.youtubeId}`);
  };

  const handleUpdateResource = () => {
    const updatedResource = {
      ...editingResource,
      title: lectureTitle,
      duration: lectureDuration,
      youtubeId: lectureLink.replace('https://www.youtube.com/watch?v=', ''),
    };

    setResources(resources.map(res => res.id === editingResource.id ? updatedResource : res));
    setEditingResource(null);
    setLectureTitle(""); setLectureDuration(""); setLectureLink("");
    toast.success("Resource updated locally!");
  };

  const handleDeleteResource = (resourceId) => {
    setResources(resources.filter(res => res.id !== resourceId));
    toast.success("Resource deleted locally!");
  };

  const handleCancelEdit = () => {
    setEditingResource(null);
    setLectureTitle(""); setLectureDuration(""); setLectureLink("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Update course details
      await axios.put(`${API_BASE}/courses/${id}`, course);

      // Update resources only when saving
      const resourceRequests = resources.map(res => ({
        title: res.title,
        duration: res.duration,
        youtubeLink: `https://www.youtube.com/watch?v=${res.youtubeId}`,
        createdBy: res.createdBy || course.instructorId,
        updatedBy: course.instructorId,
      }));
      await axios.put(`${API_BASE}/courses/${id}/resources`, resourceRequests);

      toast.success("Course and videos updated successfully!");
      navigate("/instructor-dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Error updating course and videos");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Edit Course Videos</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" value={course.title} onChange={handleCourseChange} className="w-full border p-2 rounded" placeholder="Course Title" required />
        <textarea name="description" value={course.description} onChange={handleCourseChange} className="w-full border p-2 rounded" placeholder="Description" required />
        <input type="text" name="image" value={course.image} onChange={handleCourseChange} className="w-full border p-2 rounded" placeholder="Image URL" required />
        
        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-semibold">Resources</h3>
          <ul>
            {resources.map((res, idx) => (
              <li key={res.id} className="flex justify-between items-center p-1 bg-gray-100 rounded mb-1">
                <span>{res.title} ({res.duration})</span>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => handleEditResource(res)} className="text-blue-600">
                    <FaEdit />
                  </button>
                  <button type="button" onClick={() => handleDeleteResource(res.id)} className="text-red-600">
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <input placeholder="Title" value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} className="w-full border p-1 rounded my-1"/>
          <input placeholder="Duration" value={lectureDuration} onChange={(e) => setLectureDuration(e.target.value)} className="w-full border p-1 rounded my-1"/>
          <input placeholder="YouTube Link" value={lectureLink} onChange={(e) => setLectureLink(e.target.value)} className="w-full border p-1 rounded my-1"/>
          {editingResource ? (
            <>
              <button type="button" onClick={handleUpdateResource} className="bg-green-600 text-white px-2 py-1 rounded mt-1 mr-2">Update Resource</button>
              <button type="button" onClick={handleCancelEdit} className="bg-gray-600 text-white px-2 py-1 rounded mt-1">Cancel</button>
            </>
          ) : (
            <button type="button" onClick={handleAddResource} className="bg-blue-600 text-white px-2 py-1 rounded mt-1">Add Resource</button>
          )}
        </div>

        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Save Videos</button>
      </form>
    </div>
  );
};

export default EditCourseVideos;
