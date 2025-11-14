import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import YouTube from "react-youtube";
import { FaCheck, FaTrophy, FaTimesCircle, FaCheckCircle, FaPlay, FaBook, FaChartLine, FaClock, FaArrowLeft, FaLock, FaUnlock, FaDownload } from "react-icons/fa";

import { AppContext } from "../../context/AppContext";

const QuizResults = ({ result, onRetry, onNext, onBackToDashboard, hasNext }) => {
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-lg border border-blue-200">
      <div className="text-center">
        <div className="mb-6">
          {result.passed ? (
            <FaTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
          ) : (
            <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          )}
        </div>
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          {result.passed ? "Congratulations!" : "Better Luck Next Time!"}
        </h2>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaChartLine className="text-blue-500" />
            <p className="text-xl font-semibold text-gray-700">Score: {result.score}</p>
          </div>
          <p className="text-lg text-gray-600">Percentage: {result.percentage.toFixed(1)}%</p>
        </div>
        <div className="flex justify-center gap-4">
          {result.passed ? (
            <>
              <button
                onClick={onBackToDashboard}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2 shadow-md"
              >
                <FaCheckCircle />
                Back to Dashboard
              </button>
              {hasNext && (
                <button
                  onClick={onNext}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center gap-2 shadow-md"
                >
                  <FaPlay />
                  Next Assessment
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onRetry}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition duration-300 flex items-center gap-2 shadow-md"
            >
              <FaPlay />
              Retry Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PassedQuiz = ({ assessmentProgress, onReattempt, onNext, onBackToDashboard, hasNext }) => {
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl shadow-lg border border-green-200">
      <div className="text-center">
        <div className="mb-6">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          Quiz Already Passed!
        </h2>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaChartLine className="text-green-500" />
            <p className="text-xl font-semibold text-gray-700">Score: {assessmentProgress.score}/{assessmentProgress.maxScore}</p>
          </div>
          <p className="text-lg text-gray-600">Percentage: {assessmentProgress.percentage.toFixed(1)}%</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onReattempt}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition duration-300 flex items-center gap-2 shadow-md"
          >
            <FaPlay />
            Reattempt Quiz
          </button>
          <button
            onClick={onBackToDashboard}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2 shadow-md"
          >
            <FaCheckCircle />
            Back to Dashboard
          </button>
          {hasNext && (
            <button
              onClick={onNext}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center gap-2 shadow-md"
            >
              <FaPlay />
              Next Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const API_BASE = "/api/v1";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AppContext);

  const [course, setCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [resources, setResources] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [progress, setProgress] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [assessmentProgress, setAssessmentProgress] = useState([]);

  useEffect(() => {
    if (!currentUser) navigate("/");
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!courseId) return;

    // Load progress from localStorage if available
    const storedProgress = localStorage.getItem(`progress-${courseId}`);
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }

    Promise.all([
      axios.get(`${API_BASE}/courses/${courseId}`),
      axios.get(`${API_BASE}/assessments/course/${courseId}`),
      axios.get(`${API_BASE}/courses/${courseId}/resources`)
    ]).then(([courseRes, assessmentsRes, resourcesRes]) => {
      const courseData = courseRes.data;
      const assessmentsData = assessmentsRes.data;
      const resourcesData = resourcesRes.data;

      setCourse(courseData);
      setAssessments(assessmentsData);
      setResources(resourcesData);

      // Fetch progress after course data is loaded
      let progressMap = {};
      const resourceIds = resourcesData.map(r => r.id);
      const assessmentIds = assessmentsData.map(a => a.id);

      axios.get(`${API_BASE}/module-progress/user/${currentUser.id}/course/${courseId}`)
        .then(res => {
          const progressData = res.data.module_progress || res.data;
          const filteredProgress = progressData.filter(p => resourceIds.includes(p.resource_id));
          filteredProgress.forEach(p => {
            progressMap["resource-" + p.resource_id] = p.completed;
          });
          setProgress({ ...progressMap });
          localStorage.setItem(`progress-${courseId}`, JSON.stringify(progressMap));
        })
        .catch(err => console.error("Error fetching module progress:", err))
        .then(() => {
          return axios.get(`${API_BASE}/assessment-progress?user_id=${currentUser.id}&course_id=${courseId}`)
            .then(res => {
              const assessmentProgressData = res.data;
              const filteredAssessmentProgress = assessmentProgressData.filter(ap => assessmentIds.includes(ap.assessmentId));
              setAssessmentProgress(filteredAssessmentProgress);
              filteredAssessmentProgress.forEach(ap => {
                progressMap["assessment-" + ap.assessmentId] = ap.passed;
              });
              setProgress({ ...progressMap });
              localStorage.setItem(`progress-${courseId}`, JSON.stringify(progressMap));
            })
            .catch(err => console.error("Error fetching assessment progress:", err));
        });
    }).catch(err => console.error("Error fetching course data:", err));
  }, [courseId, currentUser]);

  useEffect(() => {
    if (!course) return;
    const combined = [...(resources || []), ...(assessments || [])];
    setPlaylist(combined);
    if (combined.length > 0) setActiveItem(combined[0]);
  }, [course, resources, assessments]);

  const isAssessment = (item) => item.questions !== undefined;

  const handleAnswerChange = (qIdx, value) => {
    setAnswers({ ...answers, [qIdx]: value });
  };

  const onClickNext = () => {
    setSelectedAnswerIndex(null);

    if (activeQuestion !== activeItem.questions.length - 1) {
      setActiveQuestion((prev) => prev + 1);
    } else {
      setActiveQuestion(0);
    }
  };

  const onAnswerSelected = (answer, index) => {
    setSelectedAnswerIndex(index);
  };



  const handleSubmitQuiz = () => {
    const allAnswered = activeItem.questions.every((_, idx) => answers[idx] !== undefined);
    if (!allAnswered) {
      console.log("Please answer all questions before submitting.");
      return;
    }

    let scoreCount = 0;
    activeItem.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) scoreCount++;
    });
    const percentage = (scoreCount / activeItem.questions.length) * 100;
    const passed = percentage >= 70; // Assuming 70% pass mark
    const scoreStr = `${scoreCount}/${activeItem.questions.length}`;
    setScore(scoreStr);

    // Save assessment progress
    axios.post(`${API_BASE}/assessment-progress`, {
      userId: currentUser.id,
      assessmentId: activeItem.id,
      courseId: parseInt(courseId),
      score: scoreCount,
      maxScore: activeItem.questions.length,
      percentage: percentage,
      passed: passed,
      attemptNumber: 1, // For simplicity, assuming first attempt
      completedAt: passed ? new Date().toISOString() : null,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    }).then(() => {
      // Update progress map
      const newProgress = { ...progress, ["assessment-" + activeItem.id]: passed };
      setProgress(newProgress);
      localStorage.setItem(`progress-${courseId}`, JSON.stringify(newProgress));
      setQuizResult({ passed, score: scoreStr, percentage });
      setTimeout(() => checkCourseCompletion(), 100);
    }).catch(err => console.error("Error saving assessment progress:", err));
  };

  const handleMarkComplete = () => {
    // Mark as completed in progress
    const newProgress = { ...progress, ["resource-" + activeItem.id]: true };
    setProgress(newProgress);
    localStorage.setItem(`progress-${courseId}`, JSON.stringify(newProgress));
    // Update backend
    axios.post(`${API_BASE}/module-progress`, {
      userId: currentUser.id,
      resourceId: activeItem.id,
      courseId: parseInt(courseId),
      completed: true,
      completedAt: new Date().toISOString(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    }).then(() => {
      // Check if course is completed after marking complete
      setTimeout(() => checkCourseCompletion(), 100);
    }).catch(err => console.error("Error updating progress:", err));
  };

  const handleRetryQuiz = () => {
    setAnswers({});
    setScore(null);
    setQuizResult(null);
  };

  const handleReattemptQuiz = () => {
    setAnswers({});
    setScore(null);
    setQuizResult(null);
  };

  const handleNextAssessment = () => {
    const currentIndex = playlist.findIndex(item => item.id === activeItem.id);
    const nextAssessment = playlist.slice(currentIndex + 1).find(item => isAssessment(item));
    if (nextAssessment) {
      setActiveItem(nextAssessment);
      setAnswers({});
      setScore(null);
      setQuizResult(null);
    }
  };

  const checkCourseCompletion = () => {
    const totalResources = resources.length;
    const totalAssessments = assessments.length;
    const completedResources = resources.filter(r => progress["resource-" + r.id]).length;
    const passedAssessments = assessments.filter(a => progress["assessment-" + a.id]).length;
    const isComplete = completedResources === totalResources && passedAssessments === totalAssessments;
    if (isComplete) {
      navigate(`/certificate/${courseId}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/student-home");
  };

  const hasNextAssessment = (() => {
    const currentIndex = playlist.findIndex(item => item.id === activeItem.id);
    return playlist.slice(currentIndex + 1).some(item => isAssessment(item));
  })();

  if (!course || !playlist) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Course</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{course?.title}</h1>
              <p className="text-sm text-gray-500">Continue your learning journey</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {Object.values(progress).filter(Boolean).length === resources.length + assessments.length && (
              <button
                onClick={() => navigate(`/certificate/${courseId}`)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaDownload className="text-sm" />
                Download Certificate
              </button>
            )}
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-lg font-semibold text-gray-900">
                {Object.values(progress).filter(Boolean).length}/{resources.length + assessments.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              {/* Course Overview */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Lectures</span>
                    <span className="font-medium">{resources.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quizzes</span>
                    <span className="font-medium">{assessments.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Duration</span>
                    <span className="font-medium">
                      {resources.reduce((acc, res) => acc + parseInt(res.duration || 0), 0)} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Lectures Section */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FaPlay className="text-blue-500 text-sm" />
                  Lectures
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {resources.map((item, index) => {
                    const isCompleted = progress["resource-" + item.id];
                    const isActive = activeItem?.id === item.id;
                    return (
                      <div
                        key={`resource-${item.id}`}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 border-2 border-blue-200"
                            : "hover:bg-gray-50 border-2 border-transparent"
                        } ${isCompleted ? "bg-green-50" : ""}`}
                        onClick={() => {
                          setActiveItem(item);
                          setAnswers({});
                          setScore(null);
                          setQuizResult(null);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : isActive
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}>
                              {isCompleted ? <FaCheck className="text-xs" /> : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                isActive ? "text-blue-900" : "text-gray-900"
                              }`}>
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <FaClock className="text-xs" />
                                {item.duration}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quizzes Section */}
              {assessments.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FaBook className="text-purple-500 text-sm" />
                    Quizzes
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {assessments.map((item, index) => {
                      const isCompleted = progress["assessment-" + item.id];
                      const isActive = activeItem?.id === item.id;
                      return (
                        <div
                          key={`assessment-${item.id}`}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            isActive
                              ? "bg-purple-50 border-2 border-purple-200"
                              : "hover:bg-gray-50 border-2 border-transparent"
                          } ${isCompleted ? "bg-green-50" : ""}`}
                          onClick={() => {
                            setActiveItem(item);
                            setAnswers({});
                            setScore(null);
                            setQuizResult(null);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                isCompleted
                                  ? "bg-green-500 text-white"
                                  : isActive
                                  ? "bg-purple-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}>
                                {isCompleted ? <FaCheck className="text-xs" /> : <FaBook className="text-xs" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  isActive ? "text-purple-900" : "text-gray-900"
                                }`}>
                                  {item.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.questions?.length || 0} questions
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeItem ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {isAssessment(activeItem) ? (
                  (() => {
                    const currentAssessmentProgress = assessmentProgress.find(ap => ap.assessmentId === activeItem.id);
                    if (currentAssessmentProgress && currentAssessmentProgress.passed) {
                      return (
                        <div className="p-8">
                          <PassedQuiz
                            assessmentProgress={currentAssessmentProgress}
                            onReattempt={handleReattemptQuiz}
                            onNext={handleNextAssessment}
                            onBackToDashboard={handleBackToDashboard}
                            hasNext={hasNextAssessment}
                          />
                        </div>
                      );
                    } else {
                      return quizResult ? (
                        <div className="p-8">
                          <QuizResults
                            result={quizResult}
                            onRetry={handleRetryQuiz}
                            onNext={handleNextAssessment}
                            onBackToDashboard={handleBackToDashboard}
                            hasNext={hasNextAssessment}
                          />
                        </div>
                      ) : (
                        <div className="p-8">
                          <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeItem.title}</h2>
                            <p className="text-gray-600">{activeItem.questions?.length || 0} questions • Pass mark: 70%</p>
                          </div>
                          <div className="space-y-6">
                            {activeItem.questions.map((q, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                  {idx + 1}. {q.text}
                                </h3>
                                <div className="space-y-3">
                                  {q.options.map((opt, oIdx) => (
                                    <label
                                      key={oIdx}
                                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                        answers[idx] === opt
                                          ? "bg-blue-100 border-2 border-blue-300"
                                          : "hover:bg-gray-100 border-2 border-transparent"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`q${idx}`}
                                        value={opt}
                                        checked={answers[idx] === opt}
                                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                        className="w-4 h-4 text-blue-600"
                                      />
                                      <span className="text-gray-700">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 flex justify-center">
                            <button
                              onClick={handleSubmitQuiz}
                              disabled={quizResult !== null}
                              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                quizResult !== null
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                              }`}
                            >
                              Submit Quiz
                            </button>
                          </div>
                        </div>
                      );
                    }
                  })()
                ) : activeItem.youtubeId ? (
                  <div>
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeItem.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {activeItem.duration} minutes
                        </span>
                        {progress["resource-" + activeItem.id] && (
                          <span className="flex items-center gap-1 text-green-600">
                            <FaCheckCircle />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <YouTube
                        videoId={activeItem.youtubeId}
                        opts={{
                          width: "100%",
                          height: "500",
                          playerVars: {
                            origin: window.location.origin,
                          },
                        }}
                        onEnd={() => {
                          // Mark as completed in progress
                          const newProgress = { ...progress, ["resource-" + activeItem.id]: true };
                          setProgress(newProgress);
                          localStorage.setItem(`progress-${courseId}`, JSON.stringify(newProgress));
                          // Update backend
                          axios.post(`${API_BASE}/module-progress`, {
                            userId: currentUser.id,
                            resourceId: activeItem.id,
                            courseId: parseInt(courseId),
                            completed: true,
                            completedAt: new Date().toISOString(),
                            createdBy: currentUser.id,
                            updatedBy: currentUser.id,
                          }).then(() => {
                            // Check if course is completed after video end
                            setTimeout(() => checkCourseCompletion(), 100);
                          }).catch(err => console.error("Error updating progress:", err));
                        }}
                      />
                    </div>
                    {!progress["resource-" + activeItem.id] && (
                      <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Mark as Complete</h3>
                            <p className="text-sm text-gray-600">Click when you've finished watching the video</p>
                          </div>
                          <button
                            onClick={handleMarkComplete}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <FaCheck />
                            Complete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FaPlay className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Video not available</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FaPlay className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a lecture or quiz</h3>
                <p className="text-gray-600">Choose from the sidebar to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
