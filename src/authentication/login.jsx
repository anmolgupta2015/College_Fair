import React, { useState } from "react";
import { auth } from "../firebase/config";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [userCredentials, setUserCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setUserCredentials({ ...userCredentials, [e.target.name]: e.target.value });
  }

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    signInWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
      .then((userCredential) => {
        navigate("/profile");
      })
      .catch((error) => {
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error.code === "auth/invalid-email") {
          errorMessage = "Invalid email format. Please enter a valid email.";
        } else if (error.code === "auth/user-not-found") {
          errorMessage = "No account found with this email. Please sign up.";
        } else if (error.code === "auth/wrong-password") {
          errorMessage = "Incorrect password. Please try again.";
        } else if (error.code === "auth/too-many-requests") {
          errorMessage = "Too many login attempts. Please try again later.";
        }
        setError(errorMessage);
      });
  }

  function handleResetPassword() {
    const email = prompt("Enter your email for password reset:");
    if (email) {
      sendPasswordResetEmail(auth, email)
        .then(() => alert("Password reset email sent!"))
        .catch((error) => setError("Failed to send reset email. Please check your email and try again."));
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9FAFC] px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-[#212121] text-center">Continue Your Journey</h2>
        <p className="text-sm text-gray-500 text-center mt-2">Log in to explore new opportunities</p>
        {error && <div className="bg-[#E53935] text-white p-2 rounded-md text-sm mt-3">{error}</div>}
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-[#212121] font-medium">Email</label>
            <input
              onChange={handleChange}
              name="email"
              type="email"
              placeholder="johndoe@example.com"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
              required
            />
          </div>
          <div>
            <label className="block text-[#212121] font-medium">Password</label>
            <input
              onChange={handleChange}
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0056D2] text-white font-semibold py-2 rounded-lg hover:bg-[#0045A5] transition-all shadow-md"
          >
            Log In
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-4">
          Don't have an account? <a href="/signup" className="text-[#FF9800] font-medium hover:underline">Sign Up</a>
        </p>
        <p
          onClick={handleResetPassword}
          className="text-center text-[#FF9800] text-sm mt-3 cursor-pointer hover:underline"
        >
          Forgot Password?
        </p>
      </div>
    </div>
  );
};

export default LoginPage;