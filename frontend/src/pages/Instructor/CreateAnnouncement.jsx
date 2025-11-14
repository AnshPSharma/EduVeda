import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from 'react-toastify';

const API_BASE = "/api/v1";

export default function CreateAnnouncement() {
  const { currentUser } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState(1); // Default 1 days
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) {
      
      axios
        .get(`${API_BASE}/courses/instructor/${currentUser.id}`)
        .then((res) => setCourses(res.data))
        .catch((err) => console.error("Error fetching courses:", err));
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message || !courseId) {
      toast.error("Please provide a title, message, and select a course.");
      return;
    }

    const newAnnouncement = {
      title,
      message,
      courseId: parseInt(courseId),
      expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: currentUser.id,
    };

    try {
      await axios.post(`${API_BASE}/announcements`, newAnnouncement);
      toast.success("Announcement created successfully!");
      navigate("/instructor-dashboard");
    } catch (err) {
      console.error("Error creating announcement:", err);
      toast.error("Failed to create announcement");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Create New Announcement</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium">Announcement Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded p-2"
            rows={5}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Select Course</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full border rounded p-2"
            required
          >
            <option value="">-- Select a course --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Duration (days)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border rounded p-2"
            min="1"
            max="30"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Announcement
        </button>
      </form>
    </div>
  );
}

//Repo Destroyed Again