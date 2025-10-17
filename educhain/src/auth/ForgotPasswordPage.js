import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import Toast from "../components/Toast";
import logo from "../assets/logo.png";

const colors = {
  oceanBlue: "#2772A0",
  cloudySky: "#CCDDEA",
  white: "#FFFFFF",
  darkText: "#1E293B",
};

const Input = (props) => (
  <input
    {...props}
    className={`w-full p-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm 
      focus:ring-2 focus:ring-[${colors.oceanBlue}] focus:border-transparent 
      outline-none transition shadow-sm`}
  />
);

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [localMessage, setLocalMessage] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage({ message: "", type: "" });
    setIsProcessing(true);

    try {
      await forgotPassword(email);
      setLocalMessage({
        message: "Password reset link sent to your email!",
        type: "success",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const apiError =
        err.response?.data?.email?.[0] ||
        err.message ||
        "Failed to send reset link. Please try again.";
      setLocalMessage({ message: apiError, type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4"
      style={{
        background: "linear-gradient(to bottom, #F7EEC9, #A3E2E4)",
      }}
    >
      <div className="backdrop-blur-md bg-white/70 shadow-xl rounded-2xl p-8 w-full max-w-md mt-10 mb-16 border border-white/30">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="EduChainAI Logo" className="h-14 w-14" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-[#1E293B] mb-4">
          Forgot Your Password?
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we’ll send you a link to reset your
          password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              isProcessing
                ? "bg-gray-400"
                : "bg-[#2772A0] hover:bg-[#1f5b80] shadow-md hover:shadow-lg"
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/login" className="text-[#2772A0] hover:underline text-sm">
            Back to Login
          </a>
        </div>

        <Toast
          message={localMessage.message}
          type={localMessage.type}
          onClose={() => setLocalMessage({ message: "", type: "" })}
        />

        <p className="text-center text-sm text-gray-500 mt-6">
          © {new Date().getFullYear()} EduChainAI. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
