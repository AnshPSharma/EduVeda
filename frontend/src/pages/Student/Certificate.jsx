import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

const API_BASE = "/api/v1";

export default function Certificate() {
  const { courseId } = useParams();
  const { currentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't proceed if no user or no courseId
    if (!currentUser?.id || !courseId) {
      setLoading(false);
      return;
    }

    const checkEligibility = async () => {
      try {
        // Fetch course details
        const courseRes = await axios.get(`${API_BASE}/courses/${courseId}`);
        setCourse(courseRes.data);

        // Get all resources and assessments for this course
        const resourcesRes = await axios.get(`${API_BASE}/courses/${courseId}/resources`);
        const resources = resourcesRes.data || [];

        const assessmentsRes = await axios.get(`${API_BASE}/assessments/course/${courseId}`);
        const assessments = assessmentsRes.data || [];

        const totalItems = resources.length + assessments.length;

        // Debug: Show what resources and assessments we found
        console.log(
          "Resources:",
          resources.map((r) => ({ id: r.id, title: r.title }))
        );
        console.log(
          "Assessments:",
          assessments.map((a) => ({ id: a.id, title: a.title }))
        );
        console.log("All Item IDs:", [
          ...resources.map((r) => String(r.id)),
          ...assessments.map((a) => String(a.id)),
        ]);

        // Get progress for this course
        const [moduleProgressRes, assessmentProgressRes] = await Promise.all([
          axios.get(`${API_BASE}/module-progress?user_id=${currentUser.id}&course_id=${courseId}`),
          axios.get(`${API_BASE}/assessment-progress?user_id=${currentUser.id}&course_id=${courseId}`)
        ]);

        const moduleProgressData = moduleProgressRes.data.module_progress || moduleProgressRes.data || [];
        const assessmentProgressData = assessmentProgressRes.data || [];

        // Debug logging
        console.log("📊 Certificate Eligibility Check:");
        console.log("Total Items (resources + assessments):", totalItems);
        console.log("Module Progress Entries:", moduleProgressData.length);
        console.log("Assessment Progress Entries:", assessmentProgressData.length);
        console.log("Module Progress Data:", moduleProgressData);
        console.log("Assessment Progress Data:", assessmentProgressData);

        // Count completed resources
        const completedResources = moduleProgressData.filter(p => p.completed === true || p.completed === "true").length;

        // Count passed assessments
        const passedAssessments = assessmentProgressData.filter(ap => ap.passed === true || ap.passed === "true").length;

        const completedItems = completedResources + passedAssessments;
        console.log("Completed Resources:", completedResources);
        console.log("Passed Assessments:", passedAssessments);
        console.log("Total Completed Items:", completedItems);

        // Check if 100% complete
        const percentage =
          totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        console.log("Completion Percentage:", percentage + "%");

        // Check if completed (allow for rounding errors)
        const isComplete = completedItems >= totalItems;
        console.log(
          "Is Eligible:",
          isComplete,
          `(${completedItems} >= ${totalItems})`
        );

        setIsEligible(isComplete);
        setLoading(false);
      } catch (err) {
        console.error("Error checking eligibility:", err);
        setLoading(false);
      }
    };

    checkEligibility();
  }, [currentUser?.id, courseId]); // Only re-run when user ID or courseId changes

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert(
      "Certificate download feature coming soon! For now, you can take a screenshot."
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl text-center">
          <svg
            className="w-20 h-20 mx-auto text-yellow-500 mb-6"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Certificate Not Available
          </h2>
          <p className="text-gray-600 mb-8">
            You need to complete 100% of the course to earn your certificate.
            Keep learning!
          </p>
          <button
            onClick={() => navigate(`/course-player/${courseId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={() => navigate(currentUser?.role === "Instructor" ? "/instructor-home" : "/student/learning-dashboard")}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 shadow"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 shadow"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-8 border-double border-amber-600">
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 h-4"></div>

          <div className="p-12 md:p-16 relative">
            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-amber-400"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-amber-400"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-amber-400"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-amber-400"></div>

            {/* Content */}
            <div className="text-center relative z-10">
              {/* Logo/Badge */}
              <div className="mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-800 mb-4">
                Certificate of Completion
              </h1>

              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-8"></div>

              <p className="text-lg text-gray-600 mb-8">
                This is to certify that
              </p>

              <h2 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-8">
                {currentUser?.name || "Student Name"}
              </h2>

              <p className="text-lg text-gray-600 mb-4">
                has successfully completed the course
              </p>

              <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">
                {course?.title || "Course Title"}
              </h3>

              <p className="text-gray-600 mb-12">
                Completed with dedication and excellence on{" "}
                <span className="font-semibold">{today}</span>
              </p>

              {/* Signatures */}
              <div className="flex justify-around items-end mt-16">
                <div className="text-center">
                  <div className="border-t-2 border-gray-800 pt-2 px-8">
                    <p className="font-serif text-2xl font-bold text-gray-800">
                      Edu-Veda
                    </p>
                    <p className="text-sm text-gray-600">Platform</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-800 pt-2 px-8">
                    <p className="font-serif text-2xl font-bold text-gray-800">
                      {course?.instructor || "Instructor"}
                    </p>
                    <p className="text-sm text-gray-600">Course Instructor</p>
                  </div>
                </div>
              </div>

              {/* Certificate ID */}
              <div className="mt-12 text-xs text-gray-500 font-mono">
                Certificate ID: EDU-{courseId}-{currentUser?.id}-{Date.now()}
              </div>
            </div>
          </div>

          {/* Decorative Footer */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 h-4"></div>
        </div>

        {/* Share Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 print:hidden">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Share Your Achievement
          </h3>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
            <button className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              Twitter
            </button>
            <button className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
