import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./auth.css";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter a new password");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );
      toast.success(data.message);
      setPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div
      className="auth-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#000", // optional dark background
      }}
    >
      <Toaster position="top-right" />
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#1a1a1a",
          padding: "30px",
          borderRadius: "8px",
          textAlign: "center",
          boxShadow: "0 0 15px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: "20px" }}>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#ffcc00",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
