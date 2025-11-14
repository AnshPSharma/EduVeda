import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Auth.module.css";
import axios from "axios";

const API_BASE = "/api/v1";

const Register = () => {
  const navigate = useNavigate();

  // Signup states
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState("Student");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupName || !signupEmail || !signupPassword || !signupRole) {
      toast.error("All fields are required");
      return;
    }

    // Validate email format (any valid email, not restricted to specific domains)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(signupPassword)) {
      toast.error(
        "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character"
      );
      return;
    }

    try {
      const newUser = {
        name: signupName,
        role: signupRole,
        email: signupEmail,
        password: signupPassword,
        username: signupEmail, // for login compatibility
      };

      await axios.post(`${API_BASE}/auth/register`, newUser);
      toast.success("Account created successfully!");
      // Reset form
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupRole("Student");
      navigate("/login");
    } catch (err) {
      // Handling server-side errors
      if (err.response && err.response.data) {
        toast.error(err.response.data);
      } else {
        toast.error("Something went wrong. Try again.");
      }
      console.error("Signup failed:", err);
    }
  };

  return (
    <div className={styles.authBody}>
      <div className={styles.authContainer}>
        {/* Registration Form */}
        <div className={`${styles.formBox} ${styles.register}`}>
          <form onSubmit={handleSignup} autoComplete="off">
            <h1>Registration</h1>
            <div className={styles.inputBox}>
              <input
                type="text"
                name="signup-name"
                placeholder="Full Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                autoComplete="off"
                required
              />
              <i className="bx bxs-user"></i>
            </div>

            {/* Role Selection with Radio Buttons */}
            <div className={styles.roleSelection}>
              <label className={styles.roleLabel}>I want to sign up as:</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="signup-role"
                    value="Student"
                    checked={signupRole === "Student"}
                    onChange={(e) => setSignupRole(e.target.value)}
                  />
                  <span className={styles.radioText}>
                    <i className="bx bxs-graduation"></i> Student
                  </span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="signup-role"
                    value="Instructor"
                    checked={signupRole === "Instructor"}
                    onChange={(e) => setSignupRole(e.target.value)}
                  />
                  <span className={styles.radioText}>
                    <i className="bx bxs-chalkboard"></i> Instructor
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.inputBox}>
              <input
                type="email"
                name="signup-email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                autoComplete="off"
                required
              />
              <i className="bx bxs-envelope"></i>
            </div>
            <div className={styles.inputBox}>
              <input
                type="password"
                name="signup-password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <button type="submit" className={styles.authBtn}>
              Register
            </button>
            <p>or register with social platforms</p>
            <div className={styles.socialIcons}>
              <a href="#">
                <i className="bx bxl-google"></i>
              </a>
              <a href="#">
                <i className="bx bxl-facebook"></i>
              </a>
              <a href="#">
                <i className="bx bxl-github"></i>
              </a>
              <a href="#">
                <i className="bx bxl-linkedin"></i>
              </a>
            </div>
            <p>
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
