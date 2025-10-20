
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import Toast from "../components/Toast";
import logo from "../assets/logo.png";
import useThemeColor from "../hooks/useThemeColor";

const colors = {
  oceanBlue: "#2772A0",
  cloudySky: "#CCDDEA",
  white: "#FFFFFF",
  darkText: "#1E293B",
};

const Input = (props) => (
  <input
    {...props}
    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${colors.oceanBlue}] focus:border-transparent outline-none transition`}
  />
);

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [localMessage, setLocalMessage] = useState({ message: "", type: "" });
  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage({ message: "", type: "" });

    if (newPassword.length < 8)
      return setLocalMessage({
        message: "Password must be at least 8 characters.",
        type: "error",
      });
    if (!passwordsMatch)
      return setLocalMessage({
        message: "Passwords do not match.",
        type: "error",
      });

    setIsProcessing(true);

    try {
      await resetPassword(uidb64, token, newPassword, confirmPassword);
      setLocalMessage({
        message: "Password has been reset successfully!",
        type: "success",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const apiError = err.response?.data?.new_password?.[0] || err.message || "Failed to reset password. Please try again.";
      setLocalMessage({ message: apiError, type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4"
      style={{ backgroundColor: colors.cloudySky }}
    >
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md mt-10 mb-16">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="EduChainAI Logo" className="h-14 w-14" />
        </div>
        <h2 className="text-2xl font-bold text-center text-[#1E293B] mb-6">Reset Your Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New Password (min 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="8"
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {!passwordsMatch && confirmPassword && (
            <p className="text-red-500 text-sm">Passwords must match.</p>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${isProcessing ? "bg-gray-400" : "bg-[#2772A0] hover:bg-[#1f5b80]"}`}
            disabled={isProcessing}
          >
            {isProcessing ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordPage;
