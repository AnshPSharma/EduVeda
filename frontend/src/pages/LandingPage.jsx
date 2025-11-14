import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../../tree3.png";
import { FaChalkboardTeacher, FaLaptopCode, FaGlobe } from "react-icons/fa";
import { AppContext } from "../context/AppContext";

const LandingPage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const { currentUser } = useContext(AppContext);

  useEffect(() => {
    axios
      .get("/api/v1/courses?_limit=3")
      .then((res) => setFeaturedCourses(res.data.courses || res.data))
      .catch((err) => console.error("Error fetching featured courses:", err));
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative text-center py-24 bg-gradient-to-r from-purple-100 via-indigo-50 to-pink-100 shadow-md rounded-b-[3rem] overflow-hidden">
        {/* floating decorative shapes */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-20 -right-12 w-56 h-56 bg-pink-300 rounded-full opacity-20 blur-3xl"></div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-snug relative z-10">
          Learn Anytime, Anywhere{" "}
          <img
            src={logo}
            alt="Tree Icon"
            className="w-14 h-14 inline-block ml-0 relative -top-1"
          />
        </h1>
        <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto relative z-10">
          Unlock your potential with top-rated courses taught by expert
          instructors. Education made simple, engaging, and accessible for all.
        </p>
        <div className="mt-8 flex justify-center space-x-4 relative z-10">
          <Link
            to={currentUser ? "/student-home" : "/login"}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg transform hover:scale-105 hover:shadow-xl transition"
          >
            Browse Courses
          </Link>
          {!currentUser && (
            <Link
              to="/register"
              className="px-7 py-3 rounded-full bg-white text-indigo-600 border-2 border-indigo-600 font-semibold shadow-md hover:bg-indigo-50 hover:scale-105 transition"
            >
              Join Now
            </Link>
          )}
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-white text-center">
        <blockquote className="text-2xl italic text-gray-700 max-w-3xl mx-auto">
          “Education is the most powerful weapon which you can use to change the
          world.”
        </blockquote>
        <p className="mt-4 font-semibold text-gray-600">— Nelson Mandela</p>
      </section>

      {/* Why Choose EduVeda Section (New Section) */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Why Choose EduVeda?
        </h2>
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transform hover:scale-[1.02] transition duration-300">
            <FaChalkboardTeacher className="mx-auto text-5xl text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Expert Instructors
            </h3>
            <p className="text-gray-500">
              Learn from industry leaders and passionate educators with
              real-world experience.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transform hover:scale-[1.02] transition duration-300">
            <FaLaptopCode className="mx-auto text-5xl text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Hands-On Learning
            </h3>
            <p className="text-gray-500">
              Gain practical skills through interactive courses and real-world
              projects.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transform hover:scale-[1.02] transition duration-300">
            <FaGlobe className="mx-auto text-5xl text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Learn Anywhere
            </h3>
            <p className="text-gray-500">
              Access courses on any device, anytime, and from anywhere in the
              world.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-14">
          🌟 Featured Courses
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {featuredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover shadow-sm"
              />
              <div className="p-6">
                {/* optional category/tag */}
                <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full mb-3">
                  Popular
                </span>
                <h3 className="text-lg font-semibold text-gray-800">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 mb-3">
                  by {course.instructor}
                </p>
                <p className="font-bold text-indigo-600">{course.price}</p>
                <Link
                  to={`/courses/${course.id}`}
                  className="block mt-5 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-full font-semibold hover:from-indigo-600 hover:to-purple-600 transition"
                >
                  Explore Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center mt-20 rounded-t-[3rem] border-t-4 border-purple-600/40">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} EduVeda. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;