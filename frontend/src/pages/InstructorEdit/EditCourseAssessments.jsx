// src/pages/EditCourseAssessments.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaCheck } from 'react-icons/fa';
import { AppContext } from "../../context/AppContext";

const API_BASE = "/api/v1";

const EditCourseAssessments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AppContext);

  const [course, setCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [originalAssessments, setOriginalAssessments] = useState([]);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [newQuestions, setNewQuestions] = useState([]);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentOptions, setCurrentOptions] = useState(["", "", ""]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      // Fetch course to check instructor permission
      axios
        .get(`${API_BASE}/courses/${id}`)
        .then((res) => {
          setCourse(res.data);
        })
        .catch((err) => {
          console.error(err);
        });

      // Fetch assessments
      axios
        .get(`${API_BASE}/assessments/course/${id}`)
        .then((res) => {
          const data = res.data || [];
          const parsedAssessments = data.map(assess => ({
            ...assess,
            questions: JSON.parse(assess.questionsJson || '[]')
          }));
          setAssessments(parsedAssessments);
          setOriginalAssessments(parsedAssessments);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, currentUser]);

  if (loading) return <p className="text-center mt-5">Loading assessments...</p>;



  const handleEditAssessment = (assess) => {
    setEditingAssessment(assess);
    setAssessmentTitle(assess.title);
    setAssessmentDescription(assess.description);
    setNewQuestions([...assess.questions]);
  };

  const resetForm = () => {
    setAssessmentTitle("");
    setAssessmentDescription("");
    setNewQuestions([]);
    setCurrentQuestionText("");
    setCurrentOptions(["", "", ""]);
    setCurrentAnswer("");
    setEditingIndex(null);
    setEditingAssessment(null);
  };

  const handleDeleteAssessment = (assessId) => {
    setAssessments(assessments.filter((a) => a.id !== assessId));
    if (editingAssessment && editingAssessment.id === assessId) {
      setEditingAssessment(null);
      resetForm();
    }
    toast.success("Assessment deleted locally!");
  };

  const handleAddNewQuestion = () => {
    if (editingIndex !== null) {
      // Edit existing question
      const updated = [...newQuestions];
      updated[editingIndex] = {
        text: currentQuestionText,
        options: [...currentOptions],
        answer: currentAnswer,
      };
      setNewQuestions(updated);
      setEditingIndex(null);
    } else {
      // Add new question
      setNewQuestions([
        ...newQuestions,
        {
          text: currentQuestionText,
          options: [...currentOptions],
          answer: currentAnswer,
        },
      ]);
    }
    // Reset form and hide it
    setCurrentQuestionText("");
    setCurrentOptions(["", "", ""]);
    setCurrentAnswer("");
  };

  const handleEditQuestion = (qIdx) => {
    const question = newQuestions[qIdx];
    setCurrentQuestionText(question.text);
    setCurrentOptions([...question.options]);
    setCurrentAnswer(question.answer);
    setEditingIndex(qIdx);
    setShowQuestionForm(true);
  };

  const handleDeleteNewQuestion = (qIdx) => {
    const updated = [...newQuestions];
    updated.splice(qIdx, 1);
    setNewQuestions(updated);
  };

  const handleSaveAssessment = async () => {
    if (!assessmentTitle) return console.log("Assessment title required");
    const assessmentRequest = {
      courseId: parseInt(id),
      title: assessmentTitle,
      description: assessmentDescription,
      questions: newQuestions.filter(q => q.text.trim() !== "" || q.options.some(opt => opt.trim() !== "") || q.answer.trim() !== ""), // Filter out completely empty questions
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };
    if (assessmentRequest.questions.length === 0) {
      toast.error("Please add at least one question to the assessment.");
      return;
    }
    try {
      if (editingAssessment) {
        await axios.put(`${API_BASE}/assessments/${editingAssessment.id}`, assessmentRequest);
        toast.success("Assessment updated successfully!");
      } else {
        await axios.post(`${API_BASE}/assessments`, assessmentRequest);
        toast.success("New assessment saved successfully!");
      }
      resetForm();
      // Refetch assessments
      const res = await axios.get(`${API_BASE}/assessments/course/${id}`);
      const data = res.data || [];
      const parsedAssessments = data.map(assess => ({
        ...assess,
        questions: JSON.parse(assess.questionsJson || '[]')
      }));
      setAssessments(parsedAssessments);
      setOriginalAssessments(parsedAssessments);
    } catch (err) {
      console.error(err);
      toast.error("Error saving assessment");
    }
  };

  const handleSaveAssessments = async () => {
    try {
      // Prepare the list of assessments, using form data for the currently edited assessment
      const assessmentRequests = assessments.map(a => {
        if (editingAssessment && a.id === editingAssessment.id) {
          return {
            courseId: parseInt(id),
            title: assessmentTitle,
            description: assessmentDescription,
            questions: newQuestions.filter(q => q.text.trim() !== "" || q.options.some(opt => opt.trim() !== "") || q.answer.trim() !== ""),
            createdBy: currentUser.id,
            updatedBy: currentUser.id,
          };
        } else {
          return {
            courseId: parseInt(id),
            title: a.title,
            description: a.description,
            questions: a.questions,
            createdBy: currentUser.id,
            updatedBy: currentUser.id,
          };
        }
      }).filter(a => a.questions && a.questions.length > 0); // Only save assessments with questions

      // Save all assessments via bulk update
      await axios.put(`${API_BASE}/assessments/course/${id}`, assessmentRequests);

      // Refetch assessments to get updated data with proper IDs
      const res = await axios.get(`${API_BASE}/assessments/course/${id}`);
      const data = res.data || [];
      const parsedAssessments = data.map(assess => ({
        ...assess,
        questions: JSON.parse(assess.questionsJson || '[]')
      }));
      setAssessments(parsedAssessments);
      setOriginalAssessments(parsedAssessments);
      resetForm();
      toast.success("All assessments saved successfully!");
      navigate("/instructor-dashboard");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        toast.error("You do not have permission to update this course's assessments.");
      } else if (err.response && err.response.status === 400) {
        toast.error("Invalid assessment data. Please check titles and questions.");
      } else {
        toast.error("Error saving assessments");
      }
    }
  };



  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-2xl mt-10">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center">
        <FaEdit className="mr-2" style={{verticalAlign: 'middle'}} /> Edit Assessments
      </h2>

      <div className="border p-4 rounded bg-gray-50">
        <h3 className="font-semibold">Assessments</h3>
        <ul>
          {assessments.map((assess, idx) => (
            <li key={assess.id} className="flex justify-between items-center p-1 bg-gray-100 rounded mb-1">
              <span>{assess.title} ({assess.questions.length} questions)</span>
              <div className="flex space-x-2">
                <button type="button" onClick={() => handleEditAssessment(assess)} className="text-blue-600">
                  <FaEdit style={{verticalAlign: 'middle'}} />
                </button>
                <button type="button" onClick={() => handleDeleteAssessment(assess.id)} className="text-red-600">
                  <FaTrash style={{verticalAlign: 'middle'}} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Assessment section - only show when editing */}
      {editingAssessment && (
        <div className="p-6 border rounded-lg bg-white shadow-md mt-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center"><FaEdit className="mr-2 text-blue-600" style={{verticalAlign: 'middle'}} /> Update Assessment</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Title</label>
            <input
              type="text"
              placeholder="Enter assessment title"
              value={assessmentTitle}
              onChange={(e) => setAssessmentTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Enter assessment description"
              value={assessmentDescription}
              onChange={(e) => setAssessmentDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>
          {/* Question form */}
          {showQuestionForm && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-4 shadow-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">{editingIndex !== null ? 'Edit Question' : 'Add New Question'}</h4>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <input
                  placeholder="Enter the question"
                  value={currentQuestionText}
                  onChange={(e) => setCurrentQuestionText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                {currentOptions.map((opt, oIdx) => (
                  <input
                    key={oIdx}
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...currentOptions];
                      updated[oIdx] = e.target.value;
                      setCurrentOptions(updated);
                    }}
                    className="w-full border border-gray-300 rounded-md p-3 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <input
                  placeholder="Enter the correct answer"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleAddNewQuestion}
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-semibold shadow-md"
                >
                  {editingIndex !== null ? <><FaEdit className="inline mr-1" style={{verticalAlign: 'middle'}} /> Update Question</> : <><FaPlus className="inline mr-1" style={{verticalAlign: 'middle'}} /> Add Question</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(false)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-semibold shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {/* List of added questions */}
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-3 text-gray-800">Questions ({newQuestions.length})</h4>
            {newQuestions.length === 0 ? (
              <p className="text-gray-500 italic">No questions added yet. Click "Add Question" to get started.</p>
            ) : (
              <div className="space-y-3">
                {newQuestions.map((q, qIdx) => (
                  <div key={qIdx} className={`p-4 border rounded-lg bg-gray-50 shadow-sm ${editingIndex === qIdx ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-1">Q{qIdx + 1}: {q.text}</p>
                        <div className="text-sm text-gray-600">
                          <p><strong>Options:</strong> {q.options.join(', ')}</p>
                          <p><strong>Answer:</strong> {q.answer}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          type="button"
                          onClick={() => handleEditQuestion(qIdx)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          <FaEdit className="inline mr-1" style={{verticalAlign: 'middle'}} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNewQuestion(qIdx)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          <FaTrash className="inline mr-1" style={{verticalAlign: 'middle'}} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Add Question Button */}
          <div className="flex justify-start items-center mb-4">
            <button
              type="button"
              onClick={() => {
                setCurrentQuestionText("");
                setCurrentOptions(["", "", ""]);
                setCurrentAnswer("");
                setEditingIndex(null);
                setShowQuestionForm(true);
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold shadow-md"
            >
              <FaPlus className="inline mr-2" style={{verticalAlign: 'middle'}} /> Add Question
            </button>
          </div>
        </div>
      )}

      {/* Save Assessment */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleSaveAssessments}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg font-semibold"
        >
          <FaCheck className="inline mr-2" style={{verticalAlign: 'middle'}} /> Save Assessment
        </button>
      </div>
    </div>
  );
};

export default EditCourseAssessments;
