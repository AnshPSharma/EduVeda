import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/v1/auth/login", {
        username: email,
        password,
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

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
