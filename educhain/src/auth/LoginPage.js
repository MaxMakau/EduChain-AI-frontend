// ---------------- LOGIN & SIGNUP PAGE (Aesthetic White Form + Gradient BG) ----------------

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signupUser } from "../api/auth";
import Toast from "../components/Toast";
import { FcGoogle } from "react-icons/fc";
import logo from "../assets/logo.png";

const colors = {
  oceanBlue: "#2772A0",
  cloudySky: "#CCDDEA",
  white: "#FFFFFF",
  darkText: "#1E293B",
};

// ---------------------------------- INPUT COMPONENT ----------------------------------
const Input = (props) => (
  <input
    {...props}
    className={`w-full p-3 border border-gray-200 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-[${colors.oceanBlue}] focus:border-transparent outline-none transition duration-200 hover:shadow-md`}
  />
);

// ---------------------------------- SIGNUP FORM ----------------------------------
function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [localMessage, setLocalMessage] = useState({ message: "", type: "" });

  const { login } = useAuth();
  const navigate = useNavigate();
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    setSchoolsLoading(true);
    fetch(process.env.REACT_APP_API_URL + "/schools/all/")
      .then((res) => res.json())
      .then((data) => {
        setSchools(data);
        setSchoolsLoading(false);
      })
      .catch(() => setSchoolsLoading(false));
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLocalMessage({ message: "", type: "" });

    if (password.length < 8)
      return setLocalMessage({
        message: "Password must be at least 8 characters.",
        type: "error",
      });
    if (!passwordsMatch)
      return setLocalMessage({
        message: "Passwords do not match.",
        type: "error",
      });
    if (!role)
      return setLocalMessage({
        message: "Please select a role.",
        type: "error",
      });

    if (role === "TEACHER" && !schoolId)
      return setLocalMessage({
        message: "Please select your school.",
        type: "error",
      });

    setIsProcessing(true);
    try {
      await signupUser({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
        ...(phoneNumber && { phone_number: phoneNumber }),
        ...(role === "TEACHER" && { school: schoolId }),
      });

      const userProfile = await login(email, password);
      if (userProfile.role === "HEADTEACHER" && !userProfile.school) {
        navigate("/register-school", { replace: true });
        return;
      }

      navigate(
        userProfile.role
          ? `/dashboard/${userProfile.role.toLowerCase()}`
          : "/onboarding",
        { replace: true }
      );

      setLocalMessage({
        message: "Account created successfully!",
        type: "success",
      });
    } catch (err) {
      const apiError =
        err.response?.data?.email?.[0] ||
        err.response?.data?.role?.[0] ||
        err.message ||
        "Signup failed. Please try again.";
      setLocalMessage({ message: apiError, type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const LOGIN_ROLES = [
    { value: "HEADTEACHER", label: "Headteacher" },
    { value: "TEACHER", label: "Teacher" },
    { value: "OFFICER", label: "County Officer" },
  ];

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <Input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        type="tel"
        placeholder="Phone Number (optional)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      <select
        className={`w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-[${colors.oceanBlue}] transition hover:shadow-md`}
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      >
        <option value="">Select Role</option>
        {LOGIN_ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {role === "TEACHER" && (
        <select
          className={`w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-[${colors.oceanBlue}] transition hover:shadow-md`}
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          required
        >
          <option value="">Select School</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name} ({school.code})
            </option>
          ))}
        </select>
      )}

      <Input
        type="password"
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength="8"
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {!passwordsMatch && confirmPassword && (
        <p className="text-red-500 text-sm">Passwords must match.</p>
      )}

      <button
        type="submit"
        className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-md ${
          isProcessing
            ? "bg-gray-400"
            : "bg-[#2772A0] hover:bg-[#1f5b80] hover:shadow-lg hover:scale-[1.02]"
        }`}
        disabled={isProcessing}
      >
        {isProcessing ? "Creating Account..." : "Sign Up"}
      </button>

      <button
        type="button"
        onClick={() => alert("Google signup coming soon!")}
        className="w-full py-3 rounded-xl border border-gray-300 bg-white/90 flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <FcGoogle size={22} /> Sign up with Google
      </button>

      <Toast
        message={localMessage.message}
        type={localMessage.type}
        onClose={() => setLocalMessage({ message: "", type: "" })}
      />
    </form>
  );
}

// ---------------------------------- LOGIN FORM ----------------------------------
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [localMessage, setLocalMessage] = useState({ message: "", type: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userProfile = await login(email, password);
      if (userProfile.role) {
        navigate(`/dashboard/${userProfile.role.toLowerCase()}`, {
          replace: true,
        });
      } else {
        navigate("/onboarding", { replace: true });
      }
    } catch (err) {
      setLocalMessage({
        message: err.message || "Login failed. Try again.",
        type: "error",
      });
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-md ${
          isLoading
            ? "bg-gray-400"
            : "bg-[#2772A0] hover:bg-[#1f5b80] hover:shadow-lg hover:scale-[1.02]"
        }`}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Log In"}
      </button>

      <button
        type="button"
        onClick={() => alert("Google login coming soon!")}
        className="w-full py-3 rounded-xl border border-gray-300 bg-white/90 flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <FcGoogle size={22} /> Log in with Google
      </button>

      <div className="text-center mt-3">
        <a
          href="/forgot-password"
          className="text-[#2772A0] hover:underline text-sm"
        >
          Forgot password?
        </a>
      </div>

      <Toast
        message={localMessage.message}
        type={localMessage.type}
        onClose={() => setLocalMessage({ message: "", type: "" })}
      />
    </form>
  );
}

// ---------------------------------- PAGE WRAPPER ----------------------------------
const LoginPage = () => {
  const [tab, setTab] = useState("login");

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4"
      style={{
        background: "linear-gradient(to bottom, #F7EEC9, #A3E2E4)",
      }}
    >
      {/* CARD */}
      <div className="backdrop-blur-lg bg-white/95 shadow-2xl rounded-3xl p-10 w-full max-w-md mt-10 mb-16 border border-white/40">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="EduChainAI Logo" className="h-14 w-14" />
        </div>

        {/* Tabs */}
        <div className="flex justify-center space-x-6 mb-6">
          <button
            className={`pb-2 border-b-2 transition ${
              tab === "login"
                ? "border-[#2772A0] text-[#2772A0] font-semibold"
                : "border-transparent text-gray-600 hover:text-[#2772A0]"
            }`}
            onClick={() => setTab("login")}
          >
            Log In
          </button>
          <button
            className={`pb-2 border-b-2 transition ${
              tab === "signup"
                ? "border-[#2772A0] text-[#2772A0] font-semibold"
                : "border-transparent text-gray-600 hover:text-[#2772A0]"
            }`}
            onClick={() => setTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {tab === "login" ? <LoginForm /> : <SignupForm />}

        <p className="text-center text-sm text-gray-500 mt-6">
          © {new Date().getFullYear()} EduChainAI. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
