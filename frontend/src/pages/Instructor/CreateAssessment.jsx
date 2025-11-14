import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from 'react-toastify';

const API_BASE = "/api/v1";

export default function CreateAssessment() {
  const { currentUser } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", ""], answer: "" },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) {
      axios
        .get(`${API_BASE}/courses/instructor/${currentUser.id}`)
        .then((res) => setCourses(res.data || []))
        .catch((err) => console.error("Error fetching courses:", err));
    }
  }, [currentUser]);

  const handleQuestionChange = (qIdx, field, value) => {
    const updated = [...questions];
    updated[qIdx][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", ""], answer: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !courseId) {
      toast.error("Please provide a title and select a course.");
      return;
    }

    const newAssessment = {
      courseId: parseInt(courseId),
      title,
      description,
      questions,
      createdBy: currentUser?.id,
      updatedBy: currentUser?.id,
    };

    try {
      await axios.post(`${API_BASE}/assessments`, newAssessment);
      toast.success("Assessment created successfully!");
      navigate("/instructor-dashboard");
    } catch (err) {
      console.error("Error creating assessment:", err);
      toast.error("Failed to create assessment");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Create New Assessment</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium">Assessment Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
            rows={3}
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
          <h2 className="font-semibold mb-2">Questions</h2>
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="border p-3 mb-4 rounded bg-gray-50 shadow-sm"
            >
              <label className="block font-medium mb-1">Question {qIdx + 1}</label>
              <input
                type="text"
                placeholder="Enter question"
                value={q.text}
                onChange={(e) =>
                  handleQuestionChange(qIdx, "text", e.target.value)
                }
                className="w-full border rounded p-2 mb-2"
              />
              {q.options.map((opt, optIdx) => (
                <input
                  key={optIdx}
                  type="text"
                  placeholder={`Option ${optIdx + 1}`}
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(qIdx, optIdx, e.target.value)
                  }
                  className="w-full border rounded p-2 mb-1"
                />
              ))}
              <input
                type="text"
                placeholder="Correct Answer"
                value={q.answer}
                onChange={(e) =>
                  handleQuestionChange(qIdx, "answer", e.target.value)
                }
                className="w-full border rounded p-2 mt-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Question
          </button>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Create Assessment
        </button>
      </form>
    </div>
  );
}
