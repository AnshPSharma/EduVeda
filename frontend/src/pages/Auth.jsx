import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import styles from "./Auth.module.css";
import axios from "axios";

const API_BASE = "/api/v1";

const Auth = () => {
  const location = useLocation();
  const [isActive, setIsActive] = useState(location.pathname === "/register");
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  // Update the active state when the location changes
  useEffect(() => {
    setIsActive(location.pathname === "/register");
  }, [location]);

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup states
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState("Student");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username: loginEmail,
        password: loginPassword,
      });

      if (res.data && res.data.role) {
        login(res.data, res.data.token);
        toast.success("Login successful!");

        if (res.data.role === "Instructor") {
          navigate("/instructor-home");
        } else {
          navigate("/student-home");
        }
      } else {
        toast.error("Login failed: Unexpected response");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          toast.error(err.response.data || "Validation error from server");
        } else if (err.response.status === 401) {
          toast.error(err.response.data || "Invalid email or password");
        } else {
          toast.error(`Server error: ${err.response.status}`);
        }
      } else {
        toast.error("Network error: unable to reach server");
      }
      console.error("Login failed:", err);
    }
  };

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
      // Reset signup form and switch to login
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupRole("Student");
      setIsActive(false);
    } catch (err) {
      // Handling server-side errors, e.g., if the POST itself fails due to validation/conflict
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
      <div
        className={`${styles.authContainer} ${isActive ? styles.active : ""}`}
      >
        {/* Login Form */}
        <div className={`${styles.formBox} ${styles.login}`}>
          <form onSubmit={handleLogin} autoComplete="off">
            <h1>Login</h1>
            <div className={styles.inputBox}>
              <input
                type="email"
                name="login-email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="off"
                required
              />
              <i className="bx bxs-envelope"></i>
            </div>
            <div className={styles.inputBox}>
              <input
                type="password"
                name="login-password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className={styles.forgotLink}>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit" className={styles.authBtn}>
              Login
            </button>
            <p>or login with social platforms</p>
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
          </form>
        </div>

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
          </form>
        </div>

        {/* Toggle Box */}
        <div className={styles.toggleBox}>
          <div className={`${styles.togglePanel} ${styles.toggleLeft}`}>
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button
              className={styles.authBtn}
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
          <div className={`${styles.togglePanel} ${styles.toggleRight}`}>
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button
              className={styles.authBtn}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
