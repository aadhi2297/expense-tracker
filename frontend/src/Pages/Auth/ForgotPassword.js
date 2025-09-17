import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState(""); // store reset URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
      toast.success(data.message);
      setResetLink(data.previewURL || "");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <Toaster position="top-right" />
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {resetLink && (
        <div className="reset-link-container">
          <p>Tap the button below to reset your password:</p>
          <a
            href={resetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="reset-btn"
          >
            Reset Password
          </a>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
